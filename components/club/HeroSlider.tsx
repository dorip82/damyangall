"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SliderSlide } from "@/lib/blocks/types";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
function getReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * 메인 가로형 슬라이드 배너. 페이드 전환, 좌우 버튼, 하단 인디케이터, 자동 넘김.
 * 마우스를 올리거나 키보드 포커스가 들어오면 자동 넘김을 멈추고, 사용자가
 * 동작 줄이기를 설정했으면 처음부터 자동 넘김을 하지 않는다.
 * 슬라이드 수에 제한이 없다 (관리자 "메인 슬라이드" 블록에서 추가).
 */
export function HeroSlider({
  slides,
  interval = 6,
}: {
  slides: SliderSlide[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userStopped, setUserStopped] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const rootRef = useRef<HTMLElement>(null);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  const autoplay = count > 1 && interval > 0 && !paused && !userStopped && !reducedMotion;
  useEffect(() => {
    if (!autoplay) return;
    const timer = setTimeout(() => go(index + 1), interval * 1000);
    return () => clearTimeout(timer);
  }, [autoplay, index, interval, go]);

  // 터치 스와이프
  const touchX = useRef<number | null>(null);

  if (!count) return null;

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="메인 배너"
      className="on-dark relative isolate overflow-hidden bg-[var(--club-navy)]"
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
      <div className="relative h-[460px] sm:h-[440px] lg:h-[480px]">
        {slides.map((slide, i) => {
          const active = i === index;
          const lines = (slide.title ?? "").split("\n").filter(Boolean);
          return (
            <div
              key={slide.image + i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}`}
              aria-hidden={!active}
              inert={!active}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-out",
                active ? "z-10 opacity-100" : "z-0 opacity-0"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.image}
                alt={slide.alt ?? ""}
                fetchPriority={i === 0 ? "high" : "low"}
                loading={i === 0 ? "eager" : "lazy"}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover object-[70%_center] transition-transform duration-[7000ms] ease-out sm:object-center",
                  active && !reducedMotion ? "scale-[1.04]" : "scale-100"
                )}
              />
              {/* 글자가 잘 읽히도록 왼쪽을 어둡게 */}
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,26,44,0.78)_0%,rgba(14,26,44,0.5)_38%,rgba(14,26,44,0.08)_68%,rgba(14,26,44,0)_100%)] max-sm:bg-[linear-gradient(180deg,rgba(14,26,44,0.2)_0%,rgba(14,26,44,0.62)_40%,rgba(14,26,44,0.85)_100%)]"
              />

              {lines.length || slide.subtitle ? (
                <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-20 sm:justify-center sm:px-16 sm:pb-0 lg:px-24">
                  {lines.length ? (
                    <h2
                      className={cn(
                        "font-brush text-[44px] leading-[1.05] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-[58px] lg:text-[72px]",
                        active && !reducedMotion && "animate-slide-up"
                      )}
                    >
                      {lines.map((line, li) => (
                        <span
                          key={li}
                          className={cn(
                            "block",
                            li === 0 && "text-[var(--club-yellow)]",
                            li > 0 && "sm:pl-[0.6em]",
                            li > 1 && "sm:pl-[1.1em]"
                          )}
                        >
                          {line}
                        </span>
                      ))}
                    </h2>
                  ) : null}
                  {lines.length ? (
                    <svg
                      aria-hidden
                      viewBox="0 0 300 10"
                      className="mt-1 h-2.5 w-56 text-[var(--club-yellow)] sm:w-72"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M2 7C90 2 200 1 298 4" />
                    </svg>
                  ) : null}
                  {slide.subtitle ? (
                    <p className="mt-4 max-w-md text-[15px] leading-relaxed font-medium whitespace-pre-line text-white/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] sm:text-lg">
                      {slide.subtitle}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="이전 슬라이드"
            className="absolute top-1/2 left-3 z-20 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 sm:flex lg:left-8"
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="다음 슬라이드"
            className="absolute top-1/2 right-3 z-20 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition-colors hover:bg-black/55 sm:flex lg:right-8"
          >
            <ChevronRight className="size-6" aria-hidden />
          </button>

          <div className="absolute inset-x-0 bottom-5 z-20 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`${i + 1}번 슬라이드 보기`}
                aria-current={i === index ? "true" : undefined}
                className="flex size-7 items-center justify-center"
              >
                <span
                  className={cn(
                    "block size-2.5 rounded-full border border-white transition-colors",
                    i === index ? "bg-white" : "bg-transparent"
                  )}
                />
              </button>
            ))}
            {interval > 0 ? (
              <button
                type="button"
                onClick={() => setUserStopped((v) => !v)}
                aria-label={userStopped ? "자동 넘김 시작" : "자동 넘김 멈춤"}
                className="ml-1 flex size-7 items-center justify-center rounded-full text-white/85 hover:text-white"
              >
                {userStopped ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
