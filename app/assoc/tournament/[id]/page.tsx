import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ClipboardList } from "lucide-react";
import {
  applicationState,
  formatDate,
  formatPeriod,
  getAssocContext,
  loadMatches,
  loadTeams,
  loadTournament,
} from "@/lib/assoc/data";
import { MatchRow, groupByRound, tournamentBadge } from "@/components/assoc/tournament";
import { AssocContainer, AssocPageHeader, EmptyState, SectionTitle, StatusBadge } from "@/components/assoc/ui";
import { PhotoLightbox } from "@/components/club/PhotoLightbox";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { site } = await getAssocContext();
  const t = await loadTournament(site.id, id);
  if (!t) return {};
  return {
    title: t.title,
    description: t.summary ?? `${t.title} — ${formatPeriod(t.start_date, t.end_date)}${t.venue ? `, ${t.venue}` : ""}`,
    alternates: { canonical: `/tournament/${t.id}` },
    openGraph: t.poster_url ? { images: [t.poster_url] } : undefined,
  };
}

export default async function TournamentDetailPage({ params }: Props) {
  const { id } = await params;
  const { site, config } = await getAssocContext();
  const t = await loadTournament(site.id, id);
  if (!t) notFound();
  const section = config.nav.find((n) => n.href === "/tournament")!;
  const [matches, teams] = await Promise.all([loadMatches(site.id, [t.id]), loadTeams(t.id)]);
  const badge = tournamentBadge(t);
  const canApply = applicationState(t) === "OPEN";

  const info: [string, string | null][] = [
    ["개최일", formatPeriod(t.start_date, t.end_date)],
    ["장소", t.venue],
    ["참가 부문", t.division],
    [
      "접수 기간",
      t.apply_start || t.apply_end ? `${formatDate(t.apply_start) || "상시"} ~ ${formatDate(t.apply_end) || "별도 안내"}` : null,
    ],
    ["모집 팀 수", t.max_teams ? `${t.max_teams}팀` : null],
    ["참가비", t.fee],
    ["주최 · 주관", t.host],
    ["대회 문의", t.contact],
  ];

  return (
    <>
      <AssocPageHeader section={section} title={t.title} description={t.summary ?? undefined} current="/tournament" />
      <AssocContainer className="max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-12">
            <section aria-labelledby="t-info">
              <div className="mb-5 flex items-center gap-3">
                <h2 id="t-info" className="text-2xl font-extrabold text-primary">
                  대회 정보
                </h2>
                <StatusBadge tone={badge.tone}>{badge.label}</StatusBadge>
              </div>
              <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                {info
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[110px_1fr] sm:grid-cols-[150px_1fr]">
                      <dt className="bg-[var(--dba-soft)] px-4 py-3.5 text-sm font-bold text-muted-foreground">{k}</dt>
                      <dd className="px-4 py-3.5 text-[15px] whitespace-pre-line">{v}</dd>
                    </div>
                  ))}
              </dl>
              {t.description ? (
                <div className="mt-8 text-[16px] leading-[1.9] whitespace-pre-line text-foreground/85">{t.description}</div>
              ) : null}
            </section>

            {t.result_summary ? (
              <section aria-labelledby="t-result">
                <SectionTitle id="t-result" title="대회 결과" />
                <p className="rounded-2xl bg-[var(--dba-soft)] p-6 text-[16px] leading-relaxed font-semibold whitespace-pre-line text-primary">
                  {t.result_summary}
                </p>
              </section>
            ) : null}

            <section aria-labelledby="t-matches">
              <SectionTitle id="t-matches" title="경기 일정 · 결과" />
              {matches.length ? (
                <div className="space-y-6">
                  {groupByRound(matches).map(([round, list]) => (
                    <div key={round}>
                      <h3 className="mb-2 text-sm font-extrabold text-[var(--dba-blue)]">{round}</h3>
                      <ul className="space-y-2">
                        {list.map((m) => (
                          <MatchRow key={m.id} m={m} showRound={false} />
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState className="py-10" title="경기 일정이 아직 없습니다" description="대진이 확정되면 경기 일정과 결과가 표시됩니다." />
              )}
            </section>

            {t.photo_urls.length ? (
              <section aria-labelledby="t-photos">
                <SectionTitle id="t-photos" title="대회 사진" />
                <PhotoLightbox photos={t.photo_urls.map((url) => ({ url, caption: t.title }))} />
              </section>
            ) : null}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-40 lg:self-start">
            {t.poster_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.poster_url} alt={`${t.title} 포스터`} className="w-full rounded-2xl border border-border" />
            ) : null}
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="flex items-center gap-2 font-extrabold text-primary">
                <ClipboardList className="size-5" aria-hidden />
                참가 신청
              </p>
              {canApply ? (
                <>
                  <p className="mt-2 text-sm text-muted-foreground">온라인으로 참가 신청을 접수하고 있습니다.</p>
                  <Link
                    href={`/tournament/apply?t=${t.id}`}
                    className="mt-4 flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--dba-orange)] font-extrabold text-[var(--dba-navy)] hover:brightness-105"
                  >
                    참가 신청하기
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">현재 온라인 접수 기간이 아닙니다 ({badge.label}).</p>
              )}
            </div>
            <div className="rounded-2xl border border-border bg-white p-5">
              <p className="font-extrabold text-primary">
                참가 확정 팀 <span className="text-[var(--dba-green-text)]">{teams.length}</span>
              </p>
              {teams.length ? (
                <ul className="mt-3 divide-y divide-border text-[15px]">
                  {teams.map((team, i) => (
                    <li key={i} className="flex justify-between gap-2 py-2">
                      <span className="font-semibold">{team.team_name}</span>
                      {team.affiliation ? <span className="text-right text-sm text-muted-foreground">{team.affiliation}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">승인된 팀이 생기면 이곳에 표시됩니다.</p>
              )}
            </div>
          </aside>
        </div>
      </AssocContainer>
    </>
  );
}
