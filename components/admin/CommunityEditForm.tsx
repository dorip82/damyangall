"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { CommunityEditFormState } from "@/app/directory/admin/(protected)/community/actions";
import { updateCommunityPost } from "@/app/directory/admin/(protected)/community/actions";
import { COMMUNITY_CATEGORIES, getCommunityCategoryLabel } from "@/lib/community/categories";
import { getPublishStatusLabel } from "@/lib/utils/status-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CommunityImageField } from "@/components/main/CommunityImageField";
import { CommunityAttachmentField } from "@/components/main/CommunityAttachmentField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database, CommunityCategory } from "@/types/database";

type CommunityPost = Database["public"]["Tables"]["community_posts"]["Row"];

const initialState: CommunityEditFormState = { ok: false };

export function CommunityEditForm({ post }: { post: CommunityPost }) {
  const boundAction = updateCommunityPost.bind(null, post.id);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state === initialState) return;
    if (state.ok) toast.success("저장되었습니다.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="category">게시판</Label>
        <Select name="category" defaultValue={post.category}>
          <SelectTrigger id="category" className="w-48">
            <SelectValue>{(value: CommunityCategory) => getCommunityCategoryLabel(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {COMMUNITY_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="authorName">이름</Label>
        <Input id="authorName" name="authorName" defaultValue={post.author_name} maxLength={50} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" name="title" defaultValue={post.title} maxLength={200} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          name="content"
          rows={8}
          defaultValue={post.content}
          maxLength={5000}
          required
        />
      </div>

      <CommunityImageField defaultValue={post.image_url} />
      <CommunityAttachmentField
        defaultValue={post.attachment_url}
        defaultFileName={post.attachment_name}
      />

      <div className="space-y-2">
        <Label htmlFor="linkUrl">관련 링크</Label>
        <Input
          id="linkUrl"
          name="linkUrl"
          type="url"
          defaultValue={post.link_url ?? ""}
          placeholder="https://..."
          maxLength={2000}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">상태</Label>
        <Select name="status" defaultValue={post.status}>
          <SelectTrigger id="status" className="w-40">
            <SelectValue>{(value: string) => getPublishStatusLabel(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PUBLISHED">게시</SelectItem>
            <SelectItem value="HIDDEN">숨김</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
