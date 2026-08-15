import Link from "next/link";
import { Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId, getYouTubeThumbnail } from "@/lib/utils/youtube";
import type { CardBlockProps } from "@/lib/blocks/types";

interface CardItem {
  title: string;
  description?: string;
  image?: string;
  isVideo?: boolean;
  href?: string;
}

async function loadSitePostItems(siteId: string, limit: number): Promise<CardItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_posts")
    .select("id, title, thumbnail_url, video_url, published_at")
    .eq("site_id", siteId)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((post) => {
    const youtubeId = extractYouTubeId(post.video_url);
    return {
      title: post.title,
      description: post.published_at
        ? new Date(post.published_at).toLocaleDateString("ko-KR")
        : undefined,
      image: post.thumbnail_url ?? (youtubeId ? getYouTubeThumbnail(youtubeId) : undefined),
      isVideo: Boolean(youtubeId),
      href: `/posts/${post.id}`,
    };
  });
}

export async function CardBlock({
  props,
  siteId,
}: {
  props: CardBlockProps;
  siteId: string;
}) {
  const limit = props.limit ?? 3;
  const items: CardItem[] =
    props.source === "site_posts"
      ? await loadSitePostItems(siteId, limit)
      : (props.items ?? []).map((item) => ({ ...item, isVideo: false }));

  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      {props.title ? (
        <h2 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
          {props.title}
        </h2>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        {items.map((item, i) => {
          const Card = (
            <div
              className={
                item.href
                  ? "group h-full border border-border bg-card p-5 transition-colors hover:border-accent"
                  : "group h-full border border-border bg-card p-5"
              }
            >
              {item.image ? (
                <div className="relative mb-4 aspect-video w-full overflow-hidden rounded-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                  {item.isVideo ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                      <span className="flex size-10 items-center justify-center rounded-full bg-white/90">
                        <Play className="size-4 translate-x-px fill-deep-forest text-deep-forest" aria-hidden />
                      </span>
                    </span>
                  ) : null}
                </div>
              ) : null}
              <p className="font-semibold text-card-foreground">
                {item.title}
              </p>
              {item.description ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </div>
          );
          return item.href ? (
            <Link key={item.title + i} href={item.href}>
              {Card}
            </Link>
          ) : (
            <div key={item.title + i}>{Card}</div>
          );
        })}
      </div>
    </section>
  );
}
