import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCommunityCategoryLabel } from "@/lib/community/categories";
import { SectionHeading } from "@/components/main/SectionHeading";
import { EmptyBox } from "@/components/main/NewsSection";

/**
 * 커뮤니티 최신 글. 조회수·추천 같은 인기 지표는 저장하지 않으므로 "인기"가
 * 아니라 최신순으로 보여준다.
 */
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
      <SectionHeading
        id="community-title"
        eyebrow="Community"
        title="커뮤니티 새 글"
        description="소통하고 나누며 함께 만들어가는 공간입니다."
        href="/community"
      />

      {!posts?.length ? (
        <EmptyBox>
          아직 등록된 글이 없습니다.{" "}
          <Link href="/community/new" className="font-semibold text-primary underline-offset-4 hover:underline">
            첫 번째 글을 남겨보세요
          </Link>
        </EmptyBox>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_10px_rgba(27,42,34,0.05)]">
          {posts.map((post) => (
            <li key={post.id} className="border-b border-border last:border-b-0">
              <Link
                href={`/community/${post.id}`}
                className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/70 sm:px-5"
              >
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground sm:size-[72px]">
                  {post.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.image_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <MessageCircle className="size-5" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-semibold leading-snug text-foreground break-keep">
                    {post.title}
                  </p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span className="rounded-full bg-accent/12 px-2 py-0.5 font-semibold text-accent">
                      {getCommunityCategoryLabel(post.category)}
                    </span>
                    <span>{post.author_name}</span>
                    <time dateTime={post.created_at}>
                      {new Date(post.created_at).toLocaleDateString("ko-KR")}
                    </time>
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
