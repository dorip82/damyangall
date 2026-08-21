import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CommunityEditForm } from "@/components/admin/CommunityEditForm";
import { DeleteCommunityPostButton } from "@/components/admin/DeleteCommunityPostButton";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">글 수정</h1>
        <DeleteCommunityPostButton postId={post.id} />
      </div>
      <CommunityEditForm post={post} />
    </div>
  );
}
