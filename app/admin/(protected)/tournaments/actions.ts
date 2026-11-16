"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAssocAction } from "@/lib/assoc/admin";

export interface AdminFormState {
  ok: boolean;
  error?: string;
}

const optText = z.string().trim().max(5000).optional().transform((v) => v || null);
const optDate = z
  .string()
  .optional()
  .transform((v) => v || null)
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "날짜 형식이 올바르지 않습니다");

const tournamentSchema = z.object({
  siteId: z.string().uuid(),
  title: z.string().trim().min(1, "대회명을 입력해주세요").max(200),
  summary: optText,
  description: optText,
  startDate: optDate,
  endDate: optDate,
  venue: optText,
  applyStart: optDate,
  applyEnd: optDate,
  maxTeams: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v > 0), "모집 팀 수는 1 이상의 숫자로 입력해주세요"),
  division: optText,
  host: optText,
  fee: optText,
  contact: optText,
  posterUrl: optText,
  photoUrls: z.string().max(20000).optional(),
  resultSummary: optText,
  status: z.enum(["PREPARING", "OPEN", "CLOSED", "ONGOING", "FINISHED"]),
  isPublished: z.string().optional(),
});

function parseTournament(fd: FormData) {
  const get = (k: string) => (fd.get(k) as string | null) ?? undefined;
  return tournamentSchema.safeParse({
    siteId: get("siteId"),
    title: get("title"),
    summary: get("summary"),
    description: get("description"),
    startDate: get("startDate"),
    endDate: get("endDate"),
    venue: get("venue"),
    applyStart: get("applyStart"),
    applyEnd: get("applyEnd"),
    maxTeams: get("maxTeams"),
    division: get("division"),
    host: get("host"),
    fee: get("fee"),
    contact: get("contact"),
    posterUrl: get("posterUrl"),
    photoUrls: get("photoUrls"),
    resultSummary: get("resultSummary"),
    status: get("status"),
    isPublished: get("isPublished"),
  });
}

function toRow(v: z.infer<typeof tournamentSchema>) {
  return {
    title: v.title,
    summary: v.summary,
    description: v.description,
    start_date: v.startDate,
    end_date: v.endDate,
    venue: v.venue,
    apply_start: v.applyStart,
    apply_end: v.applyEnd,
    max_teams: v.maxTeams,
    division: v.division,
    host: v.host,
    fee: v.fee,
    contact: v.contact,
    poster_url: v.posterUrl,
    photo_urls: (v.photoUrls ?? "")
      .split(/\r?\n/)
      .map((u) => u.trim())
      .filter((u) => /^(https?:\/\/|\/)/.test(u))
      .slice(0, 100),
    result_summary: v.resultSummary,
    status: v.status,
    is_published: v.isPublished === "on",
  };
}

function revalidateAll(id?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/admin/tournaments");
  if (id) revalidatePath(`/admin/tournaments/${id}`);
}

export async function createTournament(_p: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const parsed = parseTournament(fd);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  const { site } = await requireAssocAction(parsed.data.siteId);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_tournaments")
    .insert({ site_id: site.id, ...toRow(parsed.data) })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: "저장 중 오류가 발생했습니다." };
  revalidateAll();
  redirect(`/admin/tournaments/${data.id}`);
}

export async function updateTournament(id: string, _p: AdminFormState, fd: FormData): Promise<AdminFormState> {
  const parsed = parseTournament(fd);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  const { site } = await requireAssocAction(parsed.data.siteId);
  const supabase = await createClient();
  const { error } = await supabase.from("site_tournaments").update(toRow(parsed.data)).eq("id", id).eq("site_id", site.id);
  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };
  revalidateAll(id);
  return { ok: true };
}

export async function deleteTournament(id: string, siteId: string) {
  const { site } = await requireAssocAction(siteId, ["SITE_ADMIN"]);
  const supabase = await createClient();
  await supabase.from("site_tournaments").delete().eq("id", id).eq("site_id", site.id);
  revalidateAll();
  redirect("/admin/tournaments");
}

// ─── 참가 신청 처리 ───────────────────────────────────────────

export async function setApplicationStatus(
  applicationId: string,
  tournamentId: string,
  siteId: string,
  status: "PENDING" | "APPROVED" | "REJECTED",
  memo?: string
) {
  const { site } = await requireAssocAction(siteId);
  if (!["PENDING", "APPROVED", "REJECTED"].includes(status)) return { ok: false };
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_tournament_applications")
    .update({ status, admin_memo: memo?.slice(0, 1000) || null })
    .eq("id", applicationId)
    .eq("site_id", site.id);
  revalidateAll(tournamentId);
  return { ok: !error };
}

export async function deleteApplication(applicationId: string, tournamentId: string, siteId: string) {
  const { site } = await requireAssocAction(siteId);
  const supabase = await createClient();
  const { error } = await supabase.from("site_tournament_applications").delete().eq("id", applicationId).eq("site_id", site.id);
  revalidateAll(tournamentId);
  return { ok: !error };
}

// ─── 경기 (일정 · 대진 · 결과) ────────────────────────────────

const matchSchema = z.object({
  round: z.string().trim().max(50).default(""),
  matchNo: z.number().int().positive().nullable(),
  scheduledAt: z.string().nullable(),
  court: z.string().trim().max(100).nullable(),
  teamA: z.string().trim().max(100).default(""),
  teamB: z.string().trim().max(100).default(""),
  scoreA: z.number().int().min(0).nullable(),
  scoreB: z.number().int().min(0).nullable(),
  status: z.enum(["SCHEDULED", "LIVE", "FINISHED", "CANCELLED"]),
  note: z.string().trim().max(300).nullable(),
  sortOrder: z.number().int(),
});
export type MatchInput = z.input<typeof matchSchema>;

function matchRow(v: z.infer<typeof matchSchema>) {
  return {
    round: v.round,
    match_no: v.matchNo,
    // datetime-local 값은 한국 시간으로 본다
    scheduled_at: v.scheduledAt ? new Date(`${v.scheduledAt}:00+09:00`).toISOString() : null,
    court: v.court || null,
    team_a: v.teamA,
    team_b: v.teamB,
    score_a: v.scoreA,
    score_b: v.scoreB,
    status: v.status,
    note: v.note || null,
    sort_order: v.sortOrder,
  };
}

export async function saveMatch(
  siteId: string,
  tournamentId: string,
  matchId: string | null,
  input: MatchInput
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const { site } = await requireAssocAction(siteId);
  const parsed = matchSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  if (parsed.data.scheduledAt && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(parsed.data.scheduledAt)) {
    return { ok: false, error: "경기 시간 형식이 올바르지 않습니다." };
  }
  const supabase = await createClient();
  if (matchId) {
    const { error } = await supabase
      .from("site_tournament_matches")
      .update(matchRow(parsed.data))
      .eq("id", matchId)
      .eq("site_id", site.id);
    revalidateAll(tournamentId);
    return error ? { ok: false, error: "저장 중 오류가 발생했습니다." } : { ok: true, id: matchId };
  }
  const { data, error } = await supabase
    .from("site_tournament_matches")
    .insert({ site_id: site.id, tournament_id: tournamentId, ...matchRow(parsed.data) })
    .select("id")
    .single();
  revalidateAll(tournamentId);
  return error || !data ? { ok: false, error: "저장 중 오류가 발생했습니다." } : { ok: true, id: data.id };
}

export async function deleteMatch(siteId: string, tournamentId: string, matchId: string) {
  const { site } = await requireAssocAction(siteId);
  const supabase = await createClient();
  const { error } = await supabase.from("site_tournament_matches").delete().eq("id", matchId).eq("site_id", site.id);
  revalidateAll(tournamentId);
  return { ok: !error };
}
