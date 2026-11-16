import { createClient } from "@/lib/supabase/server";
import { resolveClubContact, type ClubContact } from "@/lib/site/contact";
import type { Site, SitePage, SiteSettings } from "@/types/site";

/** 사이트 기본 정보 + 홈 페이지 "문의" 블록에서 실제 연락처를 모은다. */
export async function loadClubContact(site: Site): Promise<ClubContact> {
  const supabase = await createClient();
  const [{ data: settings }, { data: home }] = await Promise.all([
    supabase
      .from("site_settings")
      .select("show_phone, show_address")
      .eq("site_id", site.id)
      .maybeSingle<Pick<SiteSettings, "show_phone" | "show_address">>(),
    supabase
      .from("site_pages")
      .select("content")
      .eq("site_id", site.id)
      .eq("is_home", true)
      .maybeSingle<Pick<SitePage, "content">>(),
  ]);
  return resolveClubContact(site, settings ?? null, home?.content?.blocks ?? []);
}
