import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchHtml } from "@/lib/news-scraper/fetch-html";
import { extractOgMeta } from "@/lib/news-scraper/extract-og";
import { isSimilarTitle } from "@/lib/news-scraper/similarity";
import { NEWS_SOURCES, isSameKstDay } from "@/lib/news-scraper/sources";

const CANDIDATES_PER_SOURCE = 6;
const SUMMARY_MAX_LENGTH = 400;

interface StagedArticle {
  title: string;
  summary: string;
  content: string;
  thumbnailUrl: string | null;
  sourceName: string;
  sourceUrl: string;
}

export interface NewsFetchResult {
  source: string;
  found: number;
  inserted: number;
  skipped: number;
  error?: string;
}

/**
 * Pulls today's Damyang articles from the configured local news sites and
 * inserts them as EXTERNAL news rows. Safe to run repeatedly (daily cron,
 * or an admin's manual "지금 수집하기" click) — already-seen URLs are
 * skipped up front via the source_url unique index, and near-duplicate
 * headlines (same story, different outlet) are collapsed within a run.
 */
export async function runNewsFetch(): Promise<NewsFetchResult[]> {
  const supabase = createAdminClient();
  const now = new Date();

  const { data: existingRows } = await supabase
    .from("news")
    .select("source_url")
    .not("source_url", "is", null);
  const knownUrls = new Set((existingRows ?? []).map((r) => r.source_url));

  const results = await Promise.all(
    NEWS_SOURCES.map(async (source): Promise<NewsFetchResult> => {
      try {
        const listHtml = await fetchHtml(source.listUrl, source.charset);
        if (!listHtml) {
          return { source: source.name, found: 0, inserted: 0, skipped: 0, error: "목록 페이지를 가져오지 못했습니다." };
        }

        const candidates = source
          .extractLinks(listHtml)
          .filter((url) => !knownUrls.has(url))
          .slice(0, CANDIDATES_PER_SOURCE);

        const staged: StagedArticle[] = [];
        let skipped = 0;

        for (const url of candidates) {
          const articleHtml = await fetchHtml(url, source.charset);
          if (!articleHtml) {
            skipped++;
            continue;
          }

          const publishedAt = source.extractPublishedAt(articleHtml);
          if (publishedAt && !isSameKstDay(publishedAt, now)) {
            skipped++;
            continue;
          }

          const og = extractOgMeta(articleHtml);
          // These outlets also carry wire/regional stories that have nothing
          // to do with Damyang specifically (e.g. broader metro-government
          // reorg news) — require the keyword in title or summary so only
          // actually-local coverage makes it onto 담양소식.
          if (!og.title || !`${og.title} ${og.description ?? ""}`.includes("담양")) {
            skipped++;
            continue;
          }

          if (staged.some((s) => isSimilarTitle(s.title, og.title!))) {
            skipped++;
            continue;
          }

          const summary = (og.description ?? "").slice(0, SUMMARY_MAX_LENGTH);
          staged.push({
            title: og.title.slice(0, 200),
            summary,
            content: summary
              ? `${summary}\n\n원문 기사: ${source.name}\n${url}`
              : `원문 기사: ${source.name}\n${url}`,
            thumbnailUrl: og.image,
            sourceName: source.name,
            sourceUrl: url,
          });
        }

        let inserted = 0;
        if (staged.length) {
          const { data, error } = await supabase
            .from("news")
            .upsert(
              staged.map((item) => ({
                category: "LOCAL" as const,
                title: item.title,
                summary: item.summary || null,
                content: item.content,
                thumbnail_url: item.thumbnailUrl,
                source_type: "EXTERNAL" as const,
                source_name: item.sourceName,
                source_url: item.sourceUrl,
                status: "PUBLISHED" as const,
              })),
              { onConflict: "source_url", ignoreDuplicates: true }
            )
            .select("id");
          if (error) {
            return {
              source: source.name,
              found: candidates.length,
              inserted: 0,
              skipped: candidates.length,
              error: "저장 중 오류가 발생했습니다.",
            };
          }
          inserted = data?.length ?? 0;
        }

        return {
          source: source.name,
          found: candidates.length,
          inserted,
          skipped: skipped + (staged.length - inserted),
        };
      } catch {
        return {
          source: source.name,
          found: 0,
          inserted: 0,
          skipped: 0,
          error: "수집 중 오류가 발생했습니다.",
        };
      }
    })
  );

  return results;
}
