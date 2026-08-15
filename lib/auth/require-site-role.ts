import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SiteMemberRole } from "@/types/database";

export interface SiteRoleContext {
  userId: string;
  siteId: string;
  role: SiteMemberRole;
}

/**
 * Verifies the current auth user is an ACTIVE member of `siteId` with one of
 * `allowedRoles`. Called both from admin/layout.tsx and again at the top of
 * every admin server action — a Server Action can in principle be invoked
 * directly, so the layout having rendered is not proof of authorization.
 * The membership lookup itself is RLS-protected (site_members_select), so a
 * non-member gets zero rows back no matter what the UI intended to hide.
 */
export async function requireSiteRole(
  siteId: string,
  allowedRoles: SiteMemberRole[]
): Promise<SiteRoleContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: member } = await supabase
    .from("site_members")
    .select("role, status")
    .eq("site_id", siteId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    !member ||
    member.status !== "ACTIVE" ||
    !allowedRoles.includes(member.role)
  ) {
    redirect("/admin/unauthorized");
  }

  return { userId: user.id, siteId, role: member.role };
}
