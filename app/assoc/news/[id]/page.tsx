import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { ArrowLeft, CalendarDays, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, getAssocContext } from "@/lib/assoc/data";
import { AssocBlocks } from "@/components/assoc/AssocBlocks";
import { AssocContainer, AssocPageHeader, CategoryBadge } from "@/components/assoc/ui";
import { YouTubeFacade } from "@/components/club/YouTubeFacade";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/utils/youtube";
import type { SitePost } from "@/types/site";

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
    description: text?.type === "text" ? text.props.content.slice(0, 120) : undefined,
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
            {post.content.blocks.length ? <AssocBlocks blocks={post.content.blocks} siteId={site.id} /> : null}
          </div>
        </article>
        <div className="border-t border-border pt-6">
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
