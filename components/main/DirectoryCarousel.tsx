"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ImageOff, MapPin } from "lucide-react";
import { DIRECTORY_CATEGORIES, getCategoryLabel } from "@/lib/directory/categories";
import { FavoriteButton } from "@/components/site/FavoriteButton";
import { ImageWithFallback } from "@/components/main/ImageWithFallback";
import { cn } from "@/lib/utils";
import type { DirectoryCategory } from "@/types/database";

interface CarouselListing {
  id: string;
  category: DirectoryCategory;
  name: string;
  description: string | null;
  image_url: string | null;
  /** 주소에서 뽑은 읍·면 이름 (없으면 표시하지 않음) */
  area: string | null;
}

export function DirectoryCarousel({
  listings,
  favoritedIds,
  isLoggedIn,
}: {
  listings: CarouselListing[];
  favoritedIds: string[];
  isLoggedIn: boolean;
}) {
  const [active, setActive] = useState<DirectoryCategory | "ALL">("ALL");
  const scrollRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const favoritedSet = useMemo(() => new Set(favoritedIds), [favoritedIds]);

  // 실제 목록에 존재하는 분류만 필터로 노출한다.
  const presentCategories = useMemo(() => {
    const present = new Set(listings.map((l) => l.category));
    return DIRECTORY_CATEGORIES.filter((c) => present.has(c.value));
  }, [listings]);

  const filtered =
    active === "ALL" ? listings : listings.filter((l) => l.category === active);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    updateArrows();
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, updateArrows]);

  function page(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  }

  const filters: { value: DirectoryCategory | "ALL"; label: string }[] = [
    { value: "ALL", label: "전체" },
    ...presentCategories,
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div
          role="group"
          aria-label="분류 필터"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {filters.map((c) => {
            const selected = active === c.value;
            return (
              <button
                key={c.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(c.value)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card text-foreground/80 hover:border-primary/40 hover:text-primary"
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="hidden shrink-0 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => page(-1)}
            disabled={!canPrev}
            aria-label="이전 업체 보기"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-card"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            disabled={!canNext}
            aria-label="다음 업체 보기"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted disabled:opacity-40 disabled:hover:bg-card"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length}개 업체
      </p>

      <ul
        ref={scrollRef}
        onScroll={updateArrows}
        aria-label="업체 목록"
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pt-1 pb-4 [scrollbar-width:none] sm:mx-0 sm:scroll-px-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {filtered.map((listing) => (
          <li
            key={listing.id}
            className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/4)]"
          >
            <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_10px_rgba(27,42,34,0.05)] transition-[box-shadow,transform] duration-200 focus-within:shadow-[0_10px_28px_rgba(27,42,34,0.12)] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(27,42,34,0.12)]">
              <div className="relative aspect-video w-full bg-muted">
                {listing.image_url ? (
                  <ImageWithFallback
                    src={listing.image_url}
                    alt={`${listing.name} 사진`}
                    className="h-full w-full object-cover"
                    fallback={<NoPhoto />}
                  />
                ) : (
                  <NoPhoto />
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-1.5 flex items-center gap-2 text-xs">
                  <span className="rounded-full bg-accent/12 px-2.5 py-0.5 font-semibold text-accent">
                    {getCategoryLabel(listing.category)}
                  </span>
                  {listing.area ? (
                    <span className="flex items-center gap-0.5 text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden />
                      {listing.area}
                    </span>
                  ) : null}
                </div>
                <h3 className="truncate text-base font-bold text-card-foreground">
                  {/* 카드 전체를 덮는 링크 — 즐겨찾기 버튼은 그 위(z-10)에 따로 놓인다 */}
                  <Link
                    href={`/directory/${listing.id}`}
                    className="rounded after:absolute after:inset-0 after:content-['']"
                  >
                    {listing.name}
                  </Link>
                </h3>
                {listing.description ? (
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {listing.description}
                  </p>
                ) : null}
              </div>
              <FavoriteButton
                targetType="DIRECTORY_LISTING"
                targetId={listing.id}
                initialFavorited={favoritedSet.has(listing.id)}
                isLoggedIn={isLoggedIn}
                className="absolute top-2.5 right-2.5 z-10 size-9"
              />
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NoPhoto() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-xs text-muted-foreground">
      <ImageOff className="size-5" aria-hidden />
      사진 준비중
    </div>
  );
}
