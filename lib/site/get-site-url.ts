import { headers } from "next/headers";
import { normalizeRootDomain } from "@/lib/utils/domain";

/**
 * Builds the external URL for a site's subdomain (e.g. sorihyanggi.damyangall.kr).
 *
 * In production this deliberately does NOT trust the current request's Host
 * header — it always builds off the configured NEXT_PUBLIC_ROOT_DOMAIN.
 * Trusting the ambient Host header here previously produced corrupted links
 * like "sorihyanggi.sorihyanggi.damyangall.kr" in production, most likely
 * from Vercel's edge caching serving root-page HTML that had been rendered
 * under a different Host. The root domain is a fixed, known value, so there
 * is no reason for it to vary per request in the first place.
 *
 * Local dev is the one case that legitimately varies (arbitrary port), so it
 * still reads the real request host there.
 */
export async function getSiteUrl(slug: string): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "";
  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");

  if (isLocal) {
    return `http://${slug}.${host}`;
  }

  const rootDomain = normalizeRootDomain(
    process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "damyangall.kr"
  );
  return `https://${slug}.${rootDomain}`;
}
