import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCommunityCategoryLabel } from "@/lib/community/categories";
import { Badge } from "@/components/ui/badge";

export default async function AdminCommunityListPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("community_posts")
    .select("id, category, title, author_name, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">커뮤니티</h1>

      {!posts?.length ? (
        <p className="text-sm text-muted-foreground">등록된 글이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/directory/admin/community/${post.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted"
              >
                <div>
                  <p className="font-medium text-foreground">{post.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {getCommunityCategoryLabel(post.category)} · {post.author_name} ·{" "}
                    {new Date(post.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                {post.status === "HIDDEN" ? (
                  <Badge variant="destructive">숨김</Badge>
                ) : (
                  <Badge>게시됨</Badge>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
