import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUp, CalendarDays, MapPin, Phone, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalFooter } from "@/components/main/PortalFooter";
import { CopyLinkButton } from "@/components/site/CopyLinkButton";
import { formatEventDateRange } from "@/lib/utils/event-date";
import type { EventRow } from "@/types/event";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("status", "PUBLISHED")
    .maybeSingle<EventRow>();

  if (!event) notFound();

  const [{ data: prevEvent }, { data: nextEvent }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title")
      .eq("status", "PUBLISHED")
      .lt("start_at", event.start_at)
      .order("start_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("events")
      .select("id, title")
      .eq("status", "PUBLISHED")
      .gt("start_at", event.start_at)
      .order("start_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const infoRows = [
    { label: "일시", value: formatEventDateRange(event.start_at, event.end_at), Icon: CalendarDays },
    { label: "장소", value: event.location, Icon: MapPin },
    { label: "문의처", value: event.contact, Icon: Phone },
    { label: "주최/주관", value: event.organizer, Icon: Users },
  ].filter((row) => row.value);

  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16">
          <Link
            href="/events"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            목록으로
          </Link>

          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{event.title}</h1>
            <CopyLinkButton />
          </div>

          {infoRows.length ? (
            <dl className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border">
              {infoRows.map(({ label, value, Icon }) => (
                <div key={label} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <dt className="flex w-24 shrink-0 items-center gap-1.5 font-medium text-muted-foreground">
                    <Icon className="size-4 text-accent" aria-hidden />
                    {label}
                  </dt>
                  <dd className="whitespace-pre-line text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className="mt-6 aspect-video w-full">
            {event.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.image_url}
                alt=""
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
                사진 준비중
              </div>
            )}
          </div>

          {event.description ? (
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-foreground/80">
              {event.description}
            </p>
          ) : null}

          <div className="mt-10 divide-y divide-border border-t border-b border-border">
            {prevEvent ? (
              <Link
                href={`/events/${prevEvent.id}`}
                className="flex items-center gap-3 py-3 text-sm hover:text-accent"
              >
                <ArrowUp className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="shrink-0 text-muted-foreground">이전 행사</span>
                <span className="truncate font-medium">{prevEvent.title}</span>
              </Link>
            ) : null}
            {nextEvent ? (
              <Link
                href={`/events/${nextEvent.id}`}
                className="flex items-center gap-3 py-3 text-sm hover:text-accent"
              >
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="shrink-0 text-muted-foreground">다음 행사</span>
                <span className="truncate font-medium">{nextEvent.title}</span>
              </Link>
            ) : null}
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              href="/events"
              className="rounded-full border border-border px-6 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              목록
            </Link>
          </div>
        </article>
      </main>
      <PortalFooter />
    </div>
  );
}
