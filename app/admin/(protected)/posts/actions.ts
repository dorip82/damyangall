"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSiteRole } from "@/lib/auth/require-site-role";
import { extractYouTubeId } from "@/lib/utils/youtube";
import type { PageContent } from "@/lib/blocks/types";

const postSchema = z.object({
  siteId: z.string().uuid(),
  title: z.string().min(1, "제목을 입력해주세요"),
  category: z.string().optional(),
  content: z.string().min(1, "내용을 입력해주세요"),
  thumbnailUrl: z.string().optional(),
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || extractYouTubeId(v) !== null, {
      message: "올바른 유튜브 URL이 아닙니다.",
    }),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export interface PostFormState {
  ok: boolean;
  error?: string;
}

function toPageContent(text: string): PageContent {
  return {
    version: 1,
    blocks: [{ id: "block-content", type: "text", props: { content: text } }],
  };
}

export async function createPost(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const parsed = postSchema.safeParse({
    siteId: formData.get("siteId"),
    title: formData.get("title"),
    category: formData.get("category"),
    content: formData.get("content"),
    thumbnailUrl: formData.get("thumbnailUrl"),
    videoUrl: formData.get("videoUrl"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;

  const { userId } = await requireSiteRole(values.siteId, ["SITE_ADMIN", "EDITOR"]);
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("site_posts")
    .insert({
      site_id: values.siteId,
      author_id: userId,
      title: values.title,
      category: values.category || "활동내역",
      content: toPageContent(values.content),
      thumbnail_url: values.thumbnailUrl || null,
      video_url: values.videoUrl || null,
      status: values.status,
      published_at: values.status === "PUBLISHED" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !post) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/", "layout");
  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${post.id}`);
}

export async function updatePost(
  postId: string,
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const parsed = postSchema.safeParse({
    siteId: formData.get("siteId"),
    title: formData.get("title"),
    category: formData.get("category"),
    content: formData.get("content"),
    thumbnailUrl: formData.get("thumbnailUrl"),
    videoUrl: formData.get("videoUrl"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;

  await requireSiteRole(values.siteId, ["SITE_ADMIN", "EDITOR"]);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("site_posts")
    .select("status, published_at")
    .eq("id", postId)
    .maybeSingle();

  const { error } = await supabase
    .from("site_posts")
    .update({
      title: values.title,
      category: values.category || "활동내역",
      content: toPageContent(values.content),
      thumbnail_url: values.thumbnailUrl || null,
      video_url: values.videoUrl || null,
      status: values.status,
      published_at:
        values.status === "PUBLISHED"
          ? (existing?.published_at ?? new Date().toISOString())
          : existing?.published_at ?? null,
    })
    .eq("id", postId)
    .eq("site_id", values.siteId);

  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/", "layout");
  revalidatePath(`/admin/posts/${postId}`);
  revalidatePath("/admin/posts");
  return { ok: true };
}

export async function deletePost(postId: string, siteId: string) {
  await requireSiteRole(siteId, ["SITE_ADMIN", "EDITOR"]);
  const supabase = await createClient();
  await supabase.from("site_posts").delete().eq("id", postId).eq("site_id", siteId);

  revalidatePath("/", "layout");
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}
