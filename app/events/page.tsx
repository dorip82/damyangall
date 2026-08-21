import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalFooter } from "@/components/main/PortalFooter";
import { formatEventDateRange } from "@/lib/utils/event-date";
import type { EventRow } from "@/types/event";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  // A multi-day event (e.g. a months-long exhibition) is still ongoing as
  // long as its end_at hasn't passed, even though its start_at has — so
  // "upcoming" here means "hasn't finished yet" (end_at, falling back to
  // start_at when there's no end_at), not just "hasn't started yet".
  const [{ data: upcoming }, { data: past }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, description, location, start_at, end_at, image_url")
      .eq("status", "PUBLISHED")
      .or(`end_at.gte.${nowIso},and(end_at.is.null,start_at.gte.${nowIso})`)
      .order("start_at", { ascending: true }),
    supabase
      .from("events")
      .select("id, title, description, location, start_at, end_at, image_url")
      .eq("status", "PUBLISHED")
      .or(`end_at.lt.${nowIso},and(end_at.is.null,start_at.lt.${nowIso})`)
      .order("start_at", { ascending: false })
      .limit(20),
  ]);

  const hasAny = Boolean(upcoming?.length) || Boolean(past?.length);

  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">행사</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            담양에서 열리는 다양한 행사 소식을 만나보세요.
          </p>

          {!hasAny ? (
            <p className="text-sm text-muted-foreground">아직 등록된 행사가 없습니다.</p>
          ) : (
            <div className="space-y-12">
              {upcoming?.length ? (
                <EventGrid title="다가오는 행사" events={upcoming} />
              ) : null}
              {past?.length ? <EventGrid title="지난 행사" events={past} muted /> : null}
            </div>
          )}
        </section>
      </main>
      <PortalFooter />
    </div>
  );
}

function EventGrid({
  title,
  events,
  muted,
}: {
  title: string;
  events: Pick<
    EventRow,
    "id" | "title" | "description" | "location" | "start_at" | "end_at" | "image_url"
  >[];
  muted?: boolean;
}) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${muted ? "opacity-70" : ""}`}>
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
    </div>
  );
}
