/**
 * Routes plain-http image URLs (the scraped local news sites) through our
 * own HTTPS image proxy so they don't get blocked as mixed content on our
 * HTTPS pages. Already-https URLs (our own Supabase Storage uploads) pass
 * through untouched.
 */
export function proxiedImageSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http://")) {
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}
