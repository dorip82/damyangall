"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAssocAction } from "@/lib/assoc/admin";
import type { AdminFormState } from "@/app/admin/(protected)/tournaments/actions";

const opt = z.string().trim().max(3000).optional().transform((v) => v || null);
const clubSchema = z.object({
  siteId: z.string().uuid(),
  name: z.string().trim().min(1, "동호회명을 입력해주세요").max(100),
  leader: opt,
  location: opt,
  schedule: opt,
  description: opt,
  imageUrl: opt,
  contact: opt,
  sortOrder: z.coerce.number().int().default(0),
  isRecruiting: z.string().optional(),
  isPublished: z.string().optional(),
});

function parse(fd: FormData) {
  const g = (k: string) => (fd.get(k) as string | null) ?? undefined;
  return clubSchema.safeParse({
    siteId: g("siteId"),
    name: g("name"),
    leader: g("leader"),
    location: g("location"),
    schedule: g("schedule"),
    description: g("description"),
    imageUrl: g("imageUrl"),
    contact: g("contact"),
    sortOrder: g("sortOrder") || 0,
    isRecruiting: g("isRecruiting"),
    isPublished: g("isPublished"),
  });
}

function row(v: z.infer<typeof clubSchema>) {
  return {
    name: v.name,
    leader: v.leader,
    location: v.location,
    schedule: v.schedule,
    description: v.description,
    image_url: v.imageUrl,
    contact: v.contact,
    sort_order: v.sortOrder,
    is_recruiting: v.isRecruiting === "on",
    is_published: v.isPublished === "on",
  };
}

export async function createClub(_p: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const parsed = parse(fd);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  const { site } = await requireAssocAction(parsed.data.siteId);
  const supabase = await createClient();
  const { error } = await supabase.from("site_clubs").insert({ site_id: site.id, ...row(parsed.data) });
  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };
  revalidatePath("/", "layout");
  redirect("/admin/clubs");
}

export async function updateClub(id: string, _p: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const parsed = parse(fd);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  const { site } = await requireAssocAction(parsed.data.siteId);
  const supabase = await createClient();
  const { error } = await supabase.from("site_clubs").update(row(parsed.data)).eq("id", id).eq("site_id", site.id);
  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteClub(id: string, siteId: string) {
  const { site } = await requireAssocAction(siteId);
  const supabase = await createClient();
  await supabase.from("site_clubs").delete().eq("id", id).eq("site_id", site.id);
  revalidatePath("/", "layout");
  redirect("/admin/clubs");
}
