"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteNews } from "@/app/directory/admin/(protected)/news/actions";

export function DeleteNewsButton({ newsId }: { newsId: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("이 소식을 삭제하시겠습니까?")) return;
    startTransition(() => {
      deleteNews(newsId);
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={pending}>
      <Trash2 className="size-4" />
    </Button>
  );
}
