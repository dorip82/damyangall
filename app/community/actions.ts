"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { COMMUNITY_CATEGORIES } from "@/lib/community/categories";

const CATEGORY_VALUES = COMMUNITY_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
];

const postSchema = z.object({
  category: z.enum(CATEGORY_VALUES),
  authorName: z.string().trim().min(1, "이름을 입력해주세요").max(50),
  title: z.string().trim().min(1, "제목을 입력해주세요").max(200),
  content: z.string().trim().min(1, "내용을 입력해주세요").max(5000),
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
    })
    .select("id")
    .single();

  if (error || !post) {
    return { ok: false, error: "등록 중 오류가 발생했습니다." };
  }

  revalidatePath("/community");
  redirect(`/community/${post.id}`);
}
