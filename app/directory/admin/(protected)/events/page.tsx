import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventDateRange } from "@/lib/utils/event-date";

export default async function AdminEventsListPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, status, start_at, end_at")
    .order("start_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">행사</h1>
        <Button render={<Link href="/directory/admin/events/new" />}>
          <Plus className="size-4" /> 새 행사 등록
        </Button>
      </div>

      {!events?.length ? (
        <p className="text-sm text-muted-foreground">등록된 행사가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/directory/admin/events/${event.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted"
              >
                <div>
                  <p className="font-medium text-foreground">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatEventDateRange(event.start_at, event.end_at)}
                  </p>
                </div>
                <Badge variant={event.status === "PUBLISHED" ? "default" : "outline"}>
                  {event.status === "PUBLISHED" ? "게시됨" : "숨김"}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
