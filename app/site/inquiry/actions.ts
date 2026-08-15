"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const inquirySchema = z.object({
  siteId: z.string().uuid(),
  authorName: z.string().trim().min(1, "이름을 입력해주세요").max(50),
  authorContact: z.string().trim().max(100).optional(),
  title: z.string().trim().min(1, "제목을 입력해주세요").max(200),
  content: z.string().trim().min(1, "내용을 입력해주세요").max(5000),
});

export interface InquiryFormState {
  ok: boolean;
  error?: string;
}

/**
 * Public write — anyone (including anonymous visitors) can post here, per
 * the site_inquiries_insert_public RLS policy. Everything else in this app
 * restricts writes to site editors; this table is the deliberate exception.
 */
export async function createInquiry(
  _prevState: InquiryFormState,
  formData: FormData
): Promise<InquiryFormState> {
  const parsed = inquirySchema.safeParse({
    siteId: formData.get("siteId"),
    authorName: formData.get("authorName"),
    authorContact: formData.get("authorContact"),
    title: formData.get("title"),
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;

  const supabase = await createClient();
  const { data: inquiry, error } = await supabase
    .from("site_inquiries")
    .insert({
      site_id: values.siteId,
      author_name: values.authorName,
      author_contact: values.authorContact || null,
      title: values.title,
      content: values.content,
    })
    .select("id")
    .single();

  if (error || !inquiry) {
    return { ok: false, error: "등록 중 오류가 발생했습니다." };
  }

  revalidatePath("/inquiry");
  redirect(`/inquiry/${inquiry.id}`);
}
