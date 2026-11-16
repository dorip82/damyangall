import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { ArrowLeft, CalendarDays, Eye } from "lucide-react";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { YouTubeEmbed } from "@/components/site/YouTubeEmbed";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/utils/youtube";
import { POST_TABS, classifyPost, getPostPhotos } from "@/lib/site/posts";
import { formatPostDate } from "@/lib/site/load-posts";
import type { SitePost } from "@/types/site";

const TAB_LABEL = Object.fromEntries(POST_TABS.map((t) => [t.value, t.label]));

async function loadPost(postId: string) {
  const slug = await getCurrentSiteSlug();
  if (!slug) return null;
  const site = await getSiteBySlug(slug);
  if (!site) return null;

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("site_posts")
    .select("*")
    .eq("id", postId)
    .eq("site_id", site.id)
    .eq("status", "PUBLISHED")
    .maybeSingle<SitePost>();
  return post ? { site, post, supabase } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: string }>;
}): Promise<Metadata> {
  const { postId } = await params;
  const loaded = await loadPost(postId);
  if (!loaded) return {};
  const { post } = loaded;
  const youtubeId = extractYouTubeId(post.video_url);
  const image = post.thumbnail_url ?? (youtubeId ? getYouTubeThumbnail(youtubeId) : undefined);
  return {
    title: post.title,
    openGraph: { title: post.title, images: image ? [image] : undefined },
  };
}

export default async function SitePostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const loaded = await loadPost(postId);
  if (!loaded) notFound();
  const { site, post, supabase } = loaded;

  after(async () => {
    await supabase.rpc("increment_site_post_view", { target_post_id: post.id });
  });

  const youtubeId = extractYouTubeId(post.video_url);
  const hasPhotos = getPostPhotos({ content: post.content, thumbnail_url: youtubeId ? null : post.thumbnail_url }).length > 0;
  const tab = classifyPost({ category: post.category, title: post.title, video_url: post.video_url, hasPhotos });
  const date = formatPostDate(post.published_at);

  return (
    <article className="bg-[linear-gradient(180deg,var(--club-beige)_0px,#ffffff_320px)]">
      <div className="mx-auto max-w-4xl px-4 pt-10 pb-16 sm:px-6 lg:pt-14">
        <Link
          href={`/posts?tab=${tab}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--club-green-light)] px-3 py-1 text-sm font-semibold text-[var(--club-green-dark)] hover:bg-[#d6e4c7]"
        >
          {TAB_LABEL[tab]}
        </Link>
        <h1 className="mt-4 text-2xl leading-snug font-extrabold tracking-tight text-primary break-keep sm:text-3xl">
          {post.title}
        </h1>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {date ? (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden />
              <time dateTime={post.published_at ?? undefined}>{date}</time>
            </span>
          ) : null}
          <span className="flex items-center gap-1.5">
            <Eye className="size-4" aria-hidden />
            조회 {post.view_count}
          </span>
        </p>

        {youtubeId ? (
          <div className="mt-8 overflow-hidden rounded-2xl shadow-[0_14px_34px_rgba(30,53,92,0.15)]">
            <YouTubeEmbed videoId={youtubeId} title={post.title} />
          </div>
        ) : null}

        <div className="mt-4 [&_section]:max-w-none [&_section]:px-0 [&_section]:py-8">
          <BlockRenderer blocks={post.content.blocks} siteId={site.id} />
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-4" aria-hidden />
            목록보기
          </Link>
        </div>
      </div>
    </article>
  );
}
