import { createClient } from "@/lib/supabase/server";
import type { MainPageSettings } from "@/types/main-settings";

const DEFAULT_SETTINGS: MainPageSettings = {
  id: 1,
  hero_title: "담양의 모든 이야기를 담다.",
  hero_subtitle:
    "담양군민, 동아리·동호회, 기업·소상공인, 기관·단체가 함께 만들어가는 지역 통합 플랫폼입니다.",
  news_banner_visible: true,
  news_banner_title: "담양소식",
  news_banner_description: "담양의 최신 소식과 유용한 정보를 확인해보세요.",
  today_banner_visible: true,
  today_banner_title: "오늘의 담양",
  today_banner_description: "오늘 담양에서 열리는 행사·모임·새로운 소식을 모아봅니다.",
  ad_banner_visible: true,
  ad_banner_title: "광고",
  ad_banner_description: "담양의 기업·소상공인을 위한 광고 공간이 마련됩니다.",
  footer_title: "올담",
  footer_description:
    "담양의 모든 이야기를 담다. 담양군민, 동아리·동호회, 기업·소상공인, 기관·단체가 함께 만들어가는 지역 통합 플랫폼입니다.",
  updated_at: new Date(0).toISOString(),
};

/**
 * Row is a fixed singleton (id=1, migration 0010 seeds it), so this never
 * legitimately returns null — the DEFAULT_SETTINGS fallback only covers a
 * project where that migration hasn't been applied yet.
 */
export async function getMainPageSettings(): Promise<MainPageSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("main_page_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  return data ?? DEFAULT_SETTINGS;
}
