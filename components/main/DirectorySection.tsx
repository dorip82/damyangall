import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getFavoritedIds } from "@/lib/favorites/get-favorited-ids";
import { DirectoryCarousel } from "@/components/main/DirectoryCarousel";

export async function DirectorySection() {
  const supabase = await createClient();
  const [{ data: listings }, favoritedIds, { data: userData }] = await Promise.all([
    supabase
      .from("directory_listings")
      .select("id, category, name, description, image_url")
      .eq("status", "PUBLISHED")
      .order("created_at", { ascending: false })
      .limit(30),
    getFavoritedIds("DIRECTORY_LISTING"),
    supabase.auth.getUser(),
  ]);

  if (!listings?.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
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
        listings={listings}
        favoritedIds={[...favoritedIds]}
        isLoggedIn={Boolean(userData.user)}
      />
    </section>
  );
}
