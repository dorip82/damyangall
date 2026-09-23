import type { NewsSourceRow } from "@/types/news";

/**
 * The subset of a news_sources row the scraper actually needs — also what
 * the admin "미리보기" passes in for a not-yet-saved source.
 */
export type NewsSourceConfig = Pick<
  NewsSourceRow,
  "name" | "kind" | "list_url" | "charset" | "link_pattern" | "date_pattern" | "keyword"
>;

export interface Candidate {
  url: string;
  /** Known up front for RSS items; HTML sources resolve it from the article page. */
  publishedAt: Date | null;
  title?: string;
  description?: string;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function resolveUrl(href: string, base: string): string | null {
  try {
    const url = new URL(decodeHtmlEntities(href.trim()), base);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * These CMSes embed an auto-incrementing numeric article ID in the URL. The
 * homepage HTML order is NOT reliably newest-first though — the templates
 * mix in "related/popular" widgets ahead of the actual latest-news river, so
 * a link appearing early in the document can be months old. Sort by that
 * numeric ID (the last 3+ digit run in the URL) descending instead.
 */
function sortByNumericIdDesc(urls: string[]): string[] {
  const byId = new Map<number, string>();
  for (const url of urls) {
    const runs = url.match(/\d{3,}/g);
    if (!runs) continue;
    const id = Number(runs[runs.length - 1]);
    if (!byId.has(id)) byId.set(id, url);
  }
  return [...byId.entries()].sort((a, b) => b[0] - a[0]).map(([, url]) => url);
}

/**
 * Link shapes the common Korean local-news CMSes use for article pages:
 * ndsoft (articleView.html?idxno=), gnuboard (wr_id=), and "/section/12345"
 * style permalinks. Used when a source doesn't set its own link_pattern.
 */
const ARTICLE_QUERY_PARAM = /[?&](idxno|wr_id|no|idx|seq|aid|nid|num|article_?id|news_?id)=\d+/i;
const ARTICLE_PATH_ID = /\/\d{4,}(\.html?)?\/?$/;

function autoDetectArticleLinks(html: string, listUrl: string): string[] {
  const listHost = new URL(listUrl).hostname.replace(/^www\./, "");
  const urls: string[] = [];
  for (const match of html.matchAll(/href\s*=\s*["']([^"'#]+)["']/gi)) {
    const url = resolveUrl(match[1], listUrl);
    if (!url) continue;
    const parsed = new URL(url);
    if (parsed.hostname.replace(/^www\./, "") !== listHost) continue;
    if (ARTICLE_QUERY_PARAM.test(parsed.search) || ARTICLE_PATH_ID.test(parsed.pathname)) {
      urls.push(url);
    }
  }
  return urls;
}

function extractHtmlCandidates(source: NewsSourceConfig, html: string): Candidate[] {
  let urls: string[];
  if (source.link_pattern) {
    const pattern = new RegExp(source.link_pattern, "gi");
    urls = [];
    for (const match of html.matchAll(pattern)) {
      const url = resolveUrl(match[1] ?? match[0], source.list_url);
      if (url) urls.push(url);
    }
  } else {
    urls = autoDetectArticleLinks(html, source.list_url);
  }
  return sortByNumericIdDesc(urls).map((url) => ({ url, publishedAt: null }));
}

function readTag(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  if (!match) return null;
  return decodeHtmlEntities(match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1"))
    .replace(/<[^>]+>/g, "")
    .trim();
}

/** RSS 2.0 <item> and Atom <entry>, newest first by publish time when present. */
function extractFeedCandidates(source: NewsSourceConfig, xml: string): Candidate[] {
  const candidates: Candidate[] = [];
  for (const [block] of xml.matchAll(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi)) {
    const atomHref = block.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1];
    const link = readTag(block, "link") || atomHref;
    const url = link ? resolveUrl(link, source.list_url) : null;
    if (!url) continue;
    const dateText =
      readTag(block, "pubDate") ?? readTag(block, "dc:date") ?? readTag(block, "published") ?? readTag(block, "updated");
    candidates.push({
      url,
      publishedAt: dateText ? parseDateText(dateText) : null,
      title: readTag(block, "title") ?? undefined,
      description: readTag(block, "description") ?? readTag(block, "summary") ?? undefined,
    });
  }
  return candidates.sort(
    (a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)
  );
}

/** Candidate article URLs from a source's list page / feed, newest first. */
export function extractCandidates(source: NewsSourceConfig, body: string): Candidate[] {
  return source.kind === "RSS"
    ? extractFeedCandidates(source, body)
    : extractHtmlCandidates(source, body);
}

/**
 * "2026.08.20 17:00", "2026-08-20", "2026/8/20 오후..." (always KST on these
 * sites) or anything Date can parse itself (RFC 822 pubDate, ISO 8601).
 */
export function parseDateText(text: string): Date | null {
  const direct = new Date(text);
  // Only trust Date's own parser when the string carries a timezone —
  // otherwise it'd read a bare KST datetime as UTC (or local server time).
  if (!Number.isNaN(direct.getTime()) && /(Z|[+-]\d{2}:?\d{2}|GMT|UTC)\s*$/i.test(text.trim())) {
    return direct;
  }
  const match = text.match(/(\d{4})[.\-/]\s?(\d{1,2})[.\-/]\s?(\d{1,2})(?:\D{1,3}(\d{1,2}):(\d{2}))?/);
  if (!match) return null;
  const [, y, m, d, hh = "00", mm = "00"] = match;
  const pad = (v: string) => v.padStart(2, "0");
  const date = new Date(`${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${mm}:00+09:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Published date/time from an article page. Returns null when it can't be
 * determined (e.g. 담양신문's og:regDate is just the page-render time, not
 * the article's publish time, so it isn't used) — those articles fall back
 * to "newest N on the list page" instead of a date filter, relying on the
 * source_url unique constraint and title-similarity check to avoid
 * re-posting on the next run.
 */
export function extractPublishedAt(source: NewsSourceConfig, html: string): Date | null {
  if (source.date_pattern) {
    const match = html.match(new RegExp(source.date_pattern, "i"));
    return match ? parseDateText(match[1] ?? match[0]) : null;
  }
  const meta = html.match(/article:published_time["'][^>]*content=["']([^"']+)["']/i);
  if (meta) return parseDateText(meta[1]);
  const jsonLd = html.match(/"datePublished"\s*:\s*"([^"]+)"/);
  return jsonLd ? parseDateText(jsonLd[1]) : null;
}

function startOfKstDay(date: Date): number {
  const kst = new Date(date.getTime() + 9 * 60 * 60_000);
  return Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()) - 9 * 60 * 60_000;
}

/**
 * "오늘 또는 어제(KST)" 기사인지. It used to be strictly same-KST-day, but
 * the scheduled run only fires once a day on Vercel Hobby — a 07:00 run would
 * then only ever see articles posted between midnight and 7am. Allowing the
 * previous day too means a single daily run still catches everything, and
 * re-runs are harmless thanks to the source_url unique constraint.
 */
export function isRecent(publishedAt: Date, now: Date): boolean {
  return publishedAt.getTime() >= startOfKstDay(now) - 24 * 60 * 60_000;
}

/** Throws with a Korean message if a user-entered pattern isn't a valid JS regex. */
export function validatePattern(pattern: string, label: string): void {
  try {
    new RegExp(pattern, "gi");
  } catch {
    throw new Error(`${label} 정규식이 올바르지 않습니다.`);
  }
}
