import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchHtml } from "@/lib/news-scraper/fetch-html";
import { extractOgMeta } from "@/lib/news-scraper/extract-og";
import { isSimilarTitle } from "@/lib/news-scraper/similarity";
import { NEWS_SOURCES, isSameKstDay, type NewsSource } from "@/lib/news-scraper/sources";

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

async function collectFromSource(
  source: NewsSource,
  knownUrls: Set<string>,
  now: Date
): Promise<{ source: NewsSource; staged: StagedArticle[]; found: number; error?: string }> {
  try {
    const listHtml = await fetchHtml(source.listUrl, source.charset);
    if (!listHtml) {
      return { source, staged: [], found: 0, error: "목록 페이지를 가져오지 못했습니다." };
    }

    const candidates = source
      .extractLinks(listHtml)
      .filter((url) => !knownUrls.has(url))
      .slice(0, CANDIDATES_PER_SOURCE);

    const staged: StagedArticle[] = [];
    for (const url of candidates) {
      const articleHtml = await fetchHtml(url, source.charset);
      if (!articleHtml) continue;

      const publishedAt = source.extractPublishedAt(articleHtml);
      if (publishedAt && !isSameKstDay(publishedAt, now)) continue;

      const og = extractOgMeta(articleHtml);
      // These outlets also carry wire/regional stories that have nothing to
      // do with Damyang specifically — require the keyword in title or
      // summary so only actually-local coverage makes it onto 담양소식.
      if (!og.title || !`${og.title} ${og.description ?? ""}`.includes("담양")) continue;

      // Some outlets prefix their own description with "[담양신문] " —
      // redundant since source_name is already shown separately.
      const cleanedDescription = (og.description ?? "").replace(/^\[[^\]]*\]\s*/, "");
      const summary = cleanedDescription.slice(0, SUMMARY_MAX_LENGTH);
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

    return { source, staged, found: candidates.length };
  } catch {
    return { source, staged: [], found: 0, error: "수집 중 오류가 발생했습니다." };
  }
}

/**
 * Pulls today's Damyang articles from the configured local news sites and
 * inserts them as EXTERNAL news rows. Safe to run repeatedly (daily cron,
 * or an admin's manual "지금 수집하기" click) — already-seen URLs are
 * skipped up front via the source_url unique constraint, and near-duplicate
 * headlines (the same story covered by multiple outlets) are collapsed
 * across ALL sources, not just within one — the four sites are fetched in
 * parallel for speed, but similarity-dedup runs afterward over the merged
 * candidate pool so the same story from two different outlets doesn't both
 * land in 담양소식.
 */
export async function runNewsFetch(): Promise<NewsFetchResult[]> {
  const supabase = createAdminClient();
  const now = new Date();

  const { data: existingRows } = await supabase
    .from("news")
    .select("source_url")
    .not("source_url", "is", null);
  const knownUrls = new Set((existingRows ?? []).map((r) => r.source_url));

  const collected = await Promise.all(
    NEWS_SOURCES.map((source) => collectFromSource(source, knownUrls, now))
  );

  const deduped: StagedArticle[] = [];
  const dedupSkippedCount = new Map<string, number>();
  for (const { source, staged } of collected) {
    let skipped = 0;
    for (const item of staged) {
      if (deduped.some((existing) => isSimilarTitle(existing.title, item.title))) {
        skipped++;
        continue;
      }
      deduped.push(item);
    }
    dedupSkippedCount.set(source.name, skipped);
  }

  let insertedUrls = new Set<string>();
  if (deduped.length) {
    const { data } = await supabase
      .from("news")
      .upsert(
        deduped.map((item) => ({
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
      .select("source_url");
    insertedUrls = new Set((data ?? []).map((r) => r.source_url as string));
  }

  return collected.map(({ source, staged, found, error }) => {
    const inserted = staged.filter((s) => insertedUrls.has(s.sourceUrl)).length;
    return {
      source: source.name,
      found,
      inserted,
      skipped: found - inserted,
      error,
    };
  });
}
