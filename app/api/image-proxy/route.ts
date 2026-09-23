import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const FETCH_TIMEOUT_MS = 8_000;
const HOST_CACHE_TTL_MS = 5 * 60_000;

let cachedHosts: { hosts: string[]; expiresAt: number } | null = null;

/**
 * Hostnames of every row in news_sources — including disabled ones, so
 * thumbnails of articles already collected from a source keep loading after
 * it's switched off. Cached per function instance so a page full of
 * thumbnails doesn't turn into one DB query per image.
 */
async function getAllowedHosts(): Promise<string[]> {
  if (cachedHosts && cachedHosts.expiresAt > Date.now()) return cachedHosts.hosts;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return [];

  const { data, error } = await createAdminClient().from("news_sources").select("list_url");
  if (error) return cachedHosts?.hosts ?? [];
  const hosts = (data ?? []).flatMap((row) => {
    try {
      return [new URL(row.list_url).hostname.replace(/^www\./, "")];
    } catch {
      return [];
    }
  });
  cachedHosts = { hosts, expiresAt: Date.now() + HOST_CACHE_TTL_MS };
  return hosts;
}

/** Exact source host, or a subdomain of it (og:image is often on img./cdn.). */
function isAllowedHost(hostname: string, allowed: string[]): boolean {
  return allowed.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

// These origins are small, older Korean hosts (one is literally running
// Apache 2.4.53 / PHP 5.2.17) that reject requests from Vercel's default US
// region outright — confirmed: identical request works from a home network,
// 502s from the deployed function. Running the function itself out of icn1
// (Seoul) is the fix, not a timeout/retry — the connection is being
// rejected, not just slow.
export const preferredRegion = "icn1";

/**
 * The scraped local news sites only serve plain HTTP (some don't even
 * respond on 443), so an <img src="http://..."> on our HTTPS pages gets
 * blocked as mixed content and shows up broken. This fetches the image
 * server-side (no browser same-origin/mixed-content rules apply to a
 * server-to-server fetch) and re-serves it from our own HTTPS origin.
 *
 * Restricted to the hostnames we scrape from (news_sources) — an open image proxy
 * would let anyone use this route to fetch arbitrary URLs through our
 * server (SSRF risk), so unknown hosts are rejected outright.
 */
export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!isAllowedHost(parsed.hostname, await getAllowedHosts())) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const upstream = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AlldamImageProxy/1.0)" },
    });
    clearTimeout(timeout);

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!upstream.ok || !contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Not an image" }, { status: 502 });
    }

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}
