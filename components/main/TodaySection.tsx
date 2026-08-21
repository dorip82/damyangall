import { CalendarDays, Newspaper, MessageCircle, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function TodaySection() {
  const supabase = await createClient();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS).toISOString();
  const weekAhead = new Date(now.getTime() + 7 * DAY_MS).toISOString();

  const [upcomingEvents, weeklyNews, todaysCommunityPosts, totalListings] = await Promise.all([
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("status", "PUBLISHED")
      .gte("start_at", now.toISOString())
      .lte("start_at", weekAhead),
    supabase
      .from("news")
      .select("id", { count: "exact", head: true })
      .eq("status", "PUBLISHED")
      .gte("created_at", weekAgo),
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "PUBLISHED")
      .gte("created_at", todayStart),
    supabase
      .from("directory_listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "PUBLISHED"),
  ]);

  const stats = [
    {
      label: "7일 이내 예정 행사",
      value: upcomingEvents.count ?? 0,
      Icon: CalendarDays,
    },
    {
      label: "이번 주 담양소식",
      value: weeklyNews.count ?? 0,
      Icon: Newspaper,
    },
    {
      label: "오늘의 커뮤니티 글",
      value: todaysCommunityPosts.count ?? 0,
      Icon: MessageCircle,
    },
    {
      label: "등록된 지역정보",
      value: totalListings.count ?? 0,
      Icon: Store,
    },
  ];

  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-5">
      <div className="mb-4">
        <p className="font-semibold text-foreground">오늘의 담양</p>
        <p className="text-sm text-muted-foreground">지금 담양에서 무슨 일이 있는지 한눈에 확인해보세요.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, Icon }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Icon className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="truncate text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
