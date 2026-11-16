import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ImageIcon, Play } from "lucide-react";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";
import { PageHeader } from "@/components/club/PageHeader";
import { PhotoLightbox } from "@/components/club/PhotoLightbox";
import { formatPostDate, loadClubPosts } from "@/lib/site/load-posts";
import { POST_TABS, classifyPost, isPostTab, postMatchesTab } from "@/lib/site/posts";
import { getClubPreset } from "@/lib/site/club-preset";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

const TAB_LABEL = Object.fromEntries(POST_TABS.map((t) => [t.value, t.label]));

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getCurrentSiteSlug();
  return { title: (slug && getClubPreset(slug).nav?.["/posts"]?.label) || "활동내역" };
}

export default async function SitePostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tab?: string }>;
}) {
  const { page: pageParam, tab: tabParam } = await searchParams;
  const tab = isPostTab(tabParam) ? tabParam : "all";
  const page = Math.max(1, Number(pageParam ?? 1) || 1);

  const slug = await getCurrentSiteSlug();
  if (!slug) notFound();
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const preset = getClubPreset(slug);
  const allPosts = await loadClubPosts(site.id);
  const filtered = allPosts.filter((p) => postMatchesTab(p, tab));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const posts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const photos =
    tab === "photo" || tab === "all"
      ? allPosts.flatMap((p) => p.photos.map((ph) => ({ ...ph, caption: ph.caption ?? p.title })))
      : [];

  const tabHref = (value: string) => (value === "all" ? "/posts" : `/posts?tab=${value}`);
  const pageHref = (p: number) => `/posts?${tab !== "all" ? `tab=${tab}&` : ""}page=${p}`;

  return (
    <>
      <PageHeader
        eyebrow="Activities"
        title={preset.nav?.["/posts"]?.label ?? "활동내역"}
        description="공연 영상과 행사 사진, 정기 연습까지 소리향기의 활동을 최신순으로 전합니다."
        tabs={POST_TABS.map((t) => ({ label: t.label, href: tabHref(t.value) }))}
        activeHref={tabHref(tab)}
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        {tab === "photo" || (tab === "all" && photos.length) ? (
          <section aria-labelledby="gallery-title" className="mb-14">
            <h2 id="gallery-title" className="mb-6 flex items-center gap-2 text-2xl font-extrabold text-primary">
              <ImageIcon className="size-6 text-[var(--club-green)]" aria-hidden />
              공연 및 행사 사진
            </h2>
            {photos.length ? (
              <PhotoLightbox photos={photos} limit={tab === "photo" ? undefined : 8} />
            ) : (
              <p className="rounded-2xl border border-dashed border-input bg-[var(--club-beige)] px-6 py-12 text-center text-muted-foreground">
                아직 등록된 활동 사진이 없습니다.
              </p>
            )}
          </section>
        ) : null}

        {tab !== "photo" ? (
          <section aria-label={`${TAB_LABEL[tab]} 게시물`}>
            {!posts.length ? (
              <p className="rounded-2xl border border-dashed border-input bg-[var(--club-beige)] px-6 py-12 text-center text-muted-foreground">
                {tab === "all" ? "아직 등록된 활동소식이 없습니다." : `아직 등록된 ${TAB_LABEL[tab]} 게시물이 없습니다.`}
              </p>
            ) : (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => {
                  const image =
                    post.thumbnail_url ??
                    (post.youtubeId ? getYouTubeThumbnail(post.youtubeId) : post.photos[0]?.url ?? null);
                  const date = formatPostDate(post.published_at);
                  return (
                    <li key={post.id}>
                      <Link
                        href={`/posts/${post.id}`}
                        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-[0_4px_18px_rgba(30,53,92,0.06)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(30,53,92,0.12)]"
                      >
                        <div className="relative aspect-video overflow-hidden bg-[var(--club-green-light)]">
                          {image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={image}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          ) : null}
                          {post.youtubeId ? (
                            <span aria-hidden className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/25">
                              <span className="flex h-11 w-16 items-center justify-center rounded-xl bg-[#ff0000] shadow-lg transition-transform group-hover:scale-110">
                                <Play className="size-5 translate-x-px fill-white text-white" />
                              </span>
                            </span>
                          ) : null}
                          <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-primary shadow-sm">
                            {TAB_LABEL[classifyPost(post)]}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <h2 className="line-clamp-2 font-bold leading-snug text-foreground break-keep group-hover:text-primary">
                            {post.title}
                          </h2>
                          {date ? (
                            <p className="mt-auto flex items-center gap-1.5 pt-3 text-sm text-muted-foreground">
                              <CalendarDays className="size-4" aria-hidden />
                              <time dateTime={post.published_at ?? undefined}>{date}</time>
                            </p>
                          ) : null}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {totalPages > 1 ? (
              <nav aria-label="페이지" className="mt-10 flex justify-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    aria-current={p === page ? "page" : undefined}
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                      p === page ? "bg-[var(--club-navy)] text-white" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {p}
                  </Link>
                ))}
              </nav>
            ) : null}
          </section>
        ) : null}
      </div>
    </>
  );
}
