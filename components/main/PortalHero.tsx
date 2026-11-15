import Link from "next/link";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DIRECTORY_CATEGORIES } from "@/lib/directory/categories";
import { TodayPanel } from "@/components/main/TodaySection";

/** public/images/hero-N.webp — 담양 풍경 사진. alt는 사진에 보이는 그대로만 묘사한다. */
const HERO_IMAGES = [
  { src: "/images/hero-2.webp", alt: "눈 덮인 대나무 숲 사이로 보이는 한옥 누각" },
  { src: "/images/hero-7.webp", alt: "양옆으로 키 큰 나무가 늘어선 초록빛 가로수 길" },
  { src: "/images/hero-1.webp", alt: "돌담과 나무 사이에 자리한 전통 정자" },
  { src: "/images/hero-5.webp", alt: "푸른 하늘 아래 냇가를 따라 이어진 나무 산책길" },
  { src: "/images/hero-3.webp", alt: "산 너머로 해가 뜨는 호수 풍경" },
  { src: "/images/hero-6.webp", alt: "운무가 걸린 가을 산과 산성 위의 누각" },
  { src: "/images/hero-4.webp", alt: "이끼 낀 바위 사이로 흐르는 숲속 계곡" },
] as const;

export async function PortalHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  // Picked once per request so repeat visits see some variety across
  // Damyang's scenic spots. Weighted toward the first two (bamboo grove /
  // tree-lined road) which carry the brand's 대나무 숲 mood best. This route
  // is force-dynamic (app/page.tsx), so per-request randomness is intended.
  // eslint-disable-next-line react-hooks/purity
  const roll = Math.random();
  const image =
    roll < 0.5
      ? HERO_IMAGES[roll < 0.3 ? 0 : 1]
      : HERO_IMAGES[2 + Math.floor(((roll - 0.5) / 0.5) * (HERO_IMAGES.length - 2))];

  // 검색어 태그: 실제로 공개된 지역정보가 있는 분류만 보여준다 (지어낸 인기 키워드 X).
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("directory_listings")
    .select("category")
    .eq("status", "PUBLISHED")
    .limit(1000);
  const present = new Set((rows ?? []).map((r) => r.category));
  const categoryTags = DIRECTORY_CATEGORIES.filter((c) => present.has(c.value)).slice(0, 6);

  return (
    <section className="on-dark relative isolate overflow-hidden bg-deep-forest text-ivory">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={image.alt}
        fetchPriority="high"
        className="animate-fade-in absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(18,30,24,0.86)_0%,rgba(18,30,24,0.62)_48%,rgba(18,30,24,0.42)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-deep-forest/50 to-transparent"
      />

      <div className="mx-auto grid min-h-[92svh] max-w-7xl items-center gap-10 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14 lg:pt-32 lg:pb-20">
        <div className="max-w-2xl">
          <p className="animate-fade-in mb-5 inline-flex items-center gap-2 rounded-full border border-wood/40 bg-black/15 px-3.5 py-1 text-xs font-semibold tracking-[0.18em] text-wood">
            ALLDAM · 담양 지역 통합 플랫폼
          </p>
          <h1 className="animate-slide-up text-[2.25rem] leading-[1.2] font-extrabold tracking-tight break-keep sm:text-5xl lg:text-[3.5rem]">
            {title}
          </h1>
          <p className="animate-slide-up mt-5 max-w-xl text-base leading-relaxed text-ivory/85 break-keep sm:text-lg">
            {subtitle}
          </p>

          <form action="/search" role="search" className="mt-8 w-full max-w-xl">
            <label htmlFor="hero-search" className="sr-only">
              업체, 키워드, 소식 검색
            </label>
            <div className="flex items-center gap-2 rounded-full bg-card p-1.5 pl-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] focus-within:ring-4 focus-within:ring-wood/50">
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <input
                id="hero-search"
                type="search"
                name="q"
                required
                placeholder="업체, 키워드, 소식을 검색해보세요"
                className="h-12 min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-none"
              />
              <button
                type="submit"
                className="h-12 shrink-0 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-natural-green sm:px-8"
              >
                검색
              </button>
            </div>
          </form>

          {categoryTags.length ? (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-sm text-ivory/75">분류로 찾기</span>
              {categoryTags.map((c) => (
                <Link
                  key={c.value}
                  href={`/directory?category=${c.value}`}
                  className="rounded-full border border-ivory/25 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-ivory backdrop-blur-sm transition-colors hover:border-ivory/50 hover:bg-white/20"
                >
                  #{c.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <div className="w-full lg:justify-self-end">
          <TodayPanel />
        </div>
      </div>
    </section>
  );
}
