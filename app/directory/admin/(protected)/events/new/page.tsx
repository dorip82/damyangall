import { EventForm } from "@/components/admin/EventForm";
import { createEvent } from "@/app/directory/admin/(protected)/events/actions";

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">새 행사 등록</h1>
      <EventForm action={createEvent} submitLabel="등록" />
    </div>
  );
}
