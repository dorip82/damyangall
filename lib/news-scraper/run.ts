import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchHtml } from "@/lib/news-scraper/fetch-html";
import { extractOgMeta } from "@/lib/news-scraper/extract-og";
import { isSimilarTitle } from "@/lib/news-scraper/similarity";
import {
  extractCandidates,
  extractPublishedAt,
  isRecent,
  type Candidate,
  type NewsSourceConfig,
} from "@/lib/news-scraper/sources";
import type { NewsSourceRow } from "@/types/news";

const CANDIDATES_PER_SOURCE = 10;
const ARTICLE_FETCH_CONCURRENCY = 4;
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

export type CheckedStatus = "new" | "known" | "old" | "no-keyword" | "no-title" | "fetch-failed";

export interface CheckedArticle {
  url: string;
  title: string | null;
  publishedAt: string | null;
  status: CheckedStatus;
}

export interface SourcePreview {
  linksFound: number;
  articles: CheckedArticle[];
  error?: string;
}

interface Collected {
  staged: StagedArticle[];
  checked: CheckedArticle[];
  linksFound: number;
  error?: string;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function parseKeywords(keyword: string | null): string[] {
  return (keyword ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

async function checkCandidate(
  source: NewsSourceConfig,
  candidate: Candidate,
  keywords: string[],
  now: Date
): Promise<{ checked: CheckedArticle; staged?: StagedArticle }> {
  const { url } = candidate;
  const articleHtml = await fetchHtml(url, source.charset);
  if (!articleHtml) {
    return { checked: { url, title: candidate.title ?? null, publishedAt: null, status: "fetch-failed" } };
  }

  const og = extractOgMeta(articleHtml);
  const title = og.title ?? candidate.title ?? null;
  const description = og.description ?? candidate.description ?? "";
  const publishedAt = candidate.publishedAt ?? extractPublishedAt(source, articleHtml);
  const checked: CheckedArticle = {
    url,
    title,
    publishedAt: publishedAt?.toISOString() ?? null,
    status: "new",
  };

  if (publishedAt && !isRecent(publishedAt, now)) return { checked: { ...checked, status: "old" } };
  if (!title) return { checked: { ...checked, status: "no-title" } };
  // These outlets also carry wire/regional stories that have nothing to do
  // with Damyang specifically — require a keyword in title or summary so
  // only actually-local coverage makes it onto 담양소식.
  const haystack = `${title} ${description}`;
  if (keywords.length && !keywords.some((k) => haystack.includes(k))) {
    return { checked: { ...checked, status: "no-keyword" } };
  }

  // Some outlets prefix their own description with "[담양신문] " —
  // redundant since source_name is already shown separately.
  const summary = description.replace(/^\[[^\]]*\]\s*/, "").slice(0, SUMMARY_MAX_LENGTH);
  return {
    checked,
    staged: {
      title: title.slice(0, 200),
      summary,
      content: summary
        ? `${summary}\n\n원문 기사: ${source.name}\n${url}`
        : `원문 기사: ${source.name}\n${url}`,
      thumbnailUrl: og.image,
      sourceName: source.name,
      sourceUrl: url,
    },
  };
}

/**
 * `preview` keeps already-collected links in the list (reported as "known"
 * without refetching) so the admin sees what the source's newest links look
 * like; a real run skips them up front so they don't use up the per-source
 * candidate budget.
 */
async function collectFromSource(
  source: NewsSourceConfig,
  knownUrls: Set<string>,
  now: Date,
  { preview = false } = {}
): Promise<Collected> {
  try {
    const listHtml = await fetchHtml(source.list_url, source.charset);
    if (!listHtml) {
      return { staged: [], checked: [], linksFound: 0, error: "목록 페이지를 가져오지 못했습니다." };
    }

    const all = extractCandidates(source, listHtml);
    if (!all.length) {
      return { staged: [], checked: [], linksFound: 0, error: "기사 링크를 찾지 못했습니다." };
    }
    const candidates = (preview ? all : all.filter((c) => !knownUrls.has(c.url))).slice(
      0,
      CANDIDATES_PER_SOURCE
    );

    const keywords = parseKeywords(source.keyword);
    const results = await mapWithConcurrency(candidates, ARTICLE_FETCH_CONCURRENCY, (c) =>
      knownUrls.has(c.url)
        ? Promise.resolve({
            checked: { url: c.url, title: c.title ?? null, publishedAt: null, status: "known" as const },
          })
        : checkCandidate(source, c, keywords, now)
    );

    return {
      staged: results.flatMap((r) => ("staged" in r && r.staged ? [r.staged] : [])),
      checked: results.map((r) => r.checked),
      linksFound: all.length,
    };
  } catch (error) {
    return {
      staged: [],
      checked: [],
      linksFound: 0,
      error: error instanceof Error ? error.message : "수집 중 오류가 발생했습니다.",
    };
  }
}

/** Dry run for the admin "미리보기" — fetches and filters but writes nothing. */
export async function previewNewsSource(
  source: NewsSourceConfig,
  knownUrls: Set<string>
): Promise<SourcePreview> {
  const { checked, linksFound, error } = await collectFromSource(source, knownUrls, new Date(), {
    preview: true,
  });
  return { linksFound, articles: checked, error };
}

/**
 * Pulls today's/yesterday's Damyang articles from every enabled row in
 * news_sources and inserts them as EXTERNAL news rows. Safe to run
 * repeatedly (scheduled cron, or an admin's manual "지금 수집하기" click) —
 * already-seen URLs are skipped up front via the source_url unique
 * constraint, and near-duplicate headlines (the same story covered by
 * multiple outlets) are collapsed across ALL sources, not just within one —
 * the sites are fetched in parallel for speed, but similarity-dedup runs
 * afterward over the merged candidate pool so the same story from two
 * different outlets doesn't both land in 담양소식.
 */
export async function runNewsFetch(): Promise<NewsFetchResult[]> {
  // This is the only runtime path that touches the service-role client —
  // if SUPABASE_SERVICE_ROLE_KEY is missing/malformed on a given
  // deployment, everything else in the app (which only ever uses the
  // session-scoped client) keeps working fine and this is the one thing
  // that breaks, so surface that clearly instead of letting the route
  // handler / Server Action crash with an opaque 500.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [
      {
        source: "전체",
        found: 0,
        inserted: 0,
        skipped: 0,
        error: "서버에 SUPABASE_SERVICE_ROLE_KEY가 설정되어 있지 않습니다.",
      },
    ];
  }

  try {
    const supabase = createAdminClient();
    const now = new Date();

    const { data: sources, error: sourcesError } = await supabase
      .from("news_sources")
      .select("*")
      .eq("enabled", true)
      .order("sort_order")
      .order("created_at")
      .returns<NewsSourceRow[]>();
    if (sourcesError) throw sourcesError;
    if (!sources?.length) {
      return [{ source: "전체", found: 0, inserted: 0, skipped: 0, error: "사용 중인 수집처가 없습니다." }];
    }

    const { data: existingRows, error: existingRowsError } = await supabase
      .from("news")
      .select("source_url")
      .not("source_url", "is", null);
    if (existingRowsError) throw existingRowsError;
    const knownUrls = new Set((existingRows ?? []).map((r) => r.source_url as string));

    const collected = await Promise.all(
      sources.map(async (source) => ({
        source,
        ...(await collectFromSource(source, knownUrls, now)),
      }))
    );

    const deduped: StagedArticle[] = [];
    for (const { staged } of collected) {
      for (const item of staged) {
        if (deduped.some((existing) => isSimilarTitle(existing.title, item.title))) continue;
        deduped.push(item);
      }
    }

    let insertedUrls = new Set<string>();
    if (deduped.length) {
      const { data, error: upsertError } = await supabase
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
      if (upsertError) throw upsertError;
      insertedUrls = new Set((data ?? []).map((r) => r.source_url as string));
    }

    const results = collected.map(({ source, staged, checked, error }) => {
      const inserted = staged.filter((s) => insertedUrls.has(s.sourceUrl)).length;
      return {
        id: source.id,
        source: source.name,
        found: checked.length,
        inserted,
        skipped: checked.length - inserted,
        error,
      };
    });

    // Per-source "마지막 실행" shown on the 수집처 관리 page — the only way to
    // tell from the admin UI whether the scheduled run is actually firing.
    await Promise.all(
      results.map((r) =>
        supabase
          .from("news_sources")
          .update({
            last_run_at: now.toISOString(),
            last_found: r.found,
            last_inserted: r.inserted,
            last_error: r.error ?? null,
          })
          .eq("id", r.id)
      )
    );

    return results.map((r) => ({
      source: r.source,
      found: r.found,
      inserted: r.inserted,
      skipped: r.skipped,
      error: r.error,
    }));
  } catch (error) {
    return [
      {
        source: "전체",
        found: 0,
        inserted: 0,
        skipped: 0,
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
    ];
  }
}
