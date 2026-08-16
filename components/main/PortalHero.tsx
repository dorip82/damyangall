import { Search } from "lucide-react";

const HERO_IMAGE_COUNT = 7;

export function PortalHero() {
  // Picked once per request so repeat visits see some variety across
  // Damyang's scenic spots instead of always the same banner. This route is
  // already force-dynamic (app/page.tsx), so per-request randomness here is
  // intentional, not an accidental impurity.
  // eslint-disable-next-line react-hooks/purity
  const imageIndex = Math.floor(Math.random() * HERO_IMAGE_COUNT) + 1;

  return (
    <section className="relative flex min-h-[55vh] flex-col items-center justify-center gap-5 overflow-hidden px-6 py-20 text-center text-ivory">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/hero-${imageIndex}.webp`}
        alt=""
        className="animate-slow-zoom absolute inset-0 h-full w-full object-cover motion-reduce:animate-none"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-deep-forest/70 via-deep-forest/50 to-deep-forest/70"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center gap-5">
        <span className="animate-fade-in w-fit rounded-full border border-wood/40 px-4 py-1 text-xs font-medium tracking-[0.3em] text-wood uppercase">
          ALLDAM
        </span>
        <h1 className="animate-slide-up text-4xl font-bold tracking-tight sm:text-6xl">
          담양의 모든 이야기를 담다.
        </h1>
        <p className="animate-slide-up max-w-md text-sm text-ivory/80 sm:text-base">
          담양군민, 동아리·동호회, 기업·소상공인, 기관·단체가 함께 만들어가는
          지역 통합 플랫폼입니다.
        </p>

        <form action="/search" className="mt-2 flex w-full max-w-md gap-2">
          <div className="flex h-12 flex-1 items-center gap-2 rounded-full bg-background px-5 shadow-sm">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              type="text"
              name="q"
              placeholder="찾고 싶은 업체, 키워드를 검색해보세요"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            className="h-12 shrink-0 rounded-full bg-accent px-6 text-sm font-medium text-deep-forest hover:bg-accent/90"
          >
            검색
          </button>
        </form>
      </div>
    </section>
  );
}
