import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  CloudRain,
  Droplets,
  Megaphone,
  MessageCircle,
  Newspaper,
  Snowflake,
  Store,
  Sun,
  Briefcase,
  Lightbulb,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWeather } from "@/lib/weather/get-current-weather";
import { CurrentTimeDisplay } from "@/components/main/CurrentTimeDisplay";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 히어로 오른쪽의 "오늘의 담양" 패널.
 * 날씨(기상청 API, 키가 없거나 실패하면 생략), 현재 시각, 그리고 실제 DB 집계만
 * 보여준다. 바로가기는 사이트에 실제로 있는 분류 목록으로만 연결한다 — 외부
 * 민원 서비스 등 올담이 제공하지 않는 기능은 넣지 않는다.
 */
const SHORTCUTS = [
  { href: "/news?category=REPORT", label: "군민제보", Icon: Megaphone },
  { href: "/news?category=LIFE", label: "생활정보", Icon: Lightbulb },
  { href: "/community?category=REPORT", label: "지역제보", Icon: MessageCircle },
  { href: "/community?category=JOBS", label: "구인구직", Icon: Briefcase },
] as const;

export async function TodayPanel() {
  const supabase = await createClient();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekAgo = new Date(now.getTime() - 7 * DAY_MS).toISOString();
  const weekAhead = new Date(now.getTime() + 7 * DAY_MS).toISOString();

  const [weather, upcomingEvents, weeklyNews, todaysCommunityPosts, totalListings] =
    await Promise.all([
      getCurrentWeather(),
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

  // A failed count query comes back as null — show nothing for it rather than
  // a misleading "0".
  const stats = [
    { label: "7일 내 행사", value: upcomingEvents.count, Icon: CalendarDays, href: "/events" },
    { label: "이번 주 소식", value: weeklyNews.count, Icon: Newspaper, href: "/news" },
    { label: "오늘 커뮤니티 글", value: todaysCommunityPosts.count, Icon: MessageCircle, href: "/community" },
    { label: "등록 지역정보", value: totalListings.count, Icon: Store, href: "/directory" },
  ].filter((s) => s.value !== null);

  const WeatherIcon = weather?.isSnow ? Snowflake : weather?.isRain ? CloudRain : Sun;

  return (
    <section
      aria-labelledby="today-title"
      className="on-dark w-full rounded-3xl border border-white/15 bg-deep-forest/60 p-5 text-ivory shadow-[0_12px_40px_rgba(0,0,0,0.25)] backdrop-blur-md sm:p-6"
    >
      <h2 id="today-title" className="text-lg font-bold">
        오늘의 담양
      </h2>
      <CurrentTimeDisplay
        className="mt-1 flex items-center gap-1.5 text-sm text-ivory/80"
        iconClassName="size-3.5 shrink-0"
      />

      {weather ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/[0.08] px-4 py-3">
          <WeatherIcon className="size-8 shrink-0 text-wood" aria-hidden />
          <p className="text-3xl leading-none font-bold">
            {Math.round(weather.temperatureC)}°<span className="sr-only">C</span>
          </p>
          <div className="ml-auto text-right text-sm leading-snug">
            <p className="font-semibold">{weather.conditionLabel}</p>
            <p className="flex items-center justify-end gap-1 text-xs text-ivory/80">
              <Droplets className="size-3" aria-hidden />
              습도 {weather.humidityPercent}%
            </p>
          </div>
        </div>
      ) : null}

      {stats.length ? (
        <ul className="mt-2.5 grid grid-cols-2 gap-2.5">
          {stats.map(({ label, value, Icon, href }) => (
            <li key={label}>
              <Link
                href={href}
                className="flex h-full flex-col gap-1 rounded-2xl bg-white/[0.08] px-3.5 py-3 transition-colors hover:bg-white/[0.14]"
              >
                <Icon className="size-4 text-wood" aria-hidden />
                <span className="text-xl leading-tight font-bold">{value}</span>
                <span className="text-xs text-ivory/80">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 border-t border-white/15 pt-4">
        <h3 className="mb-2 text-xs font-semibold tracking-wide text-ivory/75">자주 찾는 바로가기</h3>
        <ul className="grid grid-cols-2 gap-1">
          {SHORTCUTS.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors hover:bg-white/10"
              >
                <Icon className="size-4 shrink-0 text-wood" aria-hidden />
                <span className="flex-1">{label}</span>
                <ChevronRight className="size-3.5 text-ivory/60" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
