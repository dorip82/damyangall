import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getFavoritedIds } from "@/lib/favorites/get-favorited-ids";
import { DirectoryCarousel } from "@/components/main/DirectoryCarousel";

/** Fisher-Yates — every listing gets an equal shot at the front of the carousel. */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function DirectorySection() {
  const supabase = await createClient();
  const [{ data: listings }, favoritedIds, { data: userData }] = await Promise.all([
    supabase
      .from("directory_listings")
      .select("id, category, name, description, image_url")
      .eq("status", "PUBLISHED")
      .limit(30),
    getFavoritedIds("DIRECTORY_LISTING"),
    supabase.auth.getUser(),
  ]);

  if (!listings?.length) return null;

  // Shuffled per request, same reasoning as PortalHero's random hero image:
  // this route is force-dynamic, so per-request randomness here is
  // intentional, not an accidental impurity.
  const shuffledListings = shuffle(listings);

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">지역정보</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            담양의 카페, 음식점, 생활 정보를 만나보세요.
          </p>
        </div>
        <Link
          href="/directory"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          더보기
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      <DirectoryCarousel
        listings={shuffledListings}
        favoritedIds={[...favoritedIds]}
        isLoggedIn={Boolean(userData.user)}
      />
    </section>
  );
}
