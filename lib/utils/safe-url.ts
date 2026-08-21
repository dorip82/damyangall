/**
 * Community posts are public-writable (no login required), so a link_url
 * could contain anything a visitor types — including a `javascript:` URI.
 * Only ever treat a value as a renderable href if it's plain http(s); used
 * both when validating the write and again right before rendering, since a
 * value could in principle reach the DB through some other path later.
 */
export function isSafeHttpUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}
