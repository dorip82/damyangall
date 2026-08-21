"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCommunityPost } from "@/app/directory/admin/(protected)/community/actions";

export function DeleteCommunityPostButton({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("이 글을 삭제하시겠습니까?")) return;
    startTransition(() => {
      deleteCommunityPost(postId);
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={pending}>
      <Trash2 className="size-4" />
    </Button>
  );
}
