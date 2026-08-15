import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalHero } from "@/components/main/PortalHero";
import { ClubSitesSection } from "@/components/main/ClubSitesSection";
import { ComingSoonSection } from "@/components/main/ComingSoonSection";
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
        <ClubSitesSection />
        <ComingSoonSection />
      </main>
      <PortalFooter />
    </div>
  );
}
