import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, ImageIcon, PlayCircle } from "lucide-react";
import { formatDate, getAssocContext, loadPosts, type AssocPost } from "@/lib/assoc/data";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";
import { AssocContainer, AssocPageHeader, CategoryBadge, EmptyState } from "@/components/assoc/ui";

export type NewsKind = "all" | "notice" | "association" | "press" | "gallery" | "video";

const KIND: Record<NewsKind, { title: string; description: string; current: string; categories?: string[] }> = {
  all: { title: "활동소식", description: "협회의 공지와 소식, 사진과 영상을 모았습니다.", current: "/news" },
  notice: { title: "공지사항", description: "협회 공지사항입니다.", current: "/news/notice", categories: ["공지사항"] },
  association: { title: "협회 소식", description: "협회 활동 소식입니다.", current: "/news/association", categories: ["협회 소식"] },
  press: { title: "보도자료", description: "언론에 소개된 협회 소식입니다.", current: "/news/press", categories: ["보도자료"] },
  gallery: { title: "사진 갤러리", description: "경기와 행사 사진입니다. 사진을 누르면 크게 볼 수 있습니다.", current: "/news/gallery" },
  video: { title: "동영상 갤러리", description: "경기와 행사 영상입니다.", current: "/news/video" },
};

const PAGE_SIZE = 12;

export function newsMetadata(kind: NewsKind) {
  const k = KIND[kind];
  return { title: k.title, description: k.description, alternates: { canonical: k.current } };
}

export async function NewsListPage({ kind, page: pageParam }: { kind: NewsKind; page?: string }) {
  const { site, config } = await getAssocContext();
  const section = config.nav.find((n) => n.href === "/news")!;
  const def = KIND[kind];

  let posts: AssocPost[];
  if (kind === "gallery") posts = await loadPosts(site.id, { onlyPhotos: true });
  else if (kind === "video") posts = await loadPosts(site.id, { onlyVideo: true });
  else posts = await loadPosts(site.id, { categories: def.categories });

  const pages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number(pageParam) || 1));
  const shown = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const visual = kind === "gallery" || kind === "video";

  return (
    <>
      <AssocPageHeader
        section={{ ...section, children: [{ label: "전체", href: "/news" }, ...section.children] }}
        title={def.title}
        description={def.description}
        current={def.current}
      />
      <AssocContainer>
        {!shown.length ? (
          <EmptyState title="등록된 게시물이 없습니다" description="새 소식이 등록되면 이곳에 표시됩니다." />
        ) : visual ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => {
              const cover = kind === "video" && p.youtubeId ? getYouTubeThumbnail(p.youtubeId) : (p.photos[0]?.url ?? p.thumbnail_url);
              return (
                <li key={p.id}>
                  <Link href={`/news/${p.id}`} className="group block overflow-hidden rounded-2xl border border-border bg-white shadow-sm hover:shadow-md">
                    <div className="relative aspect-video bg-[var(--dba-soft)]">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : null}
                      {kind === "video" ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <PlayCircle className="size-14 text-white drop-shadow" aria-hidden />
                        </span>
                      ) : p.photos.length > 1 ? (
                        <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white">
                          <ImageIcon className="size-3.5" aria-hidden />
                          {p.photos.length}
                        </span>
                      ) : null}
                    </div>
                    <div className="p-4">
                      <p className="line-clamp-2 font-bold text-foreground group-hover:text-[var(--dba-blue)]">{p.title}</p>
                      <p className="mt-1.5 text-sm text-muted-foreground">{formatDate(p.published_at)}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            <div className="hidden grid-cols-[110px_1fr_120px_80px] border-b border-border bg-[var(--dba-soft)] px-5 py-3 text-sm font-bold text-muted-foreground md:grid">
              <span>구분</span>
              <span>제목</span>
              <span className="text-center">등록일</span>
              <span className="text-center">조회</span>
            </div>
            <ul className="divide-y divide-border">
              {shown.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/news/${p.id}`}
                    className="group grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 px-5 py-4 hover:bg-[var(--dba-soft)] md:grid-cols-[110px_1fr_120px_80px]"
                  >
                    <span>
                      <CategoryBadge>{p.category ?? "소식"}</CategoryBadge>
                    </span>
                    <span className="min-w-0 truncate text-[16px] font-semibold group-hover:text-[var(--dba-blue)]">{p.title}</span>
                    <span className="col-span-2 text-sm text-muted-foreground tabular-nums md:col-span-1 md:text-center">
                      {formatDate(p.published_at)}
                    </span>
                    <span className="hidden items-center justify-center gap-1 text-sm text-muted-foreground md:flex">
                      <Eye className="size-3.5" aria-hidden />
                      <span className="sr-only">조회수</span>
                      {p.view_count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {pages > 1 ? (
          <nav aria-label="페이지 이동" className="mt-10 flex items-center justify-center gap-1">
            {page > 1 ? (
              <Link href={`${def.current}?page=${page - 1}`} aria-label="이전 페이지" className="flex size-10 items-center justify-center rounded-full border border-border hover:border-primary">
                <ChevronLeft className="size-4" aria-hidden />
              </Link>
            ) : null}
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={`${def.current}?page=${n}`}
                aria-current={n === page ? "page" : undefined}
                className={
                  n === page
                    ? "flex size-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground"
                    : "flex size-10 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
                }
              >
                {n}
              </Link>
            ))}
            {page < pages ? (
              <Link href={`${def.current}?page=${page + 1}`} aria-label="다음 페이지" className="flex size-10 items-center justify-center rounded-full border border-border hover:border-primary">
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            ) : null}
          </nav>
        ) : null}
      </AssocContainer>
    </>
  );
}
