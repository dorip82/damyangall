import "server-only";
import { notFound, redirect } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { requireSiteRole } from "@/lib/auth/require-site-role";
import { getAssocConfig } from "@/lib/assoc/config";
import type { SiteMemberRole } from "@/types/database";

/** 협회형 사이트 전용 관리자 화면 공통 확인: 사이트 + 권한 + 협회 설정 */
export async function requireAssocAdmin(roles: SiteMemberRole[] = ["SITE_ADMIN", "EDITOR"]) {
  const slug = await getCurrentSiteSlug();
  if (!slug) redirect("/");
  const config = getAssocConfig(slug);
  if (!config) notFound();
  const site = await getSiteBySlug(slug);
  if (!site) notFound();
  const ctx = await requireSiteRole(site.id, roles);
  return { site, config, ...ctx };
}

/** 서버 액션용: 폼에서 받은 siteId 가 현재 사이트와 같은지까지 확인 */
export async function requireAssocAction(siteId: string, roles: SiteMemberRole[] = ["SITE_ADMIN", "EDITOR"]) {
  const r = await requireAssocAdmin(roles);
  if (r.site.id !== siteId) redirect("/admin/unauthorized");
  return r;
}
