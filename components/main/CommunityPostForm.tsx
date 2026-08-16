"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createCommunityPost, type CommunityPostFormState } from "@/app/community/actions";
import { COMMUNITY_CATEGORIES } from "@/lib/community/categories";
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

const initialState: CommunityPostFormState = { ok: false };

export function CommunityPostForm() {
  const [state, formAction, pending] = useActionState(createCommunityPost, initialState);

  useEffect(() => {
    if (state === initialState) return;
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="space-y-2">
        <Label htmlFor="category">게시판</Label>
        <Select name="category" defaultValue={COMMUNITY_CATEGORIES[0].value}>
          <SelectTrigger id="category" className="w-48">
            <SelectValue />
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
        <Input id="authorName" name="authorName" maxLength={50} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" name="title" maxLength={200} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <Textarea id="content" name="content" rows={8} maxLength={5000} required />
      </div>

      <p className="text-xs text-muted-foreground">
        작성하신 글은 별도 로그인 없이 누구나 볼 수 있습니다. 개인정보 입력에 유의해주세요.
      </p>

      <Button type="submit" disabled={pending}>
        {pending ? "등록 중..." : "등록"}
      </Button>
    </form>
  );
}
