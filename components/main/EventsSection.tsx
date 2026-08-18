import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatEventDateRange } from "@/lib/utils/event-date";

export async function EventsSection() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, location, start_at, end_at, image_url")
    .eq("status", "PUBLISHED")
    .gte("start_at", new Date().toISOString())
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
                <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
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
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{event.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <span>{formatEventDateRange(event.start_at, event.end_at)}</span>
                    {event.location ? (
                      <span className="flex items-center gap-1 truncate">
                        <span aria-hidden>·</span>
                        <MapPin className="size-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{event.location}</span>
                      </span>
                    ) : null}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
