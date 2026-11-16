import type { Metadata } from "next";
import Link from "next/link";
import { formatPeriod, getAssocContext, loadMatches, loadTournaments } from "@/lib/assoc/data";
import { MatchRow, TournamentPicker } from "@/components/assoc/tournament";
import { AssocContainer, AssocPageHeader, EmptyState } from "@/components/assoc/ui";

export const metadata: Metadata = {
  title: "경기 결과",
  description: "담양군농구협회 대회 경기 결과입니다.",
  alternates: { canonical: "/tournament/results" },
};

export default async function ResultsPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t: selected } = await searchParams;
  const { site, config } = await getAssocContext();
  const section = config.nav.find((n) => n.href === "/tournament")!;
  const tournaments = await loadTournaments(site.id);
  const finished = (await loadMatches(site.id, tournaments.map((t) => t.id))).filter((m) => m.status === "FINISHED");
  const withResults = tournaments.filter(
    (t) => t.result_summary || finished.some((m) => m.tournament_id === t.id)
  );
  const current = withResults.find((t) => t.id === selected) ?? withResults[0];
  const list = current ? finished.filter((m) => m.tournament_id === current.id) : [];

  return (
    <>
      <AssocPageHeader section={section} title="경기 결과" description="대회별 경기 결과를 확인하세요." current="/tournament/results" />
      <AssocContainer>
        {current ? (
          <>
            <TournamentPicker tournaments={withResults} selectedId={current.id} basePath="/tournament/results" />
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-2xl font-extrabold text-primary">
                <Link href={`/tournament/${current.id}`} className="hover:underline">
                  {current.title}
                </Link>
              </h2>
              <p className="text-sm text-muted-foreground">{formatPeriod(current.start_date, current.end_date)}</p>
            </div>
            {current.result_summary ? (
              <p className="mb-6 rounded-2xl bg-[var(--dba-soft)] p-5 font-semibold whitespace-pre-line text-primary">
                {current.result_summary}
              </p>
            ) : null}
            {list.length ? (
              <ul className="space-y-2">
                {list.map((m) => (
                  <MatchRow key={m.id} m={m} />
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <EmptyState title="등록된 경기 결과가 없습니다" description="경기가 끝나면 결과가 이곳에 게시됩니다." />
        )}
      </AssocContainer>
    </>
  );
}
