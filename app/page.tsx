import { Megaphone } from "lucide-react";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalHero } from "@/components/main/PortalHero";
import { ComingSoonBanner } from "@/components/main/ComingSoonBanner";
import { NewsSection } from "@/components/main/NewsSection";
import { TodaySection } from "@/components/main/TodaySection";
import { DirectorySection } from "@/components/main/DirectorySection";
import { ClubSitesSection } from "@/components/main/ClubSitesSection";
import { CommunitySection } from "@/components/main/CommunitySection";
import { EventsSection } from "@/components/main/EventsSection";
import { PortalFooter } from "@/components/main/PortalFooter";
import { getMainPageSettings } from "@/lib/main-settings/get-main-page-settings";

// Never statically/edge-cache this route — it renders host-dependent links
// (see lib/site/get-site-url.ts) and must always reflect the real request.
export const dynamic = "force-dynamic";

export default async function RootPortalPage() {
  const settings = await getMainPageSettings();

  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex-1">
        <PortalHero title={settings.hero_title} subtitle={settings.hero_subtitle} />

        {/* 스펙(ALLDAM_MASTER_SPEC.md §29) 기본 순서는 Hero → 담양소식 → 오늘의 담양
            → 지역정보 → 동아리·동호회 → 커뮤니티 → 행사 → 광고이지만, 요청에 따라
            커뮤니티·행사를 중간(지역정보 다음)으로 당기고 동아리·동호회는 광고 바로
            앞, 맨 하단으로 옮겼다. 담양소식·오늘의 담양은 실데이터 섹션으로
            활성화했고, 담양소식(콘텐츠 목록)과 오늘의 담양(실시간 통계 위젯)을
            나란히 배치해 메인/사이드바 구도를 만든다. 광고는 아직 실데이터가 없어
            /directory/admin/main 에서 문구를 편집할 수 있는 준비중 배너로 유지한다.
            폭이 넓은 화면에서 한 줄짜리 배너/목록이 좌우로 텅 비어 보이지 않도록,
            짝지을 수 있는 섹션은 그리드로 묶는다. */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <NewsSection />
            </div>
            <TodaySection />
          </div>
        </section>

        <DirectorySection />

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <CommunitySection />
            <EventsSection />
          </div>
        </section>

        <ClubSitesSection />

        {settings.ad_banner_visible ? (
          <section className="mx-auto max-w-6xl px-6 py-6">
            <ComingSoonBanner
              label={settings.ad_banner_title}
              description={settings.ad_banner_description}
              Icon={Megaphone}
            />
          </section>
        ) : null}
      </main>
      <PortalFooter />
    </div>
  );
}
