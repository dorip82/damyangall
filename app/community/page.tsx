import Link from "next/link";
import { Paperclip, Link2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { COMMUNITY_CATEGORIES, getCommunityCategoryLabel } from "@/lib/community/categories";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalFooter } from "@/components/main/PortalFooter";
import { Button } from "@/components/ui/button";
import type { CommunityCategory } from "@/types/database";

export const dynamic = "force-dynamic";

function isCommunityCategory(value: string): value is CommunityCategory {
  return COMMUNITY_CATEGORIES.some((c) => c.value === value);
}

const PAGE_SIZE = 20;

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page: pageParam } = await searchParams;
  const activeCategory = category && isCommunityCategory(category) ? category : null;
  const page = Math.max(1, Number(pageParam ?? 1) || 1);

  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  let query = supabase
    .from("community_posts")
    .select(
      "id, category, author_name, title, created_at, image_url, attachment_url, link_url",
      { count: "exact" }
    )
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (activeCategory) query = query.eq("category", activeCategory);
  const { data: posts, count } = await query;

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const categoryQuery = activeCategory ? `category=${activeCategory}&` : "";

  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">커뮤니티</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                담양 이야기를 자유롭게 나눠보세요. 누구나 글을 작성할 수 있습니다.
              </p>
            </div>
            <Button render={<Link href="/community/new" />}>글쓰기</Button>
          </div>

          <nav className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/community"
              className={
                !activeCategory
                  ? "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground"
                  : "rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground hover:border-accent hover:text-accent"
              }
            >
              전체
            </Link>
            {COMMUNITY_CATEGORIES.map((c) => (
              <Link
                key={c.value}
                href={`/community?category=${c.value}`}
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

          {!posts?.length ? (
            <p className="text-sm text-muted-foreground">아직 등록된 글이 없습니다.</p>
          ) : (
            <ul className="divide-y divide-border rounded-2xl border border-border">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/community/${post.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted"
                  >
                    {post.image_url ? (
                      <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                          {getCommunityCategoryLabel(post.category)}
                        </span>
                        <span className="truncate font-medium text-foreground">
                          {post.title}
                        </span>
                        {post.attachment_url ? (
                          <Paperclip
                            className="size-3.5 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                        ) : null}
                        {post.link_url ? (
                          <Link2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                        ) : null}
                      </div>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        {post.author_name} ·{" "}
                        {new Date(post.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 ? (
            <nav className="mt-8 flex justify-center gap-2 text-sm">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/community?${categoryQuery}page=${p}`}
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
