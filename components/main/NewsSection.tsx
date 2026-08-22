import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getNewsCategoryLabel } from "@/lib/news/categories";
import { proxiedImageSrc } from "@/lib/utils/image-proxy";
import { ImageWithFallback } from "@/components/main/ImageWithFallback";

export async function NewsSection() {
  const supabase = await createClient();
  const { data: newsList } = await supabase
    .from("news")
    .select("id, category, title, thumbnail_url, created_at")
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">담양소식</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            담양의 최신 소식과 유용한 정보를 확인해보세요.
          </p>
        </div>
        <Link
          href="/news"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          더보기
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>

      {!newsList?.length ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/50 px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">아직 등록된 소식이 없습니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border">
          {newsList.map((news) => (
            <li key={news.id}>
              <Link
                href={`/news/${news.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted"
              >
                <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {news.thumbnail_url ? (
                    <ImageWithFallback
                      src={proxiedImageSrc(news.thumbnail_url)!}
                      alt=""
                      className="h-full w-full object-cover"
                      fallback={
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Newspaper className="size-5" aria-hidden />
                        </div>
                      }
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Newspaper className="size-5" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                      {getNewsCategoryLabel(news.category)}
                    </span>
                    <span className="truncate font-medium text-foreground">{news.title}</span>
                  </div>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {new Date(news.created_at).toLocaleDateString("ko-KR")}
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
