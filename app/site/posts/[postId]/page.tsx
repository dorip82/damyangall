import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { YouTubeEmbed } from "@/components/site/YouTubeEmbed";
import { extractYouTubeId } from "@/lib/utils/youtube";
import { Button } from "@/components/ui/button";
import type { SitePost } from "@/types/site";

export default async function SitePostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const slug = await getCurrentSiteSlug();
  if (!slug) notFound();
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("site_posts")
    .select("*")
    .eq("id", postId)
    .eq("site_id", site.id)
    .eq("status", "PUBLISHED")
    .maybeSingle<SitePost>();

  if (!post) notFound();

  after(async () => {
    await supabase.rpc("increment_site_post_view", { target_post_id: post.id });
  });

  const youtubeId = extractYouTubeId(post.video_url);

  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm text-accent">{post.category}</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground">{post.title}</h1>
      {post.published_at ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {new Date(post.published_at).toLocaleDateString("ko-KR")} · 조회{" "}
          {post.view_count}
        </p>
      ) : null}
      {youtubeId ? (
        <div className="mt-6">
          <YouTubeEmbed videoId={youtubeId} title={post.title} />
        </div>
      ) : null}
      <div className="mt-10">
        <BlockRenderer blocks={post.content.blocks} siteId={site.id} />
      </div>

      <div className="mt-10 border-t border-border pt-6">
        <Button variant="outline" render={<Link href="/posts" />}>
          목록보기
        </Button>
      </div>
    </article>
  );
}
