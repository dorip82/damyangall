import { createClient } from "@/lib/supabase/server";
import { getFavoritedIds } from "@/lib/favorites/get-favorited-ids";
import { DirectoryCarousel } from "@/components/main/DirectoryCarousel";
import { SectionHeading } from "@/components/main/SectionHeading";
import { ClubSitesList } from "@/components/main/ClubSitesSection";

/** "전라남도 담양군 담양읍 ..." → "담양읍". 주소가 없거나 형식이 다르면 null. */
function areaFromAddress(address: string | null): string | null {
  if (!address) return null;
  const match = address.match(/담양군\s+(\S+?[읍면])(?:\s|$)/);
  return match ? match[1] : null;
}

export async function DirectorySection() {
  const supabase = await createClient();
  const [{ data: listings }, favoritedIds, { data: userData }] = await Promise.all([
    supabase
      .from("directory_listings")
      .select("id, category, name, description, image_url, address")
      .eq("status", "PUBLISHED")
      // Newest first: without an order, Postgres hands back whatever 30 rows
      // it finds first (in practice the oldest), so freshly published
      // listings never made it onto the main page. updated_at rather than
      // created_at because bulk-imported listings are created HIDDEN and
      // only become visible when an admin publishes them later.
      .order("updated_at", { ascending: false })
      .limit(30),
    getFavoritedIds("DIRECTORY_LISTING"),
    supabase.auth.getUser(),
  ]);

  const items = (listings ?? []).map(({ address, ...rest }) => ({
    ...rest,
    area: areaFromAddress(address),
  }));

  return (
    <section aria-labelledby="directory-title" className="bg-secondary/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <SectionHeading
          id="directory-title"
          eyebrow="Places & Groups"
          title="업체·단체 찾기"
          description="담양의 업체와 장소, 함께 활동하는 동아리·동호회를 둘러보세요. 최근 등록된 순서로 보여드려요."
          href="/directory"
          linkLabel="지역정보 전체"
        />

        {items.length ? (
          <DirectoryCarousel
            listings={items}
            favoritedIds={[...favoritedIds]}
            isLoggedIn={Boolean(userData.user)}
          />
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            아직 공개된 지역정보가 없습니다.
          </p>
        )}

        <ClubSitesList />
      </div>
    </section>
  );
}
