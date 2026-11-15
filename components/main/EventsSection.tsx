import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatEventDateRange } from "@/lib/utils/event-date";
import { SectionHeading } from "@/components/main/SectionHeading";
import { EmptyBox } from "@/components/main/NewsSection";

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
    .limit(4);

  return (
    <section aria-labelledby="events-title" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:pb-20">
      <SectionHeading
        id="events-title"
        eyebrow="Events"
        title="다가오는 행사"
        description="담양에서 열리는 다양한 행사 소식을 만나보세요."
        href="/events"
      />

      {!events?.length ? (
        <EmptyBox>예정된 행사가 없습니다.</EmptyBox>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((event) => {
            const start = new Date(event.start_at);
            return (
              <li key={event.id}>
                <Link
                  href={`/events/${event.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_10px_rgba(27,42,34,0.05)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(27,42,34,0.12)]"
                >
                  <div className="relative aspect-[16/10] bg-muted">
                    {event.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={event.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <CalendarDays className="size-6" aria-hidden />
                      </div>
                    )}
                    <span
                      aria-hidden
                      className="absolute top-3 left-3 flex flex-col items-center rounded-xl bg-card/95 px-2.5 py-1.5 leading-none text-primary shadow-sm"
                    >
                      <span className="text-[11px] font-semibold">{start.getMonth() + 1}월</span>
                      <span className="mt-0.5 text-lg font-extrabold">{start.getDate()}</span>
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 font-bold leading-snug text-foreground break-keep">
                      {event.title}
                    </h3>
                    <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden />
                      <time dateTime={event.start_at}>{formatEventDateRange(event.start_at, event.end_at)}</time>
                    </p>
                    {event.location ? (
                      <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                        <span className="line-clamp-1">{event.location}</span>
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
