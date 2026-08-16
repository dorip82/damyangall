"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleFavorite } from "@/lib/favorites/actions";
import { cn } from "@/lib/utils";
import type { FavoriteTargetType } from "@/types/database";

export function FavoriteButton({
  targetType,
  targetId,
  initialFavorited,
  isLoggedIn,
  className,
}: {
  targetType: FavoriteTargetType;
  targetId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const next = !favorited;
    setFavorited(next);
    startTransition(async () => {
      const result = await toggleFavorite(targetType, targetId, next);
      if (!result.ok) setFavorited(!next);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={favorited}
      aria-label={favorited ? "즐겨찾기 해제" : "즐겨찾기 추가"}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground/60 shadow-sm transition-colors hover:text-destructive",
        favorited && "text-destructive",
        className
      )}
    >
      <Heart className={cn("size-4", favorited && "fill-current")} aria-hidden />
    </button>
  );
}
