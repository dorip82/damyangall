import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NEWS_CATEGORIES, getNewsCategoryLabel } from "@/lib/news/categories";
import { proxiedImageSrc } from "@/lib/utils/image-proxy";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalFooter } from "@/components/main/PortalFooter";
import type { NewsCategory } from "@/types/database";

export const dynamic = "force-dynamic";

function isNewsCategory(value: string): value is NewsCategory {
  return NEWS_CATEGORIES.some((c) => c.value === value);
}

const PAGE_SIZE = 20;

export default async function NewsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page: pageParam } = await searchParams;
  const activeCategory = category && isNewsCategory(category) ? category : null;
  const page = Math.max(1, Number(pageParam ?? 1) || 1);

  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  let query = supabase
    .from("news")
    .select(
      "id, category, title, summary, thumbnail_url, created_at, source_type, source_name",
      { count: "exact" }
    )
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (activeCategory) query = query.eq("category", activeCategory);
  const { data: newsList, count } = await query;

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const categoryQuery = activeCategory ? `category=${activeCategory}&` : "";

  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">담양소식</h1>
          <p className="mb-8 text-sm text-muted-foreground">
            담양의 지역소식, 생활정보, 군민제보를 만나보세요.
          </p>

          <nav className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/news"
              className={
                !activeCategory
                  ? "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
                  : "rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:border-accent hover:text-accent"
              }
            >
              전체
            </Link>
            {NEWS_CATEGORIES.map((c) => (
              <Link
                key={c.value}
                href={`/news?category=${c.value}`}
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

          {!newsList?.length ? (
            <p className="text-sm text-muted-foreground">아직 등록된 소식이 없습니다.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {newsList.map((news) => (
                <Link
                  key={news.id}
                  href={`/news/${news.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="aspect-video w-full">
                    {news.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={proxiedImageSrc(news.thumbnail_url)!}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                        사진 준비중
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="mb-1 inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {getNewsCategoryLabel(news.category)}
                    </span>
                    <p className="font-semibold text-card-foreground">{news.title}</p>
                    {news.summary ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {news.summary}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {news.source_type === "EXTERNAL" && news.source_name
                        ? `${news.source_name} · `
                        : null}
                      {new Date(news.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="mt-8 flex justify-center gap-2 text-sm">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/news?${categoryQuery}page=${p}`}
                  className={
                    p === page
                      ? "font-bold text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }
                >
                  {p}
                </Link>
              ))}
            </nav>
          ) : null}
        </section>
      </main>
      <PortalFooter />
    </div>
  );
}
