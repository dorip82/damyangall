export function PortalHero() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center gap-5 bg-forest px-6 py-20 text-center text-ivory">
      <span className="animate-fade-in w-fit rounded-full border border-wood/40 px-4 py-1 text-xs font-medium tracking-[0.3em] text-wood uppercase">
        ALLDAM
      </span>
      <h1 className="animate-slide-up text-4xl font-bold tracking-tight sm:text-6xl">
        담양의 모든 이야기를 담다.
      </h1>
      <p className="animate-slide-up max-w-md text-sm text-ivory/70 sm:text-base">
        담양군민, 동아리·동호회, 기업·소상공인, 기관·단체가 함께 만들어가는
        지역 통합 플랫폼입니다.
      </p>
    </section>
  );
}
