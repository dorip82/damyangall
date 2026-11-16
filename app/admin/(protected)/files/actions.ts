"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAssocAction } from "@/lib/assoc/admin";

const fileSchema = z.object({
  category: z.string().trim().min(1).max(50),
  title: z.string().trim().min(1, "자료 제목을 입력해주세요").max(200),
  description: z.string().trim().max(1000).optional(),
  fileUrl: z.string().url(),
  fileName: z.string().trim().min(1).max(255),
  fileSize: z.number().int().nonnegative().nullable(),
});

export async function addSiteFile(siteId: string, input: z.input<typeof fileSchema>) {
  const { site, config } = await requireAssocAction(siteId);
  const parsed = fileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  const v = parsed.data;
  if (!config.fileCategories.includes(v.category)) return { ok: false, error: "분류를 선택해주세요." };
  // 이 사이트 폴더에 올린 파일만 등록할 수 있다
  if (!v.fileUrl.includes(`/site-assets/${site.id}/`)) return { ok: false, error: "업로드한 파일만 등록할 수 있습니다." };
  const supabase = await createClient();
  const { error } = await supabase.from("site_files").insert({
    site_id: site.id,
    category: v.category,
    title: v.title,
    description: v.description || null,
    file_url: v.fileUrl,
    file_name: v.fileName,
    file_size: v.fileSize,
  });
  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function toggleSiteFile(siteId: string, id: string, published: boolean) {
  const { site } = await requireAssocAction(siteId);
  const supabase = await createClient();
  const { error } = await supabase.from("site_files").update({ is_published: published }).eq("id", id).eq("site_id", site.id);
  revalidatePath("/", "layout");
  return { ok: !error };
}

export async function deleteSiteFile(siteId: string, id: string) {
  const { site } = await requireAssocAction(siteId);
  const supabase = await createClient();
  const { data: file } = await supabase.from("site_files").select("file_url").eq("id", id).eq("site_id", site.id).maybeSingle();
  const { error } = await supabase.from("site_files").delete().eq("id", id).eq("site_id", site.id);
  // 저장소의 실제 파일도 지운다 (실패해도 목록 삭제는 유지)
  const marker = "/storage/v1/object/public/site-assets/";
  if (!error && file?.file_url.includes(marker)) {
    const path = decodeURIComponent(file.file_url.split(marker)[1].split("?")[0]);
    if (path.startsWith(`${site.id}/`)) await supabase.storage.from("site-assets").remove([path]);
  }
  revalidatePath("/", "layout");
  return { ok: !error };
}
