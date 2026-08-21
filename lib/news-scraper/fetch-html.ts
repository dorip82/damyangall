const FETCH_TIMEOUT_MS = 10_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; AlldamNewsBot/1.0; +https://damyangall.kr)";

/** Fetches a page and decodes it as UTF-8 or EUC-KR (several local news sites still use EUC-KR). */
export async function fetchHtml(
  url: string,
  charset: "utf-8" | "euc-kr" = "utf-8"
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const buffer = await res.arrayBuffer();
    return new TextDecoder(charset).decode(buffer);
  } catch {
    return null;
  }
}
