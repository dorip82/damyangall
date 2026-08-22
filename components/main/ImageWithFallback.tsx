"use client";

import { useState, type ReactNode } from "react";

/**
 * Scraped news thumbnails point at small external hosts that occasionally
 * reject or time out our fetch — proxied or not, that means a broken-image
 * glyph unless something catches it. Swaps to `fallback` on load failure
 * instead of leaving the native broken-image icon on screen.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  fallback,
}: {
  src: string;
  alt: string;
  className?: string;
  fallback: ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return <>{fallback}</>;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
  );
}
