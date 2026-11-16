import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { formatPeriod, getAssocContext, loadMatches, loadTournaments, todayKST } from "@/lib/assoc/data";
import { MatchRow, tournamentBadge } from "@/components/assoc/tournament";
import { AssocContainer, AssocPageHeader, EmptyState, SectionTitle, StatusBadge } from "@/components/assoc/ui";

export const metadata: Metadata = {
  title: "대회 일정",
  description: "담양군농구협회 대회 일정과 경기 일정입니다.",
  alternates: { canonical: "/tournament/schedule" },
};

export default async function SchedulePage() {
  const { site, config } = await getAssocContext();
  const section = config.nav.find((n) => n.href === "/tournament")!;
  const today = todayKST();
  const tournaments = (await loadTournaments(site.id)).sort((a, b) =>
    (a.start_date ?? "9999").localeCompare(b.start_date ?? "9999")
  );
  const upcoming = tournaments.filter((t) => t.status !== "FINISHED" && (!t.end_date || t.end_date >= today));
  const past = tournaments.filter((t) => !upcoming.includes(t)).reverse();
  const matches = (await loadMatches(site.id, upcoming.map((t) => t.id))).filter(
    (m) => m.status !== "FINISHED" && m.status !== "CANCELLED"
  );
  const titleById = new Map(tournaments.map((t) => [t.id, t.title]));

  return (
    <>
      <AssocPageHeader section={section} title="대회 일정" description="예정된 대회와 경기 일정을 확인하세요." current="/tournament/schedule" />
      <AssocContainer className="space-y-14">
        <section aria-labelledby="sch-upcoming">
          <SectionTitle id="sch-upcoming" title="예정된 대회" />
          {upcoming.length ? (
            <ol className="space-y-3">
              {upcoming.map((t) => {
                const badge = tournamentBadge(t);
                return (
                  <li key={t.id}>
                    <Link
                      href={`/tournament/${t.id}`}
                      className="flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-md sm:flex-row sm:items-center"
                    >
                      <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--dba-navy)] px-4 py-3 text-white sm:w-28">
                        {t.start_date ? (
                          <>
                            <span className="text-xs font-bold text-white/70">{t.start_date.slice(0, 4)}</span>
                            <span className="text-xl font-black">{`${Number(t.start_date.slice(5, 7))}.${Number(t.start_date.slice(8, 10))}`}</span>
                          </>
                        ) : (
                          <span className="text-sm font-bold">일정 미정</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-extrabold text-primary">{t.title}</p>
                        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <CalendarDays className="size-4" aria-hidden />
                            {formatPeriod(t.start_date, t.end_date)}
                          </span>
                          {t.venue ? (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="size-4" aria-hidden />
                              {t.venue}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      <StatusBadge tone={badge.tone} className="self-start sm:self-center">
                        {badge.label}
                      </StatusBadge>
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyState title="예정된 대회가 없습니다" description="대회가 확정되면 이곳에 일정이 게시됩니다." />
          )}
        </section>

        {matches.length ? (
          <section aria-labelledby="sch-matches">
            <SectionTitle id="sch-matches" title="경기 일정" />
            <div className="space-y-3">
              {matches.map((m) => (
                <div key={m.id}>
                  <p className="mb-1.5 text-xs font-bold text-muted-foreground">{titleById.get(m.tournament_id)}</p>
                  <ul>
                    <MatchRow m={m} />
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {past.length ? (
          <section aria-labelledby="sch-past">
            <SectionTitle id="sch-past" title="지난 대회" moreHref="/tournament/results" moreLabel="경기 결과" />
            <ul className="divide-y divide-border rounded-2xl border border-border bg-white">
              {past.map((t) => (
                <li key={t.id}>
                  <Link href={`/tournament/${t.id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-[var(--dba-soft)]">
                    <span className="font-semibold">{t.title}</span>
                    <span className="shrink-0 text-sm text-muted-foreground">{formatPeriod(t.start_date, t.end_date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </AssocContainer>
    </>
  );
}
