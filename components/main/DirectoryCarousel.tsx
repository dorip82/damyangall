"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DIRECTORY_CATEGORIES, getCategoryLabel } from "@/lib/directory/categories";
import { FavoriteButton } from "@/components/site/FavoriteButton";
import type { DirectoryCategory } from "@/types/database";

interface CarouselListing {
  id: string;
  category: DirectoryCategory;
  name: string;
  description: string | null;
  image_url: string | null;
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const favoritedSet = useMemo(() => new Set(favoritedIds), [favoritedIds]);

  const presentCategories = useMemo(() => {
    const present = new Set(listings.map((l) => l.category));
    return DIRECTORY_CATEGORIES.filter((c) => present.has(c.value));
  }, [listings]);

  const filtered =
    active === "ALL" ? listings : listings.filter((l) => l.category === active);

  function scrollBy(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActive("ALL")}
          className={
            active === "ALL"
              ? "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
              : "rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:border-accent hover:text-accent"
          }
        >
          전체
        </button>
        {presentCategories.map((c) => (
          <button
            key={c.value}
            onClick={() => setActive(c.value)}
            className={
              active === c.value
                ? "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
                : "rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:border-accent hover:text-accent"
            }
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {filtered.map((listing) => (
            <Link
              key={listing.id}
              href={`/directory/${listing.id}`}
              className="group relative w-56 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-video w-full">
                {listing.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={listing.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                    사진 준비중
                  </div>
                )}
                <FavoriteButton
                  targetType="DIRECTORY_LISTING"
                  targetId={listing.id}
                  initialFavorited={favoritedSet.has(listing.id)}
                  isLoggedIn={isLoggedIn}
                  className="absolute top-2 right-2"
                />
              </div>
              <div className="p-4">
                <span className="mb-1 inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                  {getCategoryLabel(listing.category)}
                </span>
                <p className="truncate font-semibold text-card-foreground">
                  {listing.name}
                </p>
                {listing.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {listing.description}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>

        {filtered.length > 3 ? (
          <>
            <button
              type="button"
              onClick={() => scrollBy(-240)}
              aria-label="이전"
              className="absolute top-1/3 -left-3 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-sm sm:flex"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(240)}
              aria-label="다음"
              className="absolute top-1/3 -right-3 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-sm sm:flex"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
