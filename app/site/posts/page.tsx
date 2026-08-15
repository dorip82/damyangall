import Link from "next/link";
import { notFound } from "next/navigation";
import { Play } from "lucide-react";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/utils/youtube";

const PAGE_SIZE = 20;

export default async function SitePostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1) || 1);

  const slug = await getCurrentSiteSlug();
  if (!slug) notFound();
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  const { data: posts, count } = await supabase
    .from("site_posts")
    .select("id, title, thumbnail_url, video_url, published_at", { count: "exact" })
    .eq("site_id", site.id)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        활동내역
      </h1>

      {!posts?.length ? (
        <p className="text-sm text-muted-foreground">
          아직 등록된 활동내역이 없습니다.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => {
            const youtubeId = extractYouTubeId(post.video_url);
            const image = post.thumbnail_url ?? (youtubeId ? getYouTubeThumbnail(youtubeId) : null);
            return (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="group overflow-hidden border border-border bg-card transition-colors hover:border-accent"
              >
                {image ? (
                  <div className="relative aspect-video w-full overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="" className="h-full w-full object-cover" />
                    {youtubeId ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                        <span className="flex size-12 items-center justify-center rounded-full bg-white/90">
                          <Play className="size-5 translate-x-px fill-deep-forest text-deep-forest" aria-hidden />
                        </span>
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <div className="p-4">
                  <p className="font-medium text-card-foreground">{post.title}</p>
                  {post.published_at ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(post.published_at).toLocaleDateString("ko-KR")}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="mt-8 flex justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/posts?page=${p}`}
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
  );
}
