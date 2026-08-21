import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatEventDateBadge } from "@/lib/utils/event-date";

export async function EventsSection() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();
  // "Not finished yet" (end_at, falling back to start_at when there's no
  // end_at) rather than "hasn't started" — otherwise a still-running
  // multi-day exhibition would drop off the homepage once its start date
  // passed, even though it's still on.
  const { data: events } = await supabase
    .from("events")
    .select("id, title, location, start_at, end_at, image_url")
    .eq("status", "PUBLISHED")
    .or(`end_at.gte.${nowIso},and(end_at.is.null,start_at.gte.${nowIso})`)
    .order("start_at", { ascending: true })
    .limit(5);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">행사</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            담양에서 열리는 다양한 행사 소식을 만나보세요.
          </p>
        </div>
        <Link
          href="/events"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          더보기
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      {!events?.length ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/50 px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">예정된 행사가 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/events/${event.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted"
              >
                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {event.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={event.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <CalendarDays className="size-5" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {formatEventDateBadge(event.start_at)}
                    </span>
                    <span className="truncate font-medium text-foreground">{event.title}</span>
                  </div>
                  {event.location ? (
                    <span className="min-w-0 max-w-[45%] truncate text-sm text-muted-foreground">
                      {event.location}
                    </span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
