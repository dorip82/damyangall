"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  replyToInquiry,
  type InquiryReplyState,
} from "@/app/admin/(protected)/inquiries/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const initialState: InquiryReplyState = { ok: false };

export function InquiryReplyForm({
  inquiryId,
  siteId,
  defaultValue,
}: {
  inquiryId: string;
  siteId: string;
  defaultValue?: string;
}) {
  const boundAction = replyToInquiry.bind(null, inquiryId);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state === initialState) return;
    if (state.ok) toast.success("답변이 저장되었습니다.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="siteId" value={siteId} />
      <Label htmlFor="replyContent">답변</Label>
      <Textarea
        id="replyContent"
        name="replyContent"
        rows={5}
        maxLength={5000}
        defaultValue={defaultValue}
        required
      />
      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : "답변 저장"}
      </Button>
    </form>
  );
}
