"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createInquiry, type InquiryFormState } from "@/app/site/inquiry/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const initialState: InquiryFormState = { ok: false };

export function InquiryForm({ siteId }: { siteId: string }) {
  const [state, formAction, pending] = useActionState(createInquiry, initialState);

  useEffect(() => {
    if (state === initialState) return;
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <input type="hidden" name="siteId" value={siteId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="authorName">이름</Label>
          <Input id="authorName" name="authorName" maxLength={50} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorContact">연락처 (선택)</Label>
          <Input
            id="authorContact"
            name="authorContact"
            placeholder="답변 받으실 연락처나 이메일"
            maxLength={100}
          />
        </div>
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
        작성하신 글은 별도 로그인 없이 누구나 볼 수 있습니다. 개인정보는 연락처 항목에만 남겨주세요.
      </p>

      <Button type="submit" disabled={pending}>
        {pending ? "등록 중..." : "등록"}
      </Button>
    </form>
  );
}
