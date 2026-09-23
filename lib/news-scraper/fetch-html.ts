const FETCH_TIMEOUT_MS = 10_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; AlldamNewsBot/1.0; +https://damyangall.kr)";

const EUC_KR_HINT = /charset\s*=\s*["']?\s*(euc-kr|ks_c_5601-1987|cp949)|encoding\s*=\s*["'](euc-kr|cp949)/i;

/**
 * Fetches a page and decodes it as UTF-8 or EUC-KR (several local news
 * sites still use EUC-KR). An explicit "euc-kr" setting always wins;
 * otherwise the Content-Type header / <meta charset> / XML prolog is sniffed
 * so an admin adding a new source doesn't have to know its encoding.
 */
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
    if (charset === "euc-kr") return new TextDecoder("euc-kr").decode(buffer);

    const headerType = res.headers.get("content-type") ?? "";
    const head = new TextDecoder("latin1").decode(buffer.slice(0, 2048));
    const isEucKr = EUC_KR_HINT.test(headerType) || EUC_KR_HINT.test(head);
    return new TextDecoder(isEucKr ? "euc-kr" : "utf-8").decode(buffer);
  } catch {
    return null;
  }
}
