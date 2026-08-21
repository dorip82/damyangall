import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCommunityCategoryLabel } from "@/lib/community/categories";

export async function CommunitySection() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("community_posts")
    .select("id, category, author_name, title, created_at, image_url")
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">커뮤니티</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            소통하고 나누며 함께 만들어가는 공간입니다.
          </p>
        </div>
        <Link
          href="/community"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          더보기
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      {!posts?.length ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/50 px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">아직 등록된 글이 없습니다.</p>
          <Link
            href="/community/new"
            className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
          >
            첫 번째 글을 남겨보세요
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/community/${post.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted"
              >
                {post.image_url ? (
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={post.image_url} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {getCommunityCategoryLabel(post.category)}
                    </span>
                    <span className="truncate font-medium text-foreground">{post.title}</span>
                  </div>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {post.author_name} · {new Date(post.created_at).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
