import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Paperclip, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCommunityCategoryLabel } from "@/lib/community/categories";
import { isSafeHttpUrl } from "@/lib/utils/safe-url";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalFooter } from "@/components/main/PortalFooter";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

type CommunityPost = Database["public"]["Tables"]["community_posts"]["Row"];

export const dynamic = "force-dynamic";

export default async function CommunityPostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("community_posts")
    .select("*")
    .eq("id", id)
    .eq("status", "PUBLISHED")
    .maybeSingle<CommunityPost>();

  if (!post) notFound();

  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-4xl px-6 py-16">
          <Link
            href="/community"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            목록으로
          </Link>

          <span className="mb-2 inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
            {getCommunityCategoryLabel(post.category)}
          </span>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{post.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {post.author_name} ·{" "}
            {new Date(post.created_at).toLocaleDateString("ko-KR")}
          </p>
          {post.image_url ? (
            <div className="mt-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image_url}
                alt=""
                className="max-h-[32rem] w-full rounded-2xl border border-border object-cover"
              />
            </div>
          ) : null}

          <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-foreground/80">
            {post.content}
          </div>

          {post.attachment_url || isSafeHttpUrl(post.link_url) ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.attachment_url ? (
                <a
                  href={post.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:border-accent hover:text-accent"
                >
                  <Paperclip className="size-4" aria-hidden />
                  {post.attachment_name || "첨부파일"}
                </a>
              ) : null}
              {isSafeHttpUrl(post.link_url) ? (
                <a
                  href={post.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:border-accent hover:text-accent"
                >
                  <ExternalLink className="size-4" aria-hidden />
                  {post.link_url}
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="mt-10 border-t border-border pt-6">
            <Button variant="outline" render={<Link href="/community" />}>
              목록보기
            </Button>
          </div>
        </article>
      </main>
      <PortalFooter />
    </div>
  );
}
