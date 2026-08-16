"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteListing } from "@/app/directory/admin/(protected)/actions";

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("이 업체 정보를 삭제하시겠습니까?")) return;
    startTransition(() => {
      deleteListing(listingId);
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={pending}>
      <Trash2 className="size-4" />
    </Button>
  );
}
