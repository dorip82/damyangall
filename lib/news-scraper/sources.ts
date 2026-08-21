export interface NewsSource {
  name: string;
  listUrl: string;
  origin: string;
  charset: "utf-8" | "euc-kr";
  /** Candidate article URLs found on the listing page, newest first. */
  extractLinks: (html: string) => string[];
  /**
   * Published date/time, if the site exposes one reliably. Returns null
   * when it can't be determined (e.g. 담양신문's og:regDate is just the
   * page-render time, not the article's actual publish time) — those
   * sources fall back to "newest N on the homepage" instead of a strict
   * same-day filter, relying on the source_url unique constraint and
   * title-similarity check to avoid re-posting on the next run.
   */
  extractPublishedAt: (html: string) => Date | null;
}

function absolutize(origin: string, path: string): string {
  return path.startsWith("http") ? path : `${origin}${path}`;
}

/**
 * All four sites embed an auto-incrementing numeric article ID in the URL.
 * The homepage HTML order is NOT reliably newest-first though — these
 * templates mix in "related/popular" widgets ahead of the actual latest-news
 * river, so a link appearing early in the document can be months old. Sort
 * by the numeric ID itself (descending) instead of trusting document order.
 */
function extractLinksSortedByNumericId(
  html: string,
  linkPattern: RegExp,
  origin: string
): string[] {
  const byId = new Map<number, string>();
  for (const match of html.matchAll(linkPattern)) {
    const path = match[1];
    const idMatch = path.match(/(\d+)/);
    if (!idMatch) continue;
    const id = Number(idMatch[1]);
    if (!byId.has(id)) byId.set(id, absolutize(origin, path));
  }
  return [...byId.entries()].sort((a, b) => b[0] - a[0]).map(([, url]) => url);
}

/** "2026.08.20 17:00" (always KST on these sites) -> Date. */
function parseKstDateTime(text: string): Date | null {
  const match = text.match(/(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, y, m, d, hh, mm] = match;
  const date = new Date(`${y}-${m}-${d}T${hh}:${mm}:00+09:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function extractPublishedTimeMeta(html: string): Date | null {
  const match = html.match(/article:published_time["'][^>]*content=["']([^"']+)["']/i);
  if (!match) return null;
  const date = new Date(match[1]);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const NEWS_SOURCES: NewsSource[] = [
  {
    name: "뉴스디",
    listUrl: "http://www.newsdy.co.kr/",
    origin: "http://www.newsdy.co.kr",
    charset: "utf-8",
    extractLinks(html) {
      return extractLinksSortedByNumericId(
        html,
        /href="(\/news\/articleView\.html\?idxno=\d+)"/g,
        "http://www.newsdy.co.kr"
      );
    },
    extractPublishedAt: extractPublishedTimeMeta,
  },
  {
    name: "담양신문",
    listUrl: "http://xn--jk1bu0n8rgz0c.kr/",
    origin: "http://xn--jk1bu0n8rgz0c.kr",
    charset: "euc-kr",
    extractLinks(html) {
      return extractLinksSortedByNumericId(
        html,
        /href=['"](\/\d{6,})['"]\s+class=['"]maintitle['"]/g,
        "http://xn--jk1bu0n8rgz0c.kr"
      );
    },
    // No reliable per-article timestamp on this site (see NewsSource.extractPublishedAt doc).
    extractPublishedAt() {
      return null;
    },
  },
  {
    name: "담양자치신문",
    listUrl: "http://www.dyjachinews.co.kr/",
    origin: "http://www.dyjachinews.co.kr",
    charset: "utf-8",
    extractLinks(html) {
      return extractLinksSortedByNumericId(
        html,
        /href="(\/news\/articleView\.html\?idxno=\d+)"/g,
        "http://www.dyjachinews.co.kr"
      );
    },
    extractPublishedAt: extractPublishedTimeMeta,
  },
  {
    name: "담양매일",
    listUrl: "http://dymaeil.kr/",
    origin: "http://dymaeil.kr",
    charset: "utf-8",
    extractLinks(html) {
      return extractLinksSortedByNumericId(
        html,
        /href="(?:http:\/\/dymaeil\.kr)?(\/damyang\/\d+)/g,
        "http://dymaeil.kr"
      );
    },
    extractPublishedAt(html) {
      const match = html.match(/bo_v_time"[^>]*>[\s\S]{0,60}?(\d{4}\.\d{2}\.\d{2}\s+\d{2}:\d{2})/);
      return match ? parseKstDateTime(match[1]) : null;
    },
  },
];

/** Calendar-day comparison in KST, since "today" for this feature means 오늘(KST), not UTC. */
export function isSameKstDay(a: Date, b: Date): boolean {
  const kstA = new Date(a.getTime() + 9 * 60 * 60_000);
  const kstB = new Date(b.getTime() + 9 * 60 * 60_000);
  return (
    kstA.getUTCFullYear() === kstB.getUTCFullYear() &&
    kstA.getUTCMonth() === kstB.getUTCMonth() &&
    kstA.getUTCDate() === kstB.getUTCDate()
  );
}
