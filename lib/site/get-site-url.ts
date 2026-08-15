import { headers } from "next/headers";

/**
 * Builds the external URL for a site's subdomain (e.g. sorihyanggi.damyangall.kr)
 * from wherever the current request landed — root domain in prod, or
 * `localhost:3000` in dev — so this works without hardcoding a domain.
 */
export async function getSiteUrl(slug: string): Promise<string> {
  const headerList = await headers();
  let host = headerList.get("host") ?? process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "damyangall.kr";
  if (host.startsWith("www.")) host = host.slice(4);

  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol = isLocal ? "http" : "https";

  return `${protocol}://${slug}.${host}`;
}
