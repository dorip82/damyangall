"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

const eventSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력해주세요").max(200),
  description: z.string().optional(),
  location: z.string().optional(),
  startAt: z.string().min(1, "시작 일시를 입력해주세요"),
  endAt: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(["PUBLISHED", "HIDDEN"]),
});

export interface EventFormState {
  ok: boolean;
  error?: string;
}

function toIso(value: string | undefined | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function createEvent(
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    imageUrl: formData.get("imageUrl"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;
  const startAtIso = toIso(values.startAt);
  if (!startAtIso) return { ok: false, error: "시작 일시를 확인해주세요." };

  await requireSuperAdmin();
  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      title: values.title,
      description: values.description || null,
      location: values.location || null,
      start_at: startAtIso,
      end_at: toIso(values.endAt),
      image_url: values.imageUrl || null,
      status: values.status,
    })
    .select("id")
    .single();

  if (error || !event) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/directory/admin/events");
  redirect("/directory/admin/events");
}

export async function updateEvent(
  eventId: string,
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const parsed = eventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    imageUrl: formData.get("imageUrl"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;
  const startAtIso = toIso(values.startAt);
  if (!startAtIso) return { ok: false, error: "시작 일시를 확인해주세요." };

  await requireSuperAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({
      title: values.title,
      description: values.description || null,
      location: values.location || null,
      start_at: startAtIso,
      end_at: toIso(values.endAt),
      image_url: values.imageUrl || null,
      status: values.status,
    })
    .eq("id", eventId);

  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/");
  revalidatePath("/directory/admin/events");
  revalidatePath(`/directory/admin/events/${eventId}`);
  redirect("/directory/admin/events");
}

export async function deleteEvent(eventId: string) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("events").delete().eq("id", eventId);

  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/directory/admin/events");
  redirect("/directory/admin/events");
}
