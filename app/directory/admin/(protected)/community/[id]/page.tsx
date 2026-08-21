import { notFound } from "next/navigation";
import { Paperclip, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCommunityCategoryLabel } from "@/lib/community/categories";
import { isSafeHttpUrl } from "@/lib/utils/safe-url";
import { Badge } from "@/components/ui/badge";
import { CommunityModerationActions } from "@/components/admin/CommunityModerationActions";
import type { Database } from "@/types/database";

type CommunityPost = Database["public"]["Tables"]["community_posts"]["Row"];

export default async function AdminCommunityDetailPage({
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
    .maybeSingle<CommunityPost>();

  if (!post) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{post.title}</h1>
            {post.status === "HIDDEN" ? <Badge variant="destructive">숨김</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {getCommunityCategoryLabel(post.category)} · {post.author_name} ·{" "}
            {new Date(post.created_at).toLocaleString("ko-KR")}
          </p>
        </div>
        <CommunityModerationActions postId={post.id} status={post.status} />
      </div>

      {post.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.image_url}
          alt=""
          className="max-h-96 w-full rounded-md border border-border object-cover"
        />
      ) : null}

      <p className="whitespace-pre-line rounded-md border border-border bg-card p-4 text-sm leading-relaxed text-card-foreground">
        {post.content}
      </p>

      {post.attachment_url || isSafeHttpUrl(post.link_url) ? (
        <div className="flex flex-wrap gap-2">
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
    </div>
  );
}
