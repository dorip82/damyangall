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
    .limit(3);

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
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
        <div className="grid gap-4 sm:grid-cols-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="aspect-video w-full">
                {event.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                    사진 준비중
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
                  <CalendarDays className="size-3.5" aria-hidden />
                  {formatEventDateRange(event.start_at, event.end_at)}
                </p>
                <p className="mt-1.5 font-semibold text-card-foreground">{event.title}</p>
                {event.location ? (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0" aria-hidden />
                    {event.location}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
