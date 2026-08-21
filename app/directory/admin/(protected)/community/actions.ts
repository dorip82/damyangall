"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { COMMUNITY_CATEGORIES } from "@/lib/community/categories";
import { isSafeHttpUrl } from "@/lib/utils/safe-url";

const CATEGORY_VALUES = COMMUNITY_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
];

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
  status: z.enum(["PUBLISHED", "HIDDEN"]),
});

export interface CommunityEditFormState {
  ok: boolean;
  error?: string;
}

/**
 * Admin-only edit — unlike createCommunityPost (public, no auth) this
 * re-verifies requireSuperAdmin like every other write action here, and can
 * touch every field including status, so a moderator can fix a typo or take
 * down an attachment without deleting the whole post.
 */
export async function updateCommunityPost(
  postId: string,
  _prevState: CommunityEditFormState,
  formData: FormData
): Promise<CommunityEditFormState> {
  const parsed = postSchema.safeParse({
    category: formData.get("category"),
    authorName: formData.get("authorName"),
    title: formData.get("title"),
    content: formData.get("content"),
    imageUrl: formData.get("imageUrl"),
    attachmentUrl: formData.get("attachmentUrl"),
    attachmentName: formData.get("attachmentName"),
    linkUrl: formData.get("linkUrl"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;

  await requireSuperAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("community_posts")
    .update({
      category: values.category as never,
      author_name: values.authorName,
      title: values.title,
      content: values.content,
      image_url: values.imageUrl || null,
      attachment_url: values.attachmentUrl || null,
      attachment_name: values.attachmentUrl ? values.attachmentName || null : null,
      link_url: values.linkUrl || null,
      status: values.status,
    })
    .eq("id", postId);

  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  revalidatePath("/");
  revalidatePath("/directory/admin/community");
  revalidatePath(`/directory/admin/community/${postId}`);
  redirect("/directory/admin/community");
}

export async function toggleCommunityPostVisibility(
  postId: string,
  nextStatus: "PUBLISHED" | "HIDDEN"
) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("community_posts").update({ status: nextStatus }).eq("id", postId);

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  revalidatePath("/directory/admin/community");
  revalidatePath(`/directory/admin/community/${postId}`);
}

export async function deleteCommunityPost(postId: string) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("community_posts").delete().eq("id", postId);

  revalidatePath("/community");
  revalidatePath("/directory/admin/community");
  redirect("/directory/admin/community");
}
