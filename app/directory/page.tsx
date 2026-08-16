import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DIRECTORY_CATEGORIES, getCategoryLabel } from "@/lib/directory/categories";
import { getFavoritedIds } from "@/lib/favorites/get-favorited-ids";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalFooter } from "@/components/main/PortalFooter";
import { FavoriteButton } from "@/components/site/FavoriteButton";
import type { DirectoryCategory } from "@/types/database";

export const dynamic = "force-dynamic";

function isDirectoryCategory(value: string): value is DirectoryCategory {
  return DIRECTORY_CATEGORIES.some((c) => c.value === value);
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const activeCategory = category && isDirectoryCategory(category) ? category : null;

  const supabase = await createClient();
  let query = supabase
    .from("directory_listings")
    .select("id, category, name, description, image_url")
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false });
  if (activeCategory) query = query.eq("category", activeCategory);

  const [{ data: listings }, favoritedIds, { data: userData }] = await Promise.all([
    query,
    getFavoritedIds("DIRECTORY_LISTING"),
    supabase.auth.getUser(),
  ]);
  const isLoggedIn = Boolean(userData.user);

  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
            지역정보
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            담양의 카페, 음식점, 생활 정보를 카테고리별로 찾아보세요.
          </p>

          <nav className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/directory"
              className={
                !activeCategory
                  ? "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
                  : "rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:border-accent hover:text-accent"
              }
            >
              전체
            </Link>
            {DIRECTORY_CATEGORIES.map((c) => (
              <Link
                key={c.value}
                href={`/directory?category=${c.value}`}
                className={
                  activeCategory === c.value
                    ? "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
                    : "rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:border-accent hover:text-accent"
                }
              >
                {c.label}
              </Link>
            ))}
          </nav>

          {!listings?.length ? (
            <p className="text-sm text-muted-foreground">
              아직 등록된 업체 정보가 없습니다.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/directory/${listing.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
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
                      <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                        사진 준비중
                      </div>
                    )}
                    <FavoriteButton
                      targetType="DIRECTORY_LISTING"
                      targetId={listing.id}
                      initialFavorited={favoritedIds.has(listing.id)}
                      isLoggedIn={isLoggedIn}
                      className="absolute top-2 right-2"
                    />
                  </div>
                  <div className="p-4">
                    <span className="mb-1 inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {getCategoryLabel(listing.category)}
                    </span>
                    <p className="font-semibold text-card-foreground">{listing.name}</p>
                    {listing.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {listing.description}
                      </p>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <PortalFooter />
    </div>
  );
}
