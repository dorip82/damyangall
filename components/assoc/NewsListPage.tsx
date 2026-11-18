import Link from "next/link";
import { ChevronLeft, ChevronRight, ImageIcon, PlayCircle } from "lucide-react";
import { formatDate, getAssocContext, loadPosts, type AssocPost } from "@/lib/assoc/data";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";
import { AssocContainer, AssocPageHeader, EmptyState } from "@/components/assoc/ui";
import { BoardList, BoardSearch } from "@/components/assoc/BoardList";

/** 렌더 함수 밖에서 현재 시각을 읽는다 (요청마다 새로 그리는 서버 컴포넌트) */
function nowMs() {
  return Date.now();
}

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
const BOARD_SIZE = 15;

export function newsMetadata(kind: NewsKind) {
  const k = KIND[kind];
  return { title: k.title, description: k.description, alternates: { canonical: k.current } };
}

export async function NewsListPage({ kind, page: pageParam, q: qParam }: { kind: NewsKind; page?: string; q?: string }) {
  const q = qParam?.trim().slice(0, 50) || undefined;
  const { site, config } = await getAssocContext();
  const section = config.nav.find((n) => n.href === "/news")!;
  const def = KIND[kind];

  let posts: AssocPost[];
  if (kind === "gallery") posts = await loadPosts(site.id, { onlyPhotos: true });
  else if (kind === "video") posts = await loadPosts(site.id, { onlyVideo: true });
  else posts = await loadPosts(site.id, { categories: def.categories, query: q });

  const visual = kind === "gallery" || kind === "video";
  // 게시판: 상단 고정 글은 검색이 아닐 때 매 페이지 맨 위에 따로 보여준다.
  const pinned = !visual && !q ? posts.filter((p) => p.isPinned) : [];
  const listed = pinned.length ? posts.filter((p) => !p.isPinned) : posts;
  const size = visual ? PAGE_SIZE : BOARD_SIZE;
  const pages = Math.max(1, Math.ceil(listed.length / size));
  const page = Math.min(pages, Math.max(1, Number(pageParam) || 1));
  const shown = listed.slice((page - 1) * size, page * size);
  const pageHref = (n: number) => `${def.current}?${q ? `q=${encodeURIComponent(q)}&` : ""}page=${n}`;

  return (
    <>
      <AssocPageHeader
        section={{ ...section, children: [{ label: "전체", href: "/news" }, ...section.children] }}
        title={def.title}
        description={def.description}
        current={def.current}
      />
      <AssocContainer>
        {!visual ? <BoardSearch action={def.current} q={q} total={listed.length} /> : null}
        {!shown.length && !pinned.length ? (
          <EmptyState title={q ? "검색 결과가 없습니다" : "등록된 게시물이 없습니다"} description={q ? "다른 낱말로 검색해 보세요." : "새 소식이 등록되면 이곳에 표시됩니다."} />
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
          <BoardList pinned={pinned} rows={shown} startNumber={listed.length - (page - 1) * size} showCategory={kind === "all"} now={nowMs()} />
        )}

        {pages > 1 ? (
          <nav aria-label="페이지 이동" className="mt-10 flex items-center justify-center gap-1">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} aria-label="이전 페이지" className="flex size-10 items-center justify-center rounded-full border border-border hover:border-primary">
                <ChevronLeft className="size-4" aria-hidden />
              </Link>
            ) : null}
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={pageHref(n)}
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
              <Link href={pageHref(page + 1)} aria-label="다음 페이지" className="flex size-10 items-center justify-center rounded-full border border-border hover:border-primary">
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            ) : null}
          </nav>
        ) : null}
      </AssocContainer>
    </>
  );
}
