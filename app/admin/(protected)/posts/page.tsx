import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function AdminPostsListPage() {
  const slug = await getCurrentSiteSlug();
  if (!slug) redirect("/");
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("site_posts")
    .select("id, title, category, status, published_at, created_at")
    .eq("site_id", site.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">활동내역</h1>
        <Button render={<Link href="/admin/posts/new" />}>
          <Plus className="size-4" /> 새 활동내역
        </Button>
      </div>

      {!posts?.length ? (
        <p className="text-sm text-muted-foreground">등록된 활동내역이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/admin/posts/${post.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted"
              >
                <div>
                  <p className="font-medium text-foreground">{post.title}</p>
                  <p className="text-sm text-muted-foreground">{post.category}</p>
                </div>
                <Badge variant={post.status === "PUBLISHED" ? "default" : "outline"}>
                  {post.status === "PUBLISHED" ? "게시됨" : "임시저장"}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
