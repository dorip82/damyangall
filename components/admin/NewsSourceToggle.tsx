"use client";

import { useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleNewsSource } from "@/app/directory/admin/(protected)/news/sources/actions";

export function NewsSourceToggle({ sourceId, enabled }: { sourceId: string; enabled: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={enabled}
      disabled={pending}
      aria-label={enabled ? "자동 수집 끄기" : "자동 수집 켜기"}
      onCheckedChange={(checked) => {
        startTransition(() => toggleNewsSource(sourceId, checked));
      }}
    />
  );
}
