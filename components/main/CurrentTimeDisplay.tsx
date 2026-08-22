"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
};

/**
 * Ticking clock — starts as null so the server-rendered markup and the
 * client's first render match (a real "now" would differ between them and
 * trigger a hydration mismatch), then fills in and updates once mounted.
 */
export function CurrentTimeDisplay() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // A lazy useState initializer would run during hydration too and
    // produce a different "now" than the server's null render, which is
    // exactly the mismatch this component exists to avoid — the sync set
    // here is what makes the very first client paint match the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  return (
    <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-muted-foreground">
      <Clock className="size-4 shrink-0 text-accent" aria-hidden />
      {now.toLocaleString("ko-KR", TIME_FORMAT)}
    </div>
  );
}
