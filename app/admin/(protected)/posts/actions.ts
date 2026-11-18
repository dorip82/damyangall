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
  photoUrls: z.string().max(10000).optional(),
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || extractYouTubeId(v) !== null, {
      message: "올바른 유튜브 URL이 아닙니다.",
    }),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

/** 첨부파일 목록(JSON). 우리 저장소(site-assets) 주소만, 최대 20개. 형식이 틀리면 빈 목록. */
const attachmentSchema = z
  .array(
    z.object({
      url: z.string().url().max(1000).refine((u) => u.includes("/storage/v1/object/public/site-assets/")),
      name: z.string().min(1).max(200),
      size: z.number().int().nonnegative().optional(),
    })
  )
  .max(20);

function parseBoardExtras(formData: FormData) {
  const raw = formData.get("attachments");
  let attachments: z.infer<typeof attachmentSchema> | undefined;
  if (typeof raw === "string") {
    try {
      const r = attachmentSchema.safeParse(JSON.parse(raw));
      attachments = r.success ? r.data : [];
    } catch {
      attachments = [];
    }
  }
  // 게시판형 폼이 아니면(첨부 입력이 없으면) 두 값 모두 건드리지 않는다.
  return attachments === undefined ? {} : { attachments, is_pinned: formData.get("isPinned") === "on" };
}

export interface PostFormState {
  ok: boolean;
  error?: string;
}

/** 본문 글 + (있으면) 활동 사진 갤러리. 사진 URL은 한 줄에 하나, http(s) 또는 / 로 시작하는 것만. */
function toPageContent(text: string, photoUrls?: string): PageContent {
  const photos = (photoUrls ?? "")
    .split(/\r?\n/)
    .map((u) => u.trim())
    .filter((u) => /^(https?:\/\/|\/)/.test(u))
    .slice(0, 60);
  return {
    version: 1,
    blocks: [
      { id: "block-content", type: "text", props: { content: text } },
      ...(photos.length
        ? [{ id: "block-photos", type: "gallery" as const, props: { images: photos.map((url) => ({ url })) } }]
        : []),
    ],
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
    photoUrls: formData.get("photoUrls") ?? undefined,
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
      content: toPageContent(values.content, values.photoUrls),
      thumbnail_url: values.thumbnailUrl || null,
      video_url: values.videoUrl || null,
      status: values.status,
      ...parseBoardExtras(formData),
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
    photoUrls: formData.get("photoUrls") ?? undefined,
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
      content: toPageContent(values.content, values.photoUrls),
      thumbnail_url: values.thumbnailUrl || null,
      video_url: values.videoUrl || null,
      status: values.status,
      ...parseBoardExtras(formData),
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
