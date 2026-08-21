"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { NEWS_CATEGORIES } from "@/lib/news/categories";
import { runNewsFetch, type NewsFetchResult } from "@/lib/news-scraper/run";

const CATEGORY_VALUES = NEWS_CATEGORIES.map((c) => c.value) as [string, ...string[]];

const newsSchema = z.object({
  category: z.enum(CATEGORY_VALUES),
  title: z.string().trim().min(1, "제목을 입력해주세요").max(200),
  summary: z.string().optional(),
  content: z.string().trim().min(1, "내용을 입력해주세요").max(10000),
  thumbnailUrl: z.string().optional(),
  status: z.enum(["PUBLISHED", "HIDDEN"]),
});

export interface NewsFormState {
  ok: boolean;
  error?: string;
}

export async function createNews(
  _prevState: NewsFormState,
  formData: FormData
): Promise<NewsFormState> {
  const parsed = newsSchema.safeParse({
    category: formData.get("category"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    content: formData.get("content"),
    thumbnailUrl: formData.get("thumbnailUrl"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;

  await requireSuperAdmin();
  const supabase = await createClient();

  const { data: news, error } = await supabase
    .from("news")
    .insert({
      category: values.category as never,
      title: values.title,
      summary: values.summary || null,
      content: values.content,
      thumbnail_url: values.thumbnailUrl || null,
      status: values.status,
    })
    .select("id")
    .single();

  if (error || !news) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/directory/admin/news");
  redirect("/directory/admin/news");
}

export async function updateNews(
  newsId: string,
  _prevState: NewsFormState,
  formData: FormData
): Promise<NewsFormState> {
  const parsed = newsSchema.safeParse({
    category: formData.get("category"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    content: formData.get("content"),
    thumbnailUrl: formData.get("thumbnailUrl"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;

  await requireSuperAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("news")
    .update({
      category: values.category as never,
      title: values.title,
      summary: values.summary || null,
      content: values.content,
      thumbnail_url: values.thumbnailUrl || null,
      status: values.status,
    })
    .eq("id", newsId);

  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/news");
  revalidatePath(`/news/${newsId}`);
  revalidatePath("/");
  revalidatePath("/directory/admin/news");
  revalidatePath(`/directory/admin/news/${newsId}`);
  redirect("/directory/admin/news");
}

export async function deleteNews(newsId: string) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("news").delete().eq("id", newsId);

  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/directory/admin/news");
  redirect("/directory/admin/news");
}

export async function toggleNewsStatus(newsId: string, nextStatus: "PUBLISHED" | "HIDDEN") {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("news").update({ status: nextStatus }).eq("id", newsId);

  revalidatePath("/news");
  revalidatePath(`/news/${newsId}`);
  revalidatePath("/");
  revalidatePath("/directory/admin/news");
}

/**
 * Manual "지금 수집하기" trigger — same underlying scrape as the daily
 * cron (see app/api/cron/fetch-news), just gated by requireSuperAdmin
 * instead of CRON_SECRET so an admin can run it on demand.
 */
export async function triggerNewsFetch(): Promise<NewsFetchResult[]> {
  await requireSuperAdmin();
  const results = await runNewsFetch();

  revalidatePath("/news");
  revalidatePath("/");
  revalidatePath("/directory/admin/news");
  return results;
}
