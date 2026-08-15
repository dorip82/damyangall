"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSiteRole } from "@/lib/auth/require-site-role";

const siteInfoSchema = z.object({
  siteId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  instagramUrl: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

export interface SiteInfoFormState {
  ok: boolean;
  error?: string;
}

export async function updateSiteInfo(
  _prevState: SiteInfoFormState,
  formData: FormData
): Promise<SiteInfoFormState> {
  const parsed = siteInfoSchema.safeParse({
    siteId: formData.get("siteId"),
    name: formData.get("name"),
    description: formData.get("description"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    instagramUrl: formData.get("instagramUrl"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });

  if (!parsed.success) {
    return { ok: false, error: "입력값을 확인해주세요." };
  }
  const values = parsed.data;

  // Site info + settings are SITE_ADMIN-only writes (spec §7.2/§8) — this is
  // re-verified here even though the layout already gated access, since a
  // Server Action can be invoked directly.
  await requireSiteRole(values.siteId, ["SITE_ADMIN"]);

  const supabase = await createClient();

  const { error: siteError } = await supabase
    .from("sites")
    .update({
      name: values.name,
      description: values.description || null,
      phone: values.phone || null,
      email: values.email || null,
      address: values.address || null,
      instagram_url: values.instagramUrl || null,
    })
    .eq("id", values.siteId);

  if (siteError) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  const { error: settingsError } = await supabase
    .from("site_settings")
    .update({
      seo_title: values.seoTitle || null,
      seo_description: values.seoDescription || null,
    })
    .eq("site_id", values.siteId);

  if (settingsError) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/site-info");
  return { ok: true };
}
