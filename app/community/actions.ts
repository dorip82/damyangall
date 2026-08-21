"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { COMMUNITY_CATEGORIES } from "@/lib/community/categories";
import { isSafeHttpUrl } from "@/lib/utils/safe-url";

const CATEGORY_VALUES = COMMUNITY_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
];

// This is a public, unauthenticated Server Action — the upload widgets only
// ever populate imageUrl/attachmentUrl with our own community-uploads
// bucket path, but the action itself is just a POST endpoint, so a request
// forged outside the UI could send anything. Pin those two fields to our
// own storage bucket rather than trusting whatever string arrives.
const UPLOAD_URL_PREFIX = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/community-uploads/`;

const postSchema = z.object({
  category: z.enum(CATEGORY_VALUES),
  authorName: z.string().trim().min(1, "이름을 입력해주세요").max(50),
  title: z.string().trim().min(1, "제목을 입력해주세요").max(200),
  content: z.string().trim().min(1, "내용을 입력해주세요").max(5000),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || v.startsWith(UPLOAD_URL_PREFIX), "잘못된 이미지입니다."),
  attachmentUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || v.startsWith(UPLOAD_URL_PREFIX), "잘못된 첨부파일입니다."),
  attachmentName: z.string().trim().max(200).optional(),
  linkUrl: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || isSafeHttpUrl(v), "링크는 http:// 또는 https://로 시작해야 합니다."),
});

export interface CommunityPostFormState {
  ok: boolean;
  error?: string;
}

/**
 * Public write — anyone (including anonymous visitors) can post here, same
 * pattern as site_inquiries: no login required, just a display name.
 */
export async function createCommunityPost(
  _prevState: CommunityPostFormState,
  formData: FormData
): Promise<CommunityPostFormState> {
  const parsed = postSchema.safeParse({
    category: formData.get("category"),
    authorName: formData.get("authorName"),
    title: formData.get("title"),
    content: formData.get("content"),
    imageUrl: formData.get("imageUrl"),
    attachmentUrl: formData.get("attachmentUrl"),
    attachmentName: formData.get("attachmentName"),
    linkUrl: formData.get("linkUrl"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;

  const supabase = await createClient();
  const { data: post, error } = await supabase
    .from("community_posts")
    .insert({
      category: values.category as never,
      author_name: values.authorName,
      title: values.title,
      content: values.content,
      image_url: values.imageUrl || null,
      attachment_url: values.attachmentUrl || null,
      attachment_name: values.attachmentUrl ? values.attachmentName || null : null,
      link_url: values.linkUrl || null,
    })
    .select("id")
    .single();

  if (error || !post) {
    return { ok: false, error: "등록 중 오류가 발생했습니다." };
  }

  revalidatePath("/community");
  redirect(`/community/${post.id}`);
}
