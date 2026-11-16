"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { CourtLines } from "@/components/assoc/AssocLogo";
import { cn } from "@/lib/utils";
import type { AssocSlide } from "@/lib/assoc/config";

const RM = "(prefers-reduced-motion: reduce)";
const subscribeRM = (cb: () => void) => {
  const mq = window.matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getRM = () => window.matchMedia(RM).matches;

/**
 * 메인 비주얼 슬라이드. 담양 풍경 사진 위에 네이비 그라데이션과 농구 코트 라인을 겹친다.
 * 자동 넘김(7초)은 마우스·포커스가 들어오거나 동작 줄이기 설정이면 멈춘다.
 */
export function AssocHero({ slides, interval = 7 }: { slides: AssocSlide[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const reduced = useSyncExternalStore(subscribeRM, getRM, () => false);
  const rootRef = useRef<HTMLElement>(null);
  const touchX = useRef<number | null>(null);
  const count = slides.length;
  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count]);

  const autoplay = count > 1 && interval > 0 && !paused && !stopped && !reduced;
  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => go(index + 1), interval * 1000);
    return () => clearTimeout(t);
  }, [autoplay, index, interval, go]);

  if (!count) return null;

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="메인 배너"
      className="on-dark relative isolate overflow-hidden bg-[var(--dba-navy)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setPaused(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(index - 1);
        if (e.key === "ArrowRight") go(index + 1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className="relative h-[520px] sm:h-[500px] lg:h-[560px]">
        {slides.map((s, i) => {
          const active = i === index;
          const Title = i === 0 ? "h1" : "h2";
          return (
            <div
              key={s.image + i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}`}
              aria-hidden={!active}
              inert={!active}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                active ? "z-10 opacity-100" : "z-0 opacity-0"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.image}
                alt={s.alt}
                fetchPriority={i === 0 ? "high" : "low"}
                loading={i === 0 ? "eager" : "lazy"}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-transform duration-[8000ms] ease-out",
                  active && !reduced ? "scale-[1.05]" : "scale-100"
                )}
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(100deg,rgba(10,26,56,0.94)_0%,rgba(16,38,79,0.82)_42%,rgba(23,79,145,0.35)_75%,rgba(16,150,107,0.15)_100%)] max-md:bg-[linear-gradient(180deg,rgba(10,26,56,0.55)_0%,rgba(10,26,56,0.85)_55%,rgba(10,26,56,0.95)_100%)]"
              />
              <CourtLines className="pointer-events-none absolute top-1/2 right-[-140px] hidden w-[760px] -translate-y-1/2 text-white/[0.13] md:block" />
              <BallGraphic className="pointer-events-none absolute right-[8%] bottom-[14%] hidden size-44 lg:block xl:size-56" />

              <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-32 sm:px-8 md:justify-center md:pb-10 lg:px-10">
                {s.eyebrow ? (
                  <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/12 px-3.5 py-1.5 text-xs font-bold tracking-[0.12em] text-white ring-1 ring-white/25 sm:text-[13px]">
                    <span className="size-2 rounded-full bg-[var(--dba-orange)]" aria-hidden />
                    {s.eyebrow}
                  </p>
                ) : null}
                <Title className="text-[40px] leading-[1.12] font-black tracking-tight whitespace-pre-line text-white sm:text-[54px] lg:text-[66px]">
                  {s.title}
                </Title>
                {s.subtitle ? (
                  <p className="mt-5 max-w-xl text-[16px] leading-relaxed font-medium whitespace-pre-line text-white/90 sm:text-lg [&::first-line]:font-extrabold [&::first-line]:text-[var(--dba-orange)]">
                    {s.subtitle}
                  </p>
                ) : null}
                {s.buttonHref && s.buttonLabel ? (
                  <Link
                    href={s.buttonHref}
                    className="mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-[var(--dba-orange)] px-7 text-[15px] font-extrabold text-[var(--dba-navy)] shadow-lg shadow-black/20 transition-transform hover:-translate-y-0.5"
                  >
                    {s.buttonLabel}
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 ? (
        <div className="absolute inset-x-0 bottom-14 z-20 md:bottom-12">
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 sm:px-8 lg:px-10">
            <span className="text-sm font-bold text-white tabular-nums" aria-hidden>
              {String(index + 1).padStart(2, "0")}
              <span className="text-white/50"> / {String(count).padStart(2, "0")}</span>
            </span>
            <div className="flex items-center gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${i + 1}번 슬라이드 보기`}
                  aria-current={i === index ? "true" : undefined}
                  className="flex h-8 items-center"
                >
                  <span
                    className={cn(
                      "block h-1.5 rounded-full transition-all",
                      i === index ? "w-8 bg-[var(--dba-orange)]" : "w-4 bg-white/50 hover:bg-white/80"
                    )}
                  />
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              {interval > 0 ? (
                <button
                  type="button"
                  onClick={() => setStopped((v) => !v)}
                  aria-label={stopped ? "자동 넘김 시작" : "자동 넘김 멈춤"}
                  className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20"
                >
                  {stopped ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="이전 슬라이드"
                className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="다음 슬라이드"
                className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function BallGraphic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id="dba-ball" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffb25e" />
          <stop offset="60%" stopColor="#f28c28" />
          <stop offset="100%" stopColor="#c0620c" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#dba-ball)" />
      <g fill="none" stroke="#3a1d05" strokeWidth="2.2" strokeLinecap="round" opacity="0.8">
        <path d="M4 50h92" />
        <path d="M50 4v92" />
        <path d="M18 18c13 10 13 54 0 64" />
        <path d="M82 18c-13 10-13 54 0 64" />
      </g>
    </svg>
  );
}
