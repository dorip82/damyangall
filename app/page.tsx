import { Newspaper, Sparkles, Users, CalendarDays, Megaphone } from "lucide-react";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalHero } from "@/components/main/PortalHero";
import { ComingSoonBanner } from "@/components/main/ComingSoonBanner";
import { DirectorySection } from "@/components/main/DirectorySection";
import { ClubSitesSection } from "@/components/main/ClubSitesSection";
import { PortalFooter } from "@/components/main/PortalFooter";

// Never statically/edge-cache this route — it renders host-dependent links
// (see lib/site/get-site-url.ts) and must always reflect the real request.
export const dynamic = "force-dynamic";

export default function RootPortalPage() {
  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex-1">
        <PortalHero />

        {/* 스펙(ALLDAM_MASTER_SPEC.md §29) 순서: Hero → 담양소식 → 오늘의 담양
            → 지역정보 → 추천 홈페이지 → 동아리·동호회 → 커뮤니티 → 행사 → 광고.
            아직 실제 데이터가 있는 건 지역정보·동아리(=추천 홈페이지와 통합,
            지금은 같은 sites 데이터라 별도 섹션이 의미가 없어 하나로 합침)뿐이라
            나머지는 자리만 잡아두는 준비중 배너로 표시한다. */}
        <ComingSoonBanner
          label="담양소식"
          description="담양의 최신 소식과 유용한 정보를 확인해보세요."
          Icon={Newspaper}
        />
        <ComingSoonBanner
          label="오늘의 담양"
          description="오늘 담양에서 열리는 행사·모임·새로운 소식을 모아봅니다."
          Icon={Sparkles}
        />

        <DirectorySection />
        <ClubSitesSection />

        <ComingSoonBanner
          label="커뮤니티"
          description="소통하고 나누며 함께 만들어가는 공간입니다."
          Icon={Users}
        />
        <ComingSoonBanner
          label="행사"
          description="담양에서 열리는 다양한 행사 소식을 만나보세요."
          Icon={CalendarDays}
        />
        <ComingSoonBanner
          label="광고"
          description="담양의 기업·소상공인을 위한 광고 공간이 마련됩니다."
          Icon={Megaphone}
        />
      </main>
      <PortalFooter />
    </div>
  );
}
