import { notFound, redirect } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { PostForm } from "@/components/admin/PostForm";
import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { updatePost } from "@/app/admin/(protected)/posts/actions";
import type { SitePost } from "@/types/site";

export default async function AdminEditPostPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  const slug = await getCurrentSiteSlug();
  if (!slug) redirect("/");
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("site_posts")
    .select("*")
    .eq("id", postId)
    .eq("site_id", site.id)
    .maybeSingle<SitePost>();

  if (!post) notFound();

  const boundUpdate = updatePost.bind(null, postId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">활동내역 수정</h1>
        <DeletePostButton postId={post.id} siteId={site.id} />
      </div>
      <PostForm siteId={site.id} post={post} action={boundUpdate} submitLabel="저장" />
    </div>
  );
}
