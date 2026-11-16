"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAssocAction } from "@/lib/assoc/admin";

const roleSchema = z.enum(["SITE_ADMIN", "EDITOR"]);

/** 가입된 회원을 이메일로 찾아 관리자/편집자로 지정한다 (계정 생성은 하지 않는다). */
export async function addMember(siteId: string, email: string, role: string) {
  const { site } = await requireAssocAction(siteId, ["SITE_ADMIN"]);
  const e = z.string().trim().email("이메일 형식이 올바르지 않습니다").safeParse(email);
  const r = roleSchema.safeParse(role);
  if (!e.success) return { ok: false, error: e.error.issues[0].message };
  if (!r.success) return { ok: false, error: "권한을 선택해주세요." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("add_site_member_by_email", {
    target_site_id: site.id,
    member_email: e.data,
    member_role: r.data,
  });
  if (error) return { ok: false, error: "추가하지 못했습니다." };
  if (data === "NOT_FOUND") return { ok: false, error: "해당 이메일로 가입한 회원이 없습니다. 먼저 회원가입을 해야 합니다." };
  revalidatePath("/admin/members");
  return { ok: true };
}

export async function changeMemberRole(siteId: string, memberId: string, role: string) {
  const { site, userId } = await requireAssocAction(siteId, ["SITE_ADMIN"]);
  const r = roleSchema.safeParse(role);
  if (!r.success) return { ok: false, error: "권한을 선택해주세요." };
  const supabase = await createClient();
  const { data: m } = await supabase.from("site_members").select("user_id").eq("id", memberId).eq("site_id", site.id).maybeSingle();
  if (!m) return { ok: false, error: "대상을 찾을 수 없습니다." };
  if (m.user_id === userId) return { ok: false, error: "자기 자신의 권한은 바꿀 수 없습니다." };
  const { error } = await supabase.from("site_members").update({ role: r.data }).eq("id", memberId).eq("site_id", site.id);
  revalidatePath("/admin/members");
  return error ? { ok: false, error: "변경하지 못했습니다." } : { ok: true };
}

export async function removeMember(siteId: string, memberId: string) {
  const { site, userId } = await requireAssocAction(siteId, ["SITE_ADMIN"]);
  const supabase = await createClient();
  const { data: m } = await supabase.from("site_members").select("user_id").eq("id", memberId).eq("site_id", site.id).maybeSingle();
  if (!m) return { ok: false, error: "대상을 찾을 수 없습니다." };
  if (m.user_id === userId) return { ok: false, error: "자기 자신은 삭제할 수 없습니다." };
  const { error } = await supabase.from("site_members").delete().eq("id", memberId).eq("site_id", site.id);
  revalidatePath("/admin/members");
  return error ? { ok: false, error: "삭제하지 못했습니다." } : { ok: true };
}
