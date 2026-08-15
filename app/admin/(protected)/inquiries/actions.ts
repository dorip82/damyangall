"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSiteRole } from "@/lib/auth/require-site-role";

export interface InquiryReplyState {
  ok: boolean;
  error?: string;
}

const replySchema = z.object({
  siteId: z.string().uuid(),
  replyContent: z.string().trim().min(1, "답변 내용을 입력해주세요").max(5000),
});

export async function replyToInquiry(
  inquiryId: string,
  _prevState: InquiryReplyState,
  formData: FormData
): Promise<InquiryReplyState> {
  const parsed = replySchema.safeParse({
    siteId: formData.get("siteId"),
    replyContent: formData.get("replyContent"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;

  await requireSiteRole(values.siteId, ["SITE_ADMIN", "EDITOR"]);
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_inquiries")
    .update({ reply_content: values.replyContent, replied_at: new Date().toISOString() })
    .eq("id", inquiryId)
    .eq("site_id", values.siteId);

  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/inquiry");
  revalidatePath(`/inquiry/${inquiryId}`);
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  return { ok: true };
}

export async function toggleInquiryVisibility(
  inquiryId: string,
  siteId: string,
  nextStatus: "PUBLISHED" | "HIDDEN"
) {
  await requireSiteRole(siteId, ["SITE_ADMIN", "EDITOR"]);
  const supabase = await createClient();
  await supabase
    .from("site_inquiries")
    .update({ status: nextStatus })
    .eq("id", inquiryId)
    .eq("site_id", siteId);

  revalidatePath("/inquiry");
  revalidatePath(`/inquiry/${inquiryId}`);
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${inquiryId}`);
}

export async function deleteInquiry(inquiryId: string, siteId: string) {
  await requireSiteRole(siteId, ["SITE_ADMIN", "EDITOR"]);
  const supabase = await createClient();
  await supabase.from("site_inquiries").delete().eq("id", inquiryId).eq("site_id", siteId);

  revalidatePath("/inquiry");
  revalidatePath("/admin/inquiries");
  redirect("/admin/inquiries");
}
