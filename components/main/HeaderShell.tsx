"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Header frame. With `overlay` (main page only) it sits transparently over the
 * hero image and switches to a solid, readable bar once the page is scrolled;
 * every other page gets the solid sticky bar straight away. Children style
 * themselves off `data-transparent` via `group-data-[transparent=true]:`.
 */
export function HeaderShell({
  overlay,
  children,
}: {
  overlay: boolean;
  children: ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const transparent = overlay && !scrolled;

  return (
    <header
      data-transparent={transparent}
      className={cn(
        "group z-40 w-full transition-[background-color,box-shadow,border-color] duration-200",
        overlay ? "fixed inset-x-0 top-0" : "sticky top-0",
        transparent
          ? "on-dark border-b border-transparent bg-transparent text-ivory"
          : "border-b border-border bg-background/95 text-foreground shadow-[0_1px_8px_rgba(27,42,34,0.06)] backdrop-blur"
      )}
    >
      {children}
    </header>
  );
}
