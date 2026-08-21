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

export function extractOgMeta(html: string): OgMeta {
  return {
    title: readMetaContent(html, "og:title"),
    description: readMetaContent(html, "og:description"),
    image: readMetaContent(html, "og:image"),
  };
}
