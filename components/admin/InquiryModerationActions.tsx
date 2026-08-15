"use client";

import { useTransition } from "react";
import { EyeOff, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  toggleInquiryVisibility,
  deleteInquiry,
} from "@/app/admin/(protected)/inquiries/actions";

export function InquiryModerationActions({
  inquiryId,
  siteId,
  status,
}: {
  inquiryId: string;
  siteId: string;
  status: "PUBLISHED" | "HIDDEN";
}) {
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(() => {
      toggleInquiryVisibility(inquiryId, siteId, status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED");
    });
  }

  function handleDelete() {
    if (!confirm("이 문의글을 삭제하시겠습니까?")) return;
    startTransition(() => {
      deleteInquiry(inquiryId, siteId);
    });
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleToggle} disabled={pending}>
        {status === "PUBLISHED" ? (
          <>
            <EyeOff className="size-4" /> 숨기기
          </>
        ) : (
          <>
            <Eye className="size-4" /> 게시하기
          </>
        )}
      </Button>
      <Button variant="ghost" size="icon" onClick={handleDelete} disabled={pending}>
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
