"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { isSafeHttpUrl } from "@/lib/utils/safe-url";

const bannerAdSchema = z.object({
  position: z.enum(["LEFT", "RIGHT"]),
  title: z.string().trim().min(1, "제목(내부 식별용)을 입력해주세요").max(100),
  imageUrl: z.string().trim().min(1, "배너 이미지를 등록해주세요"),
  linkUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || isSafeHttpUrl(v), "링크는 http:// 또는 https://로 시작해야 합니다."),
  sortOrder: z.coerce.number().int().default(0),
  status: z.enum(["PUBLISHED", "HIDDEN"]),
});

export interface BannerAdFormState {
  ok: boolean;
  error?: string;
}

export async function createBannerAd(
  _prevState: BannerAdFormState,
  formData: FormData
): Promise<BannerAdFormState> {
  const parsed = bannerAdSchema.safeParse({
    position: formData.get("position"),
    title: formData.get("title"),
    imageUrl: formData.get("imageUrl"),
    linkUrl: formData.get("linkUrl"),
    sortOrder: formData.get("sortOrder"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;

  await requireSuperAdmin();
  const supabase = await createClient();

  const { data: banner, error } = await supabase
    .from("banner_ads")
    .insert({
      position: values.position,
      title: values.title,
      image_url: values.imageUrl,
      link_url: values.linkUrl || null,
      sort_order: values.sortOrder,
      status: values.status,
    })
    .select("id")
    .single();

  if (error || !banner) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/");
  revalidatePath("/directory/admin/ads");
  redirect("/directory/admin/ads");
}

export async function updateBannerAd(
  bannerId: string,
  _prevState: BannerAdFormState,
  formData: FormData
): Promise<BannerAdFormState> {
  const parsed = bannerAdSchema.safeParse({
    position: formData.get("position"),
    title: formData.get("title"),
    imageUrl: formData.get("imageUrl"),
    linkUrl: formData.get("linkUrl"),
    sortOrder: formData.get("sortOrder"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;

  await requireSuperAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("banner_ads")
    .update({
      position: values.position,
      title: values.title,
      image_url: values.imageUrl,
      link_url: values.linkUrl || null,
      sort_order: values.sortOrder,
      status: values.status,
    })
    .eq("id", bannerId);

  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/");
  revalidatePath("/directory/admin/ads");
  revalidatePath(`/directory/admin/ads/${bannerId}`);
  redirect("/directory/admin/ads");
}

export async function deleteBannerAd(bannerId: string) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("banner_ads").delete().eq("id", bannerId);

  revalidatePath("/");
  revalidatePath("/directory/admin/ads");
  redirect("/directory/admin/ads");
}

export async function toggleBannerAdStatus(
  bannerId: string,
  nextStatus: "PUBLISHED" | "HIDDEN"
) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("banner_ads").update({ status: nextStatus }).eq("id", bannerId);

  revalidatePath("/");
  revalidatePath("/directory/admin/ads");
}
