import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalHero } from "@/components/main/PortalHero";
import { SideBannerAds } from "@/components/main/SideBannerAds";
import { StoriesSection } from "@/components/main/StoriesSection";
import { DirectorySection } from "@/components/main/DirectorySection";
import { NewsSection } from "@/components/main/NewsSection";
import { CommunitySection } from "@/components/main/CommunitySection";
import { EventsSection } from "@/components/main/EventsSection";
import { ParticipateSection } from "@/components/main/ParticipateSection";
import { PortalFooter } from "@/components/main/PortalFooter";
import { getMainPageSettings } from "@/lib/main-settings/get-main-page-settings";
import { createClient } from "@/lib/supabase/server";

// Never statically/edge-cache this route — it renders host-dependent links
// (see lib/site/get-site-url.ts) and must always reflect the real request.
export const dynamic = "force-dynamic";

/*
 * 메인 포털 구성 (2026-11 리디자인):
 *   히어로(통합 검색 + 오늘의 담양 패널) → 담양의 다양한 이야기(영역 카드)
 *   → 업체·단체 찾기(지역정보 캐러셀 + 동아리·동호회) → 담양소식·커뮤니티
 *   → 다가오는 행사 → 참여 안내 → 푸터.
 * 모든 목록은 실제 DB 데이터만 쓰고, 데이터가 없으면 빈 상태 안내를 보여준다.
 */
export default async function RootPortalPage() {
  const supabase = await createClient();
  const [settings, { data: userData }] = await Promise.all([
    getMainPageSettings(),
    supabase.auth.getUser(),
  ]);

  return (
    <div className="site-theme portal-theme flex min-h-screen flex-col bg-background text-foreground">
      <SideBannerAds />
      <PortalHeader overlay />
      <main id="main-content" className="flex-1">
        <PortalHero title={settings.hero_title} subtitle={settings.hero_subtitle} />

        <StoriesSection />

        <DirectorySection />

        <section aria-label="담양소식과 커뮤니티" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-10">
            <NewsSection />
            <CommunitySection />
          </div>
        </section>

        <EventsSection />

        <ParticipateSection isLoggedIn={Boolean(userData.user)} settings={settings} />
      </main>
      <PortalFooter />
    </div>
  );
}
