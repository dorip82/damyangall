import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { ArrowLeft, CalendarDays, ChevronDown, ChevronUp, Download, Eye, Paperclip } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, getAssocContext } from "@/lib/assoc/data";
import { AssocBlocks } from "@/components/assoc/AssocBlocks";
import { AssocContainer, AssocPageHeader, CategoryBadge } from "@/components/assoc/ui";
import { YouTubeFacade } from "@/components/club/YouTubeFacade";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/utils/youtube";
import { parsePostBody, stripBodyImages } from "@/lib/site/post-body";
import type { SitePost } from "@/types/site";

function formatSize(bytes?: number) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/** Supabase 공개 주소에 ?download= 를 붙이면 원래 파일 이름으로 내려받는다 */
function downloadHref(url: string, name: string) {
  return `${url}${url.includes("?") ? "&" : "?"}download=${encodeURIComponent(name)}`;
}

type Props = { params: Promise<{ id: string }> };

async function loadPost(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { site, config } = await getAssocContext();
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_posts")
    .select("*")
    .eq("id", id)
    .eq("site_id", site.id)
    .eq("status", "PUBLISHED")
    .maybeSingle<SitePost>();
  return data ? { site, config, post: data, supabase } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const r = await loadPost(id);
  if (!r) return {};
  const text = r.post.content.blocks.find((b) => b.type === "text");
  const yt = extractYouTubeId(r.post.video_url);
  const image = r.post.thumbnail_url ?? (yt ? getYouTubeThumbnail(yt) : undefined);
  return {
    title: r.post.title,
    description: text?.type === "text" ? stripBodyImages(text.props.content).replace(/s+/g, " ").trim().slice(0, 120) : undefined,
    alternates: { canonical: `/news/${r.post.id}` },
    openGraph: { type: "article", images: image ? [image] : undefined },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { id } = await params;
  const r = await loadPost(id);
  if (!r) notFound();
  const { site, config, post, supabase } = r;
  const section = config.nav.find((n) => n.href === "/news")!;
  const cat = config.postCategories.find((c) => c.label === post.category);
  const youtubeId = extractYouTubeId(post.video_url);

  const textBlock = post.content.blocks.find((b) => b.id === "block-content" && b.type === "text");
  const otherBlocks = post.content.blocks.filter((b) => b !== textBlock);
  const segments = textBlock?.type === "text" ? parsePostBody(textBlock.props.content) : [];
  const attachments = Array.isArray(post.attachments) ? post.attachments : [];

  // 같은 분류 안에서 이전 글 · 다음 글
  const at = post.published_at ?? post.created_at;
  const base = () => {
    let q = supabase.from("site_posts").select("id, title").eq("site_id", site.id).eq("status", "PUBLISHED");
    if (post.category) q = q.eq("category", post.category);
    return q;
  };
  const [{ data: newer }, { data: older }] = await Promise.all([
    base().gt("published_at", at).order("published_at", { ascending: true }).limit(1).maybeSingle(),
    base().lt("published_at", at).order("published_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  after(async () => {
    await supabase.rpc("increment_site_post_view", { target_post_id: post.id });
  });

  return (
    <>
      <AssocPageHeader section={section} title={cat?.label ?? "활동소식"} current={cat?.href ?? "/news"} />
      <AssocContainer className="max-w-4xl">
        <article>
          <header className="border-b-2 border-primary pb-6">
            {post.category ? <CategoryBadge>{post.category}</CategoryBadge> : null}
            <h2 className="mt-3 text-2xl leading-snug font-extrabold text-primary sm:text-3xl">{post.title}</h2>
            <p className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden />
                <span className="sr-only">등록일</span>
                {formatDate(post.published_at ?? post.created_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="size-4" aria-hidden />
                조회 {post.view_count}
              </span>
            </p>
          </header>
          <div className="space-y-10 py-8">
            {youtubeId ? <YouTubeFacade videoId={youtubeId} title={post.title} className="rounded-2xl" /> : null}
            {segments.length ? (
              <div className="space-y-6">
                {segments.map((seg, i) =>
                  seg.type === "text" ? (
                    <p key={i} className="text-[16px] leading-[1.9] break-words whitespace-pre-line text-foreground/85">
                      {seg.text}
                    </p>
                  ) : (
                    <figure key={i}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={seg.url} alt={seg.alt === "사진" ? "" : seg.alt} loading="lazy" className="mx-auto h-auto max-w-full rounded-xl" />
                      {seg.alt && seg.alt !== "사진" ? (
                        <figcaption className="mt-2 text-center text-sm text-muted-foreground">{seg.alt}</figcaption>
                      ) : null}
                    </figure>
                  )
                )}
              </div>
            ) : null}
            {otherBlocks.length ? <AssocBlocks blocks={otherBlocks} siteId={site.id} /> : null}
          </div>
          {attachments.length ? (
            <section aria-labelledby="attach-title" className="mb-8 rounded-2xl border border-border bg-[var(--dba-soft)] p-5">
              <h3 id="attach-title" className="flex items-center gap-2 font-extrabold text-primary">
                <Paperclip className="size-4" aria-hidden />
                첨부파일 <span className="text-sm font-bold text-muted-foreground">{attachments.length}</span>
              </h3>
              <ul className="mt-3 space-y-2">
                {attachments.map((a) => (
                  <li key={a.url}>
                    <a
                      href={downloadHref(a.url, a.name)}
                      className="group flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-border hover:ring-[var(--dba-blue)]"
                    >
                      <Download className="size-4 shrink-0 text-[var(--dba-blue)]" aria-hidden />
                      <span className="min-w-0 flex-1 truncate font-semibold group-hover:underline">{a.name}</span>
                      {formatSize(a.size) ? <span className="shrink-0 text-sm text-muted-foreground">{formatSize(a.size)}</span> : null}
                      <span className="sr-only">내려받기</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
        <nav aria-label="이전 글, 다음 글" className="border-y border-border text-[15px]">
          {[
            { label: "다음 글", icon: ChevronUp, item: newer },
            { label: "이전 글", icon: ChevronDown, item: older },
          ].map(({ label, icon: Icon, item }) => (
            <div key={label} className="flex items-center gap-4 border-b border-border px-2 py-3.5 last:border-b-0">
              <span className="flex w-20 shrink-0 items-center gap-1 font-bold text-primary">
                <Icon className="size-4" aria-hidden />
                {label}
              </span>
              {item ? (
                <Link href={`/news/${item.id}`} className="min-w-0 truncate hover:text-[var(--dba-blue)] hover:underline">
                  {item.title}
                </Link>
              ) : (
                <span className="text-muted-foreground">{label === "다음 글" ? "다음 글이 없습니다." : "이전 글이 없습니다."}</span>
              )}
            </div>
          ))}
        </nav>
        <div className="pt-6">
          <Link
            href={cat?.href ?? "/news"}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 font-bold text-primary hover:border-primary"
          >
            <ArrowLeft className="size-4" aria-hidden />
            목록으로
          </Link>
        </div>
      </AssocContainer>
    </>
  );
}
