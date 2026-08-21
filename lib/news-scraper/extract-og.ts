export interface OgMeta {
  title: string | null;
  description: string | null;
  image: string | null;
}

function readMetaContent(html: string, property: string): string | null {
  // Property/content can appear in either attribute order, with single or
  // double quotes — these local news CMSes aren't consistent about it.
  const patterns = [
    new RegExp(
      `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`,
      "i"
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtmlEntities(match[1].trim());
  }
  return null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#8203;/g, "");
}

/**
 * Some sites' og:title is really "headline > 카테고리 | 사이트명" (their
 * <title> tag reused as-is), which pads the actual headline with tokens
 * that dilute the title-similarity dedup check against the same story on
 * another outlet. " > " doesn't otherwise show up in a Korean headline, so
 * trimming from the first one is safe.
 */
function stripTitleSuffix(title: string): string {
  const cutIndex = title.indexOf(" > ");
  return cutIndex === -1 ? title : title.slice(0, cutIndex).trim();
}

export function extractOgMeta(html: string): OgMeta {
  const title = readMetaContent(html, "og:title");
  return {
    title: title ? stripTitleSuffix(title) : null,
    description: readMetaContent(html, "og:description"),
    image: readMetaContent(html, "og:image"),
  };
}
