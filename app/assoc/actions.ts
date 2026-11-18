"use server";

import { after } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAssocContext } from "@/lib/assoc/data";
import { notifyAdmins } from "@/lib/assoc/notify";

export interface PublicFormState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  /** 문의 접수 후 본인 조회용 번호 */
  inquiryId?: string;
}

const phone = z
  .string()
  .trim()
  .regex(/^[0-9+\-\s()]{8,20}$/, "연락처를 숫자로 정확히 입력해주세요 (예: 010-1234-5678)");

function firstErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// ─── 대회 참가 신청 ────────────────────────────────────────────

const applicationSchema = z.object({
  tournamentId: z.string().uuid("대회를 선택해주세요"),
  teamName: z.string().trim().min(1, "팀명을 입력해주세요").max(100),
  leaderName: z.string().trim().min(1, "대표자 이름을 입력해주세요").max(50),
  phone,
  affiliation: z.string().trim().max(100).optional(),
  players: z.string().max(4000).optional(),
  notes: z.string().trim().max(2000).optional(),
  privacy: z.literal("on", { message: "개인정보 수집·이용에 동의해주세요" }),
  website: z.string().max(0).optional(), // 스팸 방지용 숨은 칸
});

export async function submitApplication(_prev: PublicFormState, formData: FormData): Promise<PublicFormState> {
  const parsed = applicationSchema.safeParse({
    tournamentId: formData.get("tournamentId") ?? "",
    teamName: formData.get("teamName") ?? "",
    leaderName: formData.get("leaderName") ?? "",
    phone: formData.get("phone") ?? "",
    affiliation: formData.get("affiliation") || undefined,
    players: formData.get("players") || undefined,
    notes: formData.get("notes") || undefined,
    privacy: formData.get("privacy") ?? undefined,
    website: formData.get("website") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: "입력 내용을 확인해주세요.", fieldErrors: firstErrors(parsed.error) };
  }
  const v = parsed.data;
  const players = (v.players ?? "")
    .split(/\r?\n|,/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 40)
    .map((p) => p.slice(0, 60));

  const { site } = await getAssocContext();
  const supabase = await createClient();
  const { error } = await supabase.from("site_tournament_applications").insert({
    site_id: site.id,
    tournament_id: v.tournamentId,
    team_name: v.teamName,
    leader_name: v.leaderName,
    phone: v.phone,
    affiliation: v.affiliation || null,
    players,
    notes: v.notes || null,
    privacy_agreed_at: new Date().toISOString(),
  });
  if (error) {
    console.error("submitApplication failed", error);
    return { ok: false, error: "접수하지 못했습니다. 접수 기간인지 확인하시고 잠시 후 다시 시도해주세요." };
  }

  after(() =>
    notifyAdmins({ kind: "tournament_application", siteSlug: site.slug, title: v.teamName, adminPath: "/admin/tournaments" })
  );
  return { ok: true };
}

// ─── 문의하기 (비공개) ─────────────────────────────────────────

const inquirySchema = z.object({
  inquiryType: z.enum(["general", "tournament", "club", "partner"]),
  authorName: z.string().trim().min(1, "이름을 입력해주세요").max(50),
  authorContact: z.string().trim().min(5, "답변 받을 연락처(전화 또는 이메일)를 입력해주세요").max(100),
  title: z.string().trim().min(1, "제목을 입력해주세요").max(180),
  content: z.string().trim().min(1, "내용을 입력해주세요").max(5000),
  privacy: z.literal("on", { message: "개인정보 수집·이용에 동의해주세요" }),
  password: z.string().min(4, "조회 비밀번호를 4자 이상 입력해주세요").max(30, "조회 비밀번호는 30자 이하로 입력해주세요"),
  website: z.string().max(0).optional(),
});

export async function submitInquiry(_prev: PublicFormState, formData: FormData): Promise<PublicFormState> {
  const parsed = inquirySchema.safeParse({
    inquiryType: formData.get("inquiryType") ?? "general",
    authorName: formData.get("authorName") ?? "",
    authorContact: formData.get("authorContact") ?? "",
    title: formData.get("title") ?? "",
    content: formData.get("content") ?? "",
    privacy: formData.get("privacy") ?? undefined,
    password: formData.get("password") ?? "",
    website: formData.get("website") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: "입력 내용을 확인해주세요.", fieldErrors: firstErrors(parsed.error) };
  }
  const v = parsed.data;
  const { site, config } = await getAssocContext();
  const type = config.inquiryTypes.find((t) => t.key === v.inquiryType);
  const supabase = await createClient();
  // 비밀번호는 DB 함수 안에서 bcrypt 로 해시해 저장한다 (0022 마이그레이션).
  const { data: inquiryId, error } = await supabase.rpc("submit_site_inquiry", {
    target_site_id: site.id,
    p_inquiry_type: v.inquiryType,
    p_author_name: v.authorName,
    p_author_contact: v.authorContact,
    p_title: `[${type?.short ?? "일반"}] ${v.title}`.slice(0, 200),
    p_content: v.content,
    p_password: v.password,
  });
  if (error || !inquiryId) {
    console.error("submitInquiry failed", error);
    return { ok: false, error: "문의를 접수하지 못했습니다. 잠시 후 다시 시도해주세요." };
  }
  after(() => notifyAdmins({ kind: "inquiry", siteSlug: site.slug, title: v.title, adminPath: "/admin/inquiries" }));
  return { ok: true, inquiryId };
}

export interface InquiryViewState {
  status: "idle" | "OK" | "WRONG" | "LOCKED" | "NOT_FOUND" | "ERROR";
  data?: {
    title: string;
    content: string;
    typeLabel: string;
    authorName: string;
    createdAt: string;
    replyContent: string | null;
    repliedAt: string | null;
  };
}

/** 문의자 본인 조회: 접수 때 정한 비밀번호가 맞으면 문의 내용과 답변을 돌려준다. */
export async function viewInquiry(_prev: InquiryViewState, formData: FormData): Promise<InquiryViewState> {
  const id = String(formData.get("inquiryId") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || password.length < 1 || password.length > 30) return { status: "WRONG" };
  const { site, config } = await getAssocContext();
  const supabase = await createClient();
  // 사이트도 함께 넘겨 다른 사이트 문의는 열리지 않게 한다.
  const { data, error } = await supabase.rpc("view_site_inquiry", { target_site_id: site.id, target_inquiry_id: id, p_password: password });
  const row = data?.[0];
  if (error || !row) return { status: "ERROR" };
  if (row.result !== "OK") return { status: row.result };
  return {
    status: "OK",
    data: {
      title: row.title ?? "",
      content: row.content ?? "",
      typeLabel: config.inquiryTypes.find((t) => t.key === row.inquiry_type)?.label ?? "문의",
      authorName: row.author_name ?? "",
      createdAt: row.created_at ?? "",
      replyContent: row.reply_content,
      repliedAt: row.replied_at,
    },
  };
}
