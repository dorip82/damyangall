import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getNewsCategoryLabel } from "@/lib/news/categories";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalFooter } from "@/components/main/PortalFooter";
import type { NewsRow } from "@/types/news";

export const dynamic = "force-dynamic";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .eq("status", "PUBLISHED")
    .maybeSingle<NewsRow>();

  if (!news) notFound();

  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16">
          <Link
            href="/news"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            목록으로
          </Link>

          <div className="mb-6 aspect-video w-full">
            {news.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={news.thumbnail_url}
                alt=""
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
                사진 준비중
              </div>
            )}
          </div>

          <span className="mb-2 inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
            {getNewsCategoryLabel(news.category)}
          </span>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{news.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {new Date(news.created_at).toLocaleDateString("ko-KR")}
          </p>

          {news.summary ? (
            <p className="mt-4 text-base font-medium text-foreground/90">{news.summary}</p>
          ) : null}

          <p className="mt-4 whitespace-pre-line border-t border-border pt-6 text-base leading-relaxed text-foreground/80">
            {news.content}
          </p>
        </article>
      </main>
      <PortalFooter />
    </div>
  );
}
