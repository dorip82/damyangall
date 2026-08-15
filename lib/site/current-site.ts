import { headers } from "next/headers";

export const SITE_SLUG_HEADER = "x-site-slug";

/** Reads the subdomain resolved by middleware.ts for the current request. */
export async function getCurrentSiteSlug(): Promise<string | null> {
  const headerList = await headers();
  return headerList.get(SITE_SLUG_HEADER);
}
