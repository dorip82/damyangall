"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";

/**
 * One-click publish/hide toggle for admin list rows — avoids making the
 * admin open a detail page just to flip visibility. `onToggle` is a Server
 * Action reference bound to the row's id, passed down from a Server
 * Component list page (Next.js serializes bound server actions as props).
 */
export function StatusToggleBadge({
  status,
  onToggle,
}: {
  status: "PUBLISHED" | "HIDDEN";
  onToggle: (nextStatus: "PUBLISHED" | "HIDDEN") => Promise<void> | void;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(() => {
      onToggle(status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED");
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="shrink-0 disabled:opacity-50"
      title={status === "PUBLISHED" ? "숨기기" : "게시하기"}
    >
      <Badge variant={status === "PUBLISHED" ? "default" : "outline"}>
        {pending ? "변경 중..." : status === "PUBLISHED" ? "게시됨" : "숨김"}
      </Badge>
    </button>
  );
}
