"use client";

import { useTransition } from "react";
import { EyeOff, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  toggleCommunityPostVisibility,
  deleteCommunityPost,
} from "@/app/directory/admin/(protected)/community/actions";

export function CommunityModerationActions({
  postId,
  status,
}: {
  postId: string;
  status: "PUBLISHED" | "HIDDEN";
}) {
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(() => {
      toggleCommunityPostVisibility(postId, status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED");
    });
  }

  function handleDelete() {
    if (!confirm("이 글을 삭제하시겠습니까?")) return;
    startTransition(() => {
      deleteCommunityPost(postId);
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
