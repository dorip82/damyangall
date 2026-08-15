/**
 * Normalizes a root-domain env value into a bare hostname. Defends against
 * the common misconfiguration of pasting a full URL (e.g.
 * "https://damyangall.kr/" instead of "damyangall.kr") into
 * NEXT_PUBLIC_ROOT_DOMAIN — that mistake previously made every subdomain
 * comparison in resolveSubdomain() fail silently (routing every club site
 * to the root portal instead) and corrupted generated cross-domain links.
 */
export function normalizeRootDomain(value: string): string {
  return value
    .trim()
    .replace(/^[a-z]+:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./i, "")
    .toLowerCase();
}

/**
 * Resolves the club/site subdomain from a request Host header.
 *
 * - `sorihyanggi.localhost:3000` (local dev, browsers resolve *.localhost to
 *   loopback without a hosts-file edit) -> "sorihyanggi"
 * - `sorihyanggi.damyangall.kr` (production) -> "sorihyanggi"
 * - apex/`www` on either localhost or the root domain -> null (root portal)
 * - anything unrecognized (vercel.app previews, bare IPs, etc.) -> null,
 *   treated as root rather than guessing
 */
export function resolveSubdomain(
  hostHeader: string,
  rootDomain: string
): string | null {
  const host = hostHeader.split(":")[0].toLowerCase();

  if (host.endsWith(".localhost")) {
    const sub = host.slice(0, -".localhost".length);
    return sub && sub !== "www" ? sub : null;
  }
  if (host === "localhost" || host === "127.0.0.1") return null;

  if (host === rootDomain || host === `www.${rootDomain}`) return null;
  if (host.endsWith(`.${rootDomain}`)) {
    const sub = host.slice(0, -(rootDomain.length + 1));
    if (!sub || sub === "www" || sub.includes(".")) return null;
    return sub;
  }

  return null;
}
