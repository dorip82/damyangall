import Link from "next/link";
import { Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getNewsCategoryLabel } from "@/lib/news/categories";
import { proxiedImageSrc } from "@/lib/utils/image-proxy";
import { ImageWithFallback } from "@/components/main/ImageWithFallback";
import { SectionHeading } from "@/components/main/SectionHeading";

const thumbFallback = (
  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
    <Newspaper className="size-5" aria-hidden />
  </div>
);

export async function NewsSection() {
  const supabase = await createClient();
  const { data: newsList } = await supabase
    .from("news")
    .select("id, category, title, thumbnail_url, created_at, source_name")
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div>
      <SectionHeading
        id="news-title"
        eyebrow="News"
        title="최신 담양소식"
        description="담양의 최신 소식과 유용한 정보를 확인해보세요."
        href="/news"
      />

      {!newsList?.length ? (
        <EmptyBox>아직 등록된 소식이 없습니다.</EmptyBox>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_10px_rgba(27,42,34,0.05)]">
          {newsList.map((news) => {
            const thumb = proxiedImageSrc(news.thumbnail_url);
            return (
              <li key={news.id} className="border-b border-border last:border-b-0">
                <Link
                  href={`/news/${news.id}`}
                  className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/70 sm:px-5"
                >
                  <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-[72px]">
                    {thumb ? (
                      <ImageWithFallback src={thumb} alt="" className="h-full w-full object-cover" fallback={thumbFallback} />
                    ) : (
                      thumbFallback
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-semibold leading-snug text-foreground break-keep">
                      {news.title}
                    </p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span className="rounded-full bg-accent/12 px-2 py-0.5 font-semibold text-accent">
                        {getNewsCategoryLabel(news.category)}
                      </span>
                      {news.source_name ? <span>{news.source_name}</span> : null}
                      <time dateTime={news.created_at}>
                        {new Date(news.created_at).toLocaleDateString("ko-KR")}
                      </time>
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function EmptyBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}
