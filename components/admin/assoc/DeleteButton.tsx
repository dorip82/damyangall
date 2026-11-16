"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** 확인 후 서버 액션(삭제)을 실행하는 버튼 */
export function DeleteButton({
  label = "삭제",
  confirmText,
  action,
  size = "sm",
}: {
  label?: string;
  confirmText: string;
  action: () => Promise<unknown>;
  size?: "sm" | "icon";
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      aria-label={size === "icon" ? label : undefined}
      className="text-destructive"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) start(async () => void (await action()));
      }}
    >
      <Trash2 className="size-4" />
      {size === "icon" ? null : pending ? "삭제 중…" : label}
    </Button>
  );
}
