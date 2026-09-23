"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { validatePattern, type NewsSourceConfig } from "@/lib/news-scraper/sources";
import { previewNewsSource, type SourcePreview } from "@/lib/news-scraper/run";

const SOURCES_PATH = "/directory/admin/news/sources";

const sourceSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해주세요").max(50, "이름은 50자 이내로 입력해주세요"),
  kind: z.enum(["HTML", "RSS"]),
  listUrl: z
    .string()
    .trim()
    .refine(
      (v) => /^https?:\/\//i.test(v) && URL.canParse(v),
      "주소를 http:// 또는 https:// 로 시작하는 전체 URL로 입력해주세요"
    ),
  charset: z.enum(["utf-8", "euc-kr"]),
  linkPattern: z.string().trim().max(500).optional(),
  datePattern: z.string().trim().max(500).optional(),
  keyword: z.string().trim().max(200).optional(),
  enabled: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

type SourceValues = z.infer<typeof sourceSchema>;

export interface NewsSourceFormState {
  ok: boolean;
  error?: string;
}

function parseForm(
  formData: FormData
): { ok: true; values: SourceValues } | { ok: false; error: string } {
  const parsed = sourceSchema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
    listUrl: formData.get("listUrl"),
    charset: formData.get("charset"),
    linkPattern: formData.get("linkPattern") ?? undefined,
    datePattern: formData.get("datePattern") ?? undefined,
    keyword: formData.get("keyword") ?? undefined,
    enabled: formData.get("enabled") === "on",
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  try {
    if (parsed.data.linkPattern) validatePattern(parsed.data.linkPattern, "기사 링크");
    if (parsed.data.datePattern) validatePattern(parsed.data.datePattern, "작성일");
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
  return { ok: true, values: parsed.data };
}

function toConfig(values: SourceValues): NewsSourceConfig {
  return {
    name: values.name,
    kind: values.kind,
    list_url: values.listUrl,
    charset: values.charset,
    link_pattern: values.kind === "HTML" ? values.linkPattern || null : null,
    date_pattern: values.kind === "HTML" ? values.datePattern || null : null,
    keyword: values.keyword || null,
  };
}

function toRow(values: SourceValues) {
  return { ...toConfig(values), enabled: values.enabled, sort_order: values.sortOrder };
}

export async function createNewsSource(
  _prevState: NewsSourceFormState,
  formData: FormData
): Promise<NewsSourceFormState> {
  const parsed = parseForm(formData);
  if (!parsed.ok) return parsed;

  await requireSuperAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("news_sources").insert(toRow(parsed.values));
  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath(SOURCES_PATH);
  redirect(SOURCES_PATH);
}

export async function updateNewsSource(
  sourceId: string,
  _prevState: NewsSourceFormState,
  formData: FormData
): Promise<NewsSourceFormState> {
  const parsed = parseForm(formData);
  if (!parsed.ok) return parsed;

  await requireSuperAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("news_sources")
    .update(toRow(parsed.values))
    .eq("id", sourceId);
  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath(SOURCES_PATH);
  redirect(SOURCES_PATH);
}

export async function deleteNewsSource(sourceId: string) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("news_sources").delete().eq("id", sourceId);

  revalidatePath(SOURCES_PATH);
  redirect(SOURCES_PATH);
}

export async function toggleNewsSource(sourceId: string, enabled: boolean) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("news_sources").update({ enabled }).eq("id", sourceId);

  revalidatePath(SOURCES_PATH);
}

/**
 * "미리보기" on the source form — runs the scraper against the form's
 * current (possibly unsaved) values without inserting anything, so an admin
 * can tell whether a new site's links/dates are being picked up before
 * turning it on.
 */
export async function previewNewsSourceAction(
  formData: FormData
): Promise<SourcePreview> {
  const parsed = parseForm(formData);
  if (!parsed.ok) return { linksFound: 0, articles: [], error: parsed.error };

  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: existingRows } = await supabase
    .from("news")
    .select("source_url")
    .not("source_url", "is", null);
  const knownUrls = new Set((existingRows ?? []).map((r) => r.source_url as string));

  return previewNewsSource(toConfig(parsed.values), knownUrls);
}
