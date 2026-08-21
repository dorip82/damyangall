"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteBannerAd } from "@/app/directory/admin/(protected)/ads/actions";

export function DeleteBannerAdButton({ bannerId }: { bannerId: string }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("이 배너를 삭제하시겠습니까?")) return;
    startTransition(() => {
      deleteBannerAd(bannerId);
    });
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={pending}>
      <Trash2 className="size-4" />
    </Button>
  );
}
