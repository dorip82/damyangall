import type { Metadata } from "next";
import Link from "next/link";
import { getAssocContext, loadMatches, loadTournaments } from "@/lib/assoc/data";
import { TournamentPicker, groupByRound } from "@/components/assoc/tournament";
import { AssocContainer, AssocPageHeader, EmptyState } from "@/components/assoc/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "대진표",
  description: "담양군농구협회 대회 대진표입니다.",
  alternates: { canonical: "/tournament/bracket" },
};

export default async function BracketPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t: selected } = await searchParams;
  const { site, config } = await getAssocContext();
  const section = config.nav.find((n) => n.href === "/tournament")!;
  const tournaments = await loadTournaments(site.id);
  const allMatches = await loadMatches(site.id, tournaments.map((t) => t.id));
  const withMatches = tournaments.filter((t) => allMatches.some((m) => m.tournament_id === t.id));
  const current = withMatches.find((t) => t.id === selected) ?? withMatches[0];
  const rounds = current ? groupByRound(allMatches.filter((m) => m.tournament_id === current.id)) : [];

  return (
    <>
      <AssocPageHeader section={section} title="대진표" description="대회별 대진과 경기 진행 상황입니다." current="/tournament/bracket" />
      <AssocContainer>
        {current ? (
          <>
            <TournamentPicker tournaments={withMatches} selectedId={current.id} basePath="/tournament/bracket" />
            <h2 className="mb-6 text-2xl font-extrabold text-primary">
              <Link href={`/tournament/${current.id}`} className="hover:underline">
                {current.title}
              </Link>
            </h2>
            <div className="-mx-4 overflow-x-auto px-4 pb-4" tabIndex={0} aria-label="대진표 (좌우로 스크롤)">
              <ol className="flex min-w-max gap-6">
                {rounds.map(([round, list]) => (
                  <li key={round} className="w-64 shrink-0">
                    <h3 className="mb-3 rounded-lg bg-[var(--dba-navy)] px-3 py-2 text-center text-sm font-extrabold text-white">{round}</h3>
                    <ul className="flex flex-col justify-around gap-4">
                      {list.map((m) => {
                        const done = m.status === "FINISHED" && m.score_a !== null && m.score_b !== null;
                        const aWin = done && m.score_a! > m.score_b!;
                        const bWin = done && m.score_b! > m.score_a!;
                        return (
                          <li key={m.id} className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                            {m.match_no ? (
                              <p className="border-b border-border bg-[var(--dba-soft)] px-3 py-1 text-[11px] font-bold text-muted-foreground">
                                {m.match_no}경기{m.court ? ` · ${m.court}` : ""}
                              </p>
                            ) : null}
                            {[
                              [m.team_a, m.score_a, aWin],
                              [m.team_b, m.score_b, bWin],
                            ].map(([team, score, win], i) => (
                              <div
                                key={i}
                                className={cn(
                                  "flex items-center justify-between gap-2 px-3 py-2.5 text-[15px]",
                                  i === 0 && "border-b border-border",
                                  win ? "bg-[#fff4e8] font-extrabold text-primary" : "text-foreground/80"
                                )}
                              >
                                <span className="truncate">{(team as string) || "미정"}</span>
                                <span className="font-black tabular-nums">{done ? (score as number) : ""}</span>
                              </div>
                            ))}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          </>
        ) : (
          <EmptyState title="등록된 대진표가 없습니다" description="대진이 확정되면 이곳에 대진표가 게시됩니다." />
        )}
      </AssocContainer>
    </>
  );
}
