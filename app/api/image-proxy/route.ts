import { NextResponse } from "next/server";
import { NEWS_SOURCES } from "@/lib/news-scraper/sources";

const FETCH_TIMEOUT_MS = 8_000;
const ALLOWED_HOSTNAMES = new Set(
  NEWS_SOURCES.map((s) => new URL(s.origin).hostname)
);

/**
 * The scraped local news sites only serve plain HTTP (some don't even
 * respond on 443), so an <img src="http://..."> on our HTTPS pages gets
 * blocked as mixed content and shows up broken. This fetches the image
 * server-side (no browser same-origin/mixed-content rules apply to a
 * server-to-server fetch) and re-serves it from our own HTTPS origin.
 *
 * Restricted to the exact hostnames we scrape from — an open image proxy
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

  if (!ALLOWED_HOSTNAMES.has(parsed.hostname)) {
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
