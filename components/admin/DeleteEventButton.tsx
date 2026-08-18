"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteEvent } from "@/app/directory/admin/(protected)/events/actions";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("이 행사를 삭제하시겠습니까?")) return;
    startTransition(() => {
      deleteEvent(eventId);
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={pending}>
      <Trash2 className="size-4" />
    </Button>
  );
}
