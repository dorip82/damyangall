import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { applicationState, formatDateTime, formatPeriod } from "@/lib/assoc/data";
import { MATCH_STATUS_LABEL, TOURNAMENT_STATUS_LABEL } from "@/lib/assoc/config";
import { StatusBadge } from "@/components/assoc/ui";
import { cn } from "@/lib/utils";
import type { SiteTournament, SiteTournamentMatch } from "@/types/site";

export function tournamentBadge(t: SiteTournament): { tone: string; label: string } {
  if (t.status !== "OPEN") return { tone: t.status, label: TOURNAMENT_STATUS_LABEL[t.status] };
  const st = applicationState(t);
  if (st === "BEFORE") return { tone: "BEFORE", label: "접수예정" };
  if (st === "CLOSED") return { tone: "CLOSED", label: "접수마감" };
  return { tone: "OPEN", label: "접수중" };
}

export function TournamentCard({ t }: { t: SiteTournament }) {
  const badge = tournamentBadge(t);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/9] bg-[linear-gradient(135deg,var(--dba-navy),var(--dba-blue))]">
        {t.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.poster_url} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center text-xl font-black text-white/90">{t.title}</div>
        )}
        <StatusBadge tone={badge.tone} className="absolute top-3 left-3">
          {badge.label}
        </StatusBadge>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-extrabold text-primary">
          <Link href={`/tournament/${t.id}`} className="after:absolute after:inset-0 group-hover:text-[var(--dba-blue)]">
            {t.title}
          </Link>
        </h3>
        {t.summary ? <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{t.summary}</p> : null}
        <ul className="mt-3 space-y-1 text-sm text-foreground/80">
          <li className="flex items-center gap-1.5">
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="sr-only">개최일</span>
            {formatPeriod(t.start_date, t.end_date)}
          </li>
          {t.venue ? (
            <li className="flex items-center gap-1.5">
              <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="sr-only">장소</span>
              {t.venue}
            </li>
          ) : null}
          {t.division ? (
            <li className="flex items-center gap-1.5">
              <Users className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="sr-only">참가 부문</span>
              {t.division}
            </li>
          ) : null}
        </ul>
      </div>
    </article>
  );
}

export function MatchRow({ m, showRound = true }: { m: SiteTournamentMatch; showRound?: boolean }) {
  const finished = m.status === "FINISHED" && m.score_a !== null && m.score_b !== null;
  const aWin = finished && m.score_a! > m.score_b!;
  const bWin = finished && m.score_b! > m.score_a!;
  return (
    <li className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 sm:grid-cols-[150px_1fr_auto_1fr_80px]">
      <div className="col-span-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:col-span-1 sm:block">
        {showRound && m.round ? <p className="font-bold text-[var(--dba-blue)]">{m.round}{m.match_no ? ` · ${m.match_no}경기` : ""}</p> : null}
        {m.scheduled_at ? <p>{formatDateTime(m.scheduled_at)}</p> : null}
        {m.court ? <p>{m.court}</p> : null}
      </div>
      <p className={cn("truncate text-right font-bold", aWin ? "text-primary" : "text-foreground/80")}>{m.team_a || "미정"}</p>
      <p className="min-w-20 text-center">
        {finished ? (
          <span className="text-lg font-black tabular-nums text-primary">
            <span className={aWin ? "text-[var(--dba-orange-text)]" : ""}>{m.score_a}</span>
            <span className="mx-1 text-muted-foreground">:</span>
            <span className={bWin ? "text-[var(--dba-orange-text)]" : ""}>{m.score_b}</span>
          </span>
        ) : (
          <span className="text-sm font-bold text-muted-foreground">VS</span>
        )}
      </p>
      <p className={cn("truncate font-bold", bWin ? "text-primary" : "text-foreground/80")}>{m.team_b || "미정"}</p>
      <p className="col-span-3 text-center text-xs font-bold text-muted-foreground sm:col-span-1 sm:text-right">
        {MATCH_STATUS_LABEL[m.status]}
        {m.note ? <span className="block font-normal">{m.note}</span> : null}
      </p>
    </li>
  );
}

/** 라운드별로 묶는다 (관리자 입력 순서 유지) */
export function groupByRound(matches: SiteTournamentMatch[]) {
  const map = new Map<string, SiteTournamentMatch[]>();
  for (const m of matches) {
    const key = m.round || "경기";
    map.set(key, [...(map.get(key) ?? []), m]);
  }
  return [...map.entries()];
}

/** 대회 선택 탭 (?t=) */
export function TournamentPicker({
  tournaments,
  selectedId,
  basePath,
}: {
  tournaments: SiteTournament[];
  selectedId?: string;
  basePath: string;
}) {
  if (tournaments.length < 2) return null;
  return (
    <nav aria-label="대회 선택" className="mb-8">
      <ul className="flex flex-wrap gap-2">
        {tournaments.map((t) => (
          <li key={t.id}>
            <Link
              href={`${basePath}?t=${t.id}`}
              aria-current={t.id === selectedId ? "page" : undefined}
              className={cn(
                "inline-flex h-10 items-center rounded-full border px-4 text-sm font-bold transition-colors",
                t.id === selectedId
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-white text-foreground/80 hover:border-primary"
              )}
            >
              {t.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
