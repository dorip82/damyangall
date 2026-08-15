import { notFound, redirect } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { PostForm } from "@/components/admin/PostForm";
import { createPost } from "@/app/admin/(protected)/posts/actions";

export default async function AdminNewPostPage() {
  const slug = await getCurrentSiteSlug();
  if (!slug) redirect("/");
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">활동내역 등록</h1>
      <PostForm siteId={site.id} action={createPost} submitLabel="등록" />
    </div>
  );
}
