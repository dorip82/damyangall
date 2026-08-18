import { Newspaper, Sparkles, Megaphone } from "lucide-react";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalHero } from "@/components/main/PortalHero";
import { ComingSoonBanner } from "@/components/main/ComingSoonBanner";
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
            앞, 맨 하단으로 옮겼다. 담양소식·오늘의 담양·광고는 아직 실데이터가 없어
            /directory/admin/main 에서 문구를 편집할 수 있는 준비중 배너로 유지한다.
            폭이 넓은 화면에서 한 줄짜리 배너/목록이 좌우로 텅 비어 보이지 않도록,
            짝지을 수 있는 섹션은 2열 그리드로 묶는다. */}
        {settings.news_banner_visible || settings.today_banner_visible ? (
          <section className="mx-auto max-w-6xl px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {settings.news_banner_visible ? (
                <ComingSoonBanner
                  label={settings.news_banner_title}
                  description={settings.news_banner_description}
                  Icon={Newspaper}
                />
              ) : null}
              {settings.today_banner_visible ? (
                <ComingSoonBanner
                  label={settings.today_banner_title}
                  description={settings.today_banner_description}
                  Icon={Sparkles}
                />
              ) : null}
            </div>
          </section>
        ) : null}

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
