"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { triggerNewsFetch } from "@/app/directory/admin/(protected)/news/actions";

export function FetchNewsButton() {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const results = await triggerNewsFetch();
      const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
      const failed = results.filter((r) => r.error);

      if (totalInserted > 0) {
        toast.success(
          `새 소식 ${totalInserted}건을 가져왔습니다. (${results
            .map((r) => `${r.source} ${r.inserted}`)
            .join(", ")})`
        );
      } else if (failed.length) {
        toast.error(`일부 사이트에서 오류가 발생했습니다: ${failed.map((r) => r.source).join(", ")}`);
      } else {
        toast.info("오늘 새로 올라온 담양 소식이 없습니다.");
      }
    });
  }

  return (
    <Button type="button" variant="outline" onClick={handleClick} disabled={pending}>
      <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} aria-hidden />
      {pending ? "수집 중..." : "지금 수집하기"}
    </Button>
  );
}
