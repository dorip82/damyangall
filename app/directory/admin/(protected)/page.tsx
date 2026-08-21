import Link from "next/link";
import { Store, Newspaper, CalendarDays, MessageCircle, Plus, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCategoryLabel } from "@/lib/directory/categories";
import { getNewsCategoryLabel } from "@/lib/news/categories";
import { getCommunityCategoryLabel } from "@/lib/community/categories";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [
    listingsTotal,
    listingsHidden,
    newsTotal,
    newsHidden,
    eventsUpcoming,
    eventsHidden,
    communityTotal,
    communityHidden,
    recentListings,
    recentNews,
    recentCommunityPosts,
  ] = await Promise.all([
    supabase.from("directory_listings").select("id", { count: "exact", head: true }),
    supabase
      .from("directory_listings")
      .select("id", { count: "exact", head: true })
      .eq("status", "HIDDEN"),
    supabase.from("news").select("id", { count: "exact", head: true }),
    supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "HIDDEN"),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("status", "PUBLISHED")
      .gte("start_at", nowIso),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("status", "HIDDEN"),
    supabase.from("community_posts").select("id", { count: "exact", head: true }),
    supabase
      .from("community_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "HIDDEN"),
    supabase
      .from("directory_listings")
      .select("id, name, category, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("news")
      .select("id, title, category, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("community_posts")
      .select("id, title, category, author_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const hiddenTotal =
    (listingsHidden.count ?? 0) +
    (newsHidden.count ?? 0) +
    (eventsHidden.count ?? 0) +
    (communityHidden.count ?? 0);

  const statCards = [
    {
      label: "업체(지역정보)",
      value: listingsTotal.count ?? 0,
      href: "/directory/admin/listings",
      Icon: Store,
    },
    {
      label: "담양소식",
      value: newsTotal.count ?? 0,
      href: "/directory/admin/news",
      Icon: Newspaper,
    },
    {
      label: "다가오는 행사",
      value: eventsUpcoming.count ?? 0,
      href: "/directory/admin/events",
      Icon: CalendarDays,
    },
    {
      label: "커뮤니티 글",
      value: communityTotal.count ?? 0,
      href: "/directory/admin/community",
      Icon: MessageCircle,
    },
  ];

  const quickActions = [
    { label: "새 소식 등록", href: "/directory/admin/news/new" },
    { label: "새 행사 등록", href: "/directory/admin/events/new" },
    { label: "새 업체 등록", href: "/directory/admin/listings/new" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-foreground">대시보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          올담 플랫폼 콘텐츠 현황을 한눈에 확인하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, href, Icon }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
          >
            <Plus className="size-4" aria-hidden />
            {action.label}
          </Link>
        ))}
        {hiddenTotal > 0 ? (
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground">
            <EyeOff className="size-4" aria-hidden />
            숨김 처리된 항목 {hiddenTotal}건
          </span>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <RecentList
          title="최근 등록 업체"
          moreHref="/directory/admin/listings"
          items={(recentListings.data ?? []).map((item) => ({
            id: item.id,
            href: `/directory/admin/listings/${item.id}`,
            title: item.name,
            meta: `${getCategoryLabel(item.category)} · ${new Date(item.created_at).toLocaleDateString("ko-KR")}`,
          }))}
        />
        <RecentList
          title="최근 담양소식"
          moreHref="/directory/admin/news"
          items={(recentNews.data ?? []).map((item) => ({
            id: item.id,
            href: `/directory/admin/news/${item.id}`,
            title: item.title,
            meta: `${getNewsCategoryLabel(item.category)} · ${new Date(item.created_at).toLocaleDateString("ko-KR")}`,
          }))}
        />
        <RecentList
          title="최근 커뮤니티 글"
          moreHref="/directory/admin/community"
          items={(recentCommunityPosts.data ?? []).map((item) => ({
            id: item.id,
            href: `/directory/admin/community/${item.id}`,
            title: item.title,
            meta: `${getCommunityCategoryLabel(item.category)} · ${item.author_name}`,
          }))}
        />
      </div>
    </div>
  );
}

function RecentList({
  title,
  moreHref,
  items,
}: {
  title: string;
  moreHref: string;
  items: { id: string; href: string; title: string; meta: string }[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <Link href={moreHref} className="text-xs font-medium text-accent hover:underline">
          더보기
        </Link>
      </div>
      {!items.length ? (
        <p className="px-4 py-6 text-center text-sm text-muted-foreground">데이터가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="block px-4 py-3 hover:bg-muted">
                <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.meta}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
