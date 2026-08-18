import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/admin/EventForm";
import { DeleteEventButton } from "@/components/admin/DeleteEventButton";
import { updateEvent } from "@/app/directory/admin/(protected)/events/actions";
import type { EventRow } from "@/types/event";

export default async function EditEventPage({
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
    .maybeSingle<EventRow>();

  if (!event) notFound();

  const boundUpdate = updateEvent.bind(null, event.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">행사 수정</h1>
        <DeleteEventButton eventId={event.id} />
      </div>
      <EventForm event={event} action={boundUpdate} submitLabel="저장" />
    </div>
  );
}
