"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteNewsSource } from "@/app/directory/admin/(protected)/news/sources/actions";

export function DeleteNewsSourceButton({ sourceId }: { sourceId: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const message =
      "이 수집처를 삭제하시겠습니까?\n" +
      "이미 수집된 기사는 남지만 사진이 안 보일 수 있습니다. 잠시 멈추려면 삭제 대신 목록에서 스위치를 꺼주세요.";
    if (!confirm(message)) return;
    startTransition(() => {
      deleteNewsSource(sourceId);
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={pending}>
      <Trash2 className="size-4" />
    </Button>
  );
}
