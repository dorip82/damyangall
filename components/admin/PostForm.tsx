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
          defaultValue={post?.category ?? "활동내역"}
        />
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
            <SelectValue />
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
