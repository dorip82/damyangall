"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePost } from "@/app/admin/(protected)/posts/actions";

export function DeletePostButton({ postId, siteId }: { postId: string; siteId: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("이 활동내역을 삭제하시겠습니까?")) return;
    startTransition(() => {
      deletePost(postId, siteId);
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={pending}>
      <Trash2 className="size-4" />
    </Button>
  );
}
