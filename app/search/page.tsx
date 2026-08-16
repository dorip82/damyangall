import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site/get-site-url";
import { getCategoryLabel } from "@/lib/directory/categories";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalFooter } from "@/components/main/PortalFooter";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  // PostgREST's .or() filter string treats ",()%*" as syntax, not literal
  // search characters — strip them so a search term can't inject extra
  // filter clauses or break the query.
  const safeQuery = query.replace(/[,()%*]/g, "").trim();

  const supabase = await createClient();
  const [{ data: listings }, { data: sites }] = safeQuery
    ? await Promise.all([
        supabase
          .from("directory_listings")
          .select("id, category, name, description")
          .eq("status", "PUBLISHED")
          .or(`name.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`)
          .limit(20),
        supabase
          .from("sites")
          .select("id, slug, name, description, subcategory")
          .eq("status", "ACTIVE")
          .or(`name.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`)
          .limit(20),
      ])
    : [{ data: [] }, { data: [] }];

  const siteResults = await Promise.all(
    (sites ?? []).map(async (site) => ({ ...site, url: await getSiteUrl(site.slug) }))
  );

  const resultCount = (listings?.length ?? 0) + siteResults.length;

  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <form action="/search" className="mb-8 flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="찾고 싶은 업체, 키워드를 입력해보세요"
              className="h-11 flex-1 rounded-full border border-border bg-background px-5 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              className="h-11 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              검색
            </button>
          </form>

          {!safeQuery ? (
            <p className="text-sm text-muted-foreground">검색어를 입력해주세요.</p>
          ) : (
            <>
              <p className="mb-8 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">&quot;{query}&quot;</span>{" "}
                검색 결과 {resultCount}건
              </p>

              {resultCount === 0 ? (
                <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
              ) : (
                <div className="space-y-10">
                  {listings && listings.length > 0 ? (
                    <div>
                      <h2 className="mb-4 text-lg font-bold text-foreground">
                        지역정보 ({listings.length})
                      </h2>
                      <ul className="divide-y divide-border rounded-2xl border border-border">
                        {listings.map((listing) => (
                          <li key={listing.id}>
                            <Link
                              href={`/directory/${listing.id}`}
                              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted"
                            >
                              <div>
                                <p className="font-medium text-foreground">
                                  {listing.name}
                                </p>
                                {listing.description ? (
                                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                                    {listing.description}
                                  </p>
                                ) : null}
                              </div>
                              <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                                {getCategoryLabel(listing.category)}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {siteResults.length > 0 ? (
                    <div>
                      <h2 className="mb-4 text-lg font-bold text-foreground">
                        동아리·동호회 ({siteResults.length})
                      </h2>
                      <ul className="divide-y divide-border rounded-2xl border border-border">
                        {siteResults.map((site) => (
                          <li key={site.id}>
                            <a
                              href={site.url}
                              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted"
                            >
                              <div>
                                <p className="font-medium text-foreground">{site.name}</p>
                                {site.description ? (
                                  <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                                    {site.description}
                                  </p>
                                ) : null}
                              </div>
                              {site.subcategory ? (
                                <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                                  {site.subcategory}
                                </span>
                              ) : null}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <PortalFooter />
    </div>
  );
}
