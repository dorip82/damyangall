"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { EventFormState } from "@/app/directory/admin/(protected)/events/actions";
import { getPublishStatusLabel } from "@/lib/utils/status-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ListingImageField } from "@/components/admin/ListingImageField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EventRow } from "@/types/event";

const initialState: EventFormState = { ok: false };

/** ISO string -> "YYYY-MM-DDTHH:mm" in the browser's local time, for a datetime-local input. */
function toLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function EventForm({
  event,
  action,
  submitLabel,
}: {
  event?: EventRow;
  action: (prevState: EventFormState, formData: FormData) => Promise<EventFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state === initialState) return;
    if (state.ok) toast.success("저장되었습니다.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" name="title" defaultValue={event?.title ?? ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">설명</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={event?.description ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startAt">시작 일시</Label>
          <Input
            id="startAt"
            name="startAt"
            type="datetime-local"
            defaultValue={toLocalInputValue(event?.start_at)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endAt">종료 일시</Label>
          <Input
            id="endAt"
            name="endAt"
            type="datetime-local"
            defaultValue={toLocalInputValue(event?.end_at)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">장소</Label>
        <Input id="location" name="location" defaultValue={event?.location ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="organizer">주최/주관</Label>
          <Input id="organizer" name="organizer" defaultValue={event?.organizer ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">문의처</Label>
          <Input
            id="contact"
            name="contact"
            placeholder="전화번호 또는 담당 부서"
            defaultValue={event?.contact ?? ""}
          />
        </div>
      </div>

      <ListingImageField defaultValue={event?.image_url} />

      <div className="space-y-2">
        <Label htmlFor="status">상태</Label>
        <Select name="status" defaultValue={event?.status ?? "PUBLISHED"}>
          <SelectTrigger id="status" className="w-40">
            <SelectValue>{(value: string) => getPublishStatusLabel(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PUBLISHED">게시</SelectItem>
            <SelectItem value="HIDDEN">숨김</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : submitLabel}
      </Button>
    </form>
  );
}
