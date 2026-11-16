import type { Metadata } from "next";
import { getAssocContext, loadPageBlocks, loadTournaments } from "@/lib/assoc/data";
import { AssocBlocks } from "@/components/assoc/AssocBlocks";
import { TournamentCard } from "@/components/assoc/tournament";
import { AssocContainer, AssocPageHeader, EmptyState, SectionTitle } from "@/components/assoc/ui";

export const metadata: Metadata = {
  title: "대회 안내",
  description: "담양군농구협회가 주최·주관하는 농구대회 안내와 대회 목록입니다.",
  alternates: { canonical: "/tournament" },
};

export default async function TournamentIndexPage() {
  const { site, config } = await getAssocContext();
  const section = config.nav.find((n) => n.href === "/tournament")!;
  const [blocks, tournaments] = await Promise.all([loadPageBlocks(site.id, "tournament-guide"), loadTournaments(site.id)]);

  return (
    <>
      <AssocPageHeader section={section} title="대회 안내" description="담양군 농구대회의 안내와 일정, 참가 신청을 한곳에서 확인하세요." current="/tournament" />
      <AssocContainer>
        {blocks.length ? (
          <div className="mb-14 max-w-4xl">
            <AssocBlocks blocks={blocks} siteId={site.id} />
          </div>
        ) : null}
        <SectionTitle title="대회 목록" />
        {tournaments.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} t={t} />
            ))}
          </div>
        ) : (
          <EmptyState title="등록된 대회가 없습니다" description="대회가 확정되면 일정과 참가 신청 안내가 이곳에 게시됩니다." />
        )}
      </AssocContainer>
    </>
  );
}
