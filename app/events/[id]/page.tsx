import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalFooter } from "@/components/main/PortalFooter";
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

          <div className="mb-6 aspect-video w-full">
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

          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{event.title}</h1>

          <ul className="mt-4 space-y-2 text-sm text-foreground/80">
            <li className="flex items-center gap-2">
              <CalendarDays className="size-4 text-accent" aria-hidden />
              {formatEventDateRange(event.start_at, event.end_at)}
            </li>
            {event.location ? (
              <li className="flex items-center gap-2">
                <MapPin className="size-4 text-accent" aria-hidden />
                {event.location}
              </li>
            ) : null}
          </ul>

          {event.description ? (
            <p className="mt-6 whitespace-pre-line border-t border-border pt-6 text-base leading-relaxed text-foreground/80">
              {event.description}
            </p>
          ) : null}
        </article>
      </main>
      <PortalFooter />
    </div>
  );
}
