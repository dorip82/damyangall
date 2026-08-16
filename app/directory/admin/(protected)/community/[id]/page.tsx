import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCommunityCategoryLabel } from "@/lib/community/categories";
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

      <p className="whitespace-pre-line rounded-md border border-border bg-card p-4 text-sm leading-relaxed text-card-foreground">
        {post.content}
      </p>
    </div>
  );
}
