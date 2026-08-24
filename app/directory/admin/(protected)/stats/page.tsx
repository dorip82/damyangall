import { createClient } from "@/lib/supabase/server";
import { Eye, CalendarDays, TrendingUp } from "lucide-react";

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAILY_WINDOW_DAYS = 14;
const MONTH_WINDOW_DAYS = 30;

// page_views.created_at is stored in UTC; every bucket below is keyed by the
// KST calendar date so "오늘"/"이번 주" match what a 담양 admin expects.
function kstDateKeyForDaysAgo(daysAgo: number): string {
  const kst = new Date(Date.now() + KST_OFFSET_MS);
  kst.setUTCDate(kst.getUTCDate() - daysAgo);
  return kst.toISOString().slice(0, 10);
}

function kstDateKeyOf(iso: string): string {
  return new Date(new Date(iso).getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

function kstMidnightUtc(daysAgo: number): Date {
  const kst = new Date(Date.now() + KST_OFFSET_MS);
  kst.setUTCHours(0, 0, 0, 0);
  kst.setUTCDate(kst.getUTCDate() - daysAgo);
  return new Date(kst.getTime() - KST_OFFSET_MS);
}

export default async function AdminStatsPage() {
  const supabase = await createClient();
  const windowStart = kstMidnightUtc(MONTH_WINDOW_DAYS - 1);

  const [{ count: totalCount }, { data: rows }] = await Promise.all([
    supabase.from("page_views").select("id", { count: "exact", head: true }),
    supabase
      .from("page_views")
      .select("path, created_at")
      .gte("created_at", windowStart.toISOString())
      .order("created_at", { ascending: false })
      .limit(20000),
  ]);

  const monthRows = rows ?? [];

  const dayBuckets = new Map<string, number>();
  for (let i = DAILY_WINDOW_DAYS - 1; i >= 0; i--) {
    dayBuckets.set(kstDateKeyForDaysAgo(i), 0);
  }
  const pathCounts = new Map<string, number>();
  for (const row of monthRows) {
    const key = kstDateKeyOf(row.created_at);
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
    pathCounts.set(row.path, (pathCounts.get(row.path) ?? 0) + 1);
  }

  const todayCount = dayBuckets.get(kstDateKeyForDaysAgo(0)) ?? 0;
  const weekCount = [...dayBuckets.entries()]
    .filter(([key]) => key >= kstDateKeyForDaysAgo(6))
    .reduce((sum, [, count]) => sum + count, 0);
  const monthCount = monthRows.length;

  const maxDayCount = Math.max(1, ...dayBuckets.values());
  const topPages = [...pathCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  const statCards = [
    { label: "오늘", value: todayCount, Icon: Eye },
    { label: "최근 7일", value: weekCount, Icon: CalendarDays },
    { label: "최근 30일", value: monthCount, Icon: TrendingUp },
    { label: "전체 누적", value: totalCount ?? 0, Icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-foreground">접속통계</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          공개 페이지 방문 기록입니다. IP나 개인정보는 저장하지 않습니다.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{value.toLocaleString("ko-KR")}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="mb-4 text-sm font-semibold text-foreground">최근 14일 방문 추이</p>
        <div className="flex h-32 items-end gap-1.5">
          {[...dayBuckets.entries()].map(([date, count]) => (
            <div key={date} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className="w-full rounded-t bg-accent/70"
                style={{ height: `${Math.max(4, (count / maxDayCount) * 100)}%` }}
                title={`${date}: ${count}건`}
              />
              <span className="text-[10px] text-muted-foreground">{date.slice(5).replace("-", ".")}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">최근 30일 인기 페이지</p>
        </div>
        {!topPages.length ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            아직 방문 기록이 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {topPages.map(([path, count], i) => (
              <li key={path} className="flex items-center justify-between gap-4 px-4 py-3">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="w-5 shrink-0 text-sm font-medium text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="truncate text-sm text-foreground">{path}</span>
                </span>
                <span className="shrink-0 text-sm font-medium text-foreground">
                  {count.toLocaleString("ko-KR")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
