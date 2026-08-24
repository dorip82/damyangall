"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Logs one page_views row per navigation for the admin "접속통계" page.
 * Skips admin routes themselves so an admin browsing their own dashboard
 * doesn't inflate visitor counts.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/directory/admin")) return;
    fetch("/api/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
