"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAssocAction } from "@/lib/assoc/admin";
import type { AssocExtraSettings } from "@/lib/assoc/data";

const link = z
  .string()
  .trim()
  .max(500)
  .refine((v) => !v || /^(https?:\/\/|\/)/.test(v), "링크는 / 또는 https:// 로 시작해야 합니다");
const date = z.string().refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "날짜 형식이 올바르지 않습니다");

const schema = z.object({
  popup: z.object({
    enabled: z.boolean(),
    title: z.string().trim().max(100),
    content: z.string().trim().max(1000),
    image: link,
    link,
    startDate: date,
    endDate: date,
  }),
  promos: z
    .array(z.object({ title: z.string().trim().min(1).max(60), description: z.string().trim().max(120), href: link.pipe(z.string().min(1)), image: link }))
    .max(3),
  youtubeUrl: link,
  blogUrl: link,
});

export type BannerSettingsInput = z.input<typeof schema>;

export async function saveBannerSettings(siteId: string, input: BannerSettingsInput) {
  const { site } = await requireAssocAction(siteId, ["SITE_ADMIN"]);
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  const v = parsed.data;
  const supabase = await createClient();
  const { data: current } = await supabase.from("site_settings").select("settings").eq("site_id", site.id).maybeSingle();
  const prev = (current?.settings ?? {}) as Record<string, unknown>;
  const next: AssocExtraSettings & Record<string, unknown> = {
    ...prev,
    popup: {
      enabled: v.popup.enabled,
      title: v.popup.title || undefined,
      content: v.popup.content || undefined,
      image: v.popup.image || undefined,
      link: v.popup.link || undefined,
      startDate: v.popup.startDate || undefined,
      endDate: v.popup.endDate || undefined,
    },
    // 비워 두면(0개) 기본 참여 안내 3개가 보인다
    promos: v.promos.length
      ? v.promos.map((p) => ({ title: p.title, description: p.description || undefined, href: p.href, image: p.image || undefined }))
      : undefined,
    youtubeUrl: v.youtubeUrl || undefined,
    blogUrl: v.blogUrl || undefined,
  };
  const { error } = await supabase
    .from("site_settings")
    .update({ settings: JSON.parse(JSON.stringify(next)) })
    .eq("site_id", site.id);
  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };
  revalidatePath("/", "layout");
  return { ok: true };
}
