"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { PostFormState } from "@/app/admin/(protected)/posts/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SitePost } from "@/types/site";
import { STANDARD_POST_CATEGORIES } from "@/lib/site/posts";

const POST_STATUS_LABELS = { DRAFT: "임시저장", PUBLISHED: "게시" } as const;
function getPostStatusLabel(status: string): string {
  return POST_STATUS_LABELS[status as keyof typeof POST_STATUS_LABELS] ?? status;
}

const initialState: PostFormState = { ok: false };

export function PostForm({
  siteId,
  post,
  action,
  submitLabel,
}: {
  siteId: string;
  post?: SitePost;
  action: (prevState: PostFormState, formData: FormData) => Promise<PostFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state === initialState) return;
    if (state.ok) toast.success("저장되었습니다.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  const initialContent =
    post?.content.blocks.find((b) => b.type === "text")?.props.content ?? "";
  const galleryBlock = post?.content.blocks.find((b) => b.type === "gallery");
  const initialPhotos =
    galleryBlock?.type === "gallery" ? galleryBlock.props.images.map((img) => img.url).join("\n") : "";

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <input type="hidden" name="siteId" value={siteId} />

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" name="title" defaultValue={post?.title ?? ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">분류</Label>
        <Input
          id="category"
          name="category"
          list="post-category-options"
          defaultValue={post?.category ?? "활동내역"}
        />
        <datalist id="post-category-options">
          {STANDARD_POST_CATEGORIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <p className="text-xs text-muted-foreground">
          {STANDARD_POST_CATEGORIES.join(" · ")} 중에서 고르면 홈페이지 활동소식의 같은 이름 탭에 정확히 분류됩니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          name="content"
          rows={8}
          defaultValue={initialContent}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoUrl">유튜브 URL</Label>
        <Input
          id="videoUrl"
          name="videoUrl"
          placeholder="https://youtu.be/..."
          defaultValue={post?.video_url ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          입력하면 목록에는 유튜브 썸네일이, 상세 페이지에는 재생 가능한 영상이 표시됩니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photoUrls">활동 사진 URL (선택, 한 줄에 하나)</Label>
        <Textarea
          id="photoUrls"
          name="photoUrls"
          rows={4}
          placeholder={"https://…/photo1.jpg\nhttps://…/photo2.jpg"}
          defaultValue={initialPhotos}
        />
        <p className="text-xs text-muted-foreground">
          입력한 사진은 게시물 아래 갤러리와 &quot;활동 사진&quot; 모음에 표시되고, 누르면 크게 볼 수 있습니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnailUrl">썸네일 이미지 URL (선택)</Label>
        <Input
          id="thumbnailUrl"
          name="thumbnailUrl"
          placeholder="비워두면 유튜브 썸네일을 자동으로 사용합니다"
          defaultValue={post?.thumbnail_url ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">상태</Label>
        <Select name="status" defaultValue={post?.status ?? "DRAFT"}>
          <SelectTrigger id="status" className="w-40">
            <SelectValue>{(value: string) => getPostStatusLabel(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">임시저장</SelectItem>
            <SelectItem value="PUBLISHED">게시</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : submitLabel}
      </Button>
    </form>
  );
}
