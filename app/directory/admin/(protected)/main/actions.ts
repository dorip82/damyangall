"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

const settingsSchema = z.object({
  heroTitle: z.string().trim().min(1, "Hero 제목을 입력해주세요").max(100),
  heroSubtitle: z.string().trim().min(1, "Hero 부제목을 입력해주세요").max(300),
  adBannerVisible: z.boolean(),
  adBannerTitle: z.string().trim().min(1).max(50),
  adBannerDescription: z.string().trim().min(1).max(200),
  footerTitle: z.string().trim().min(1, "푸터 제목을 입력해주세요").max(50),
  footerDescription: z.string().trim().min(1, "푸터 설명을 입력해주세요").max(300),
});

export interface MainSettingsFormState {
  ok: boolean;
  error?: string;
}

export async function updateMainPageSettings(
  _prevState: MainSettingsFormState,
  formData: FormData
): Promise<MainSettingsFormState> {
  const parsed = settingsSchema.safeParse({
    heroTitle: formData.get("heroTitle"),
    heroSubtitle: formData.get("heroSubtitle"),
    adBannerVisible: formData.get("adBannerVisible") === "on",
    adBannerTitle: formData.get("adBannerTitle"),
    adBannerDescription: formData.get("adBannerDescription"),
    footerTitle: formData.get("footerTitle"),
    footerDescription: formData.get("footerDescription"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;

  await requireSuperAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("main_page_settings")
    .update({
      hero_title: values.heroTitle,
      hero_subtitle: values.heroSubtitle,
      ad_banner_visible: values.adBannerVisible,
      ad_banner_title: values.adBannerTitle,
      ad_banner_description: values.adBannerDescription,
      footer_title: values.footerTitle,
      footer_description: values.footerDescription,
    })
    .eq("id", 1);

  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  // PortalFooter renders on every public page (community/directory/events/
  // login/news/search/signup, not just "/"), so revalidate the whole tree
  // that shares the root layout instead of just the home page.
  revalidatePath("/", "layout");
  revalidatePath("/directory/admin/main");
  return { ok: true };
}
