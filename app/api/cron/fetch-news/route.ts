import { NextResponse } from "next/server";
import { runNewsFetch } from "@/lib/news-scraper/run";

export const maxDuration = 60;
// Same reasoning as app/api/image-proxy/route.ts: the scraped sites are
// small Korean hosts that reject requests from Vercel's default US region,
// which is the likely cause of the intermittent "목록 페이지를 가져오지
// 못했습니다" per-source failures — run this out of Seoul instead.
export const preferredRegion = "icn1";

/**
 * Vercel Cron hits this daily (see vercel.json) with an Authorization:
 * Bearer <CRON_SECRET> header it adds automatically once CRON_SECRET is set
 * in the project's env vars. Without a matching secret this just 401s —
 * scraping is expensive enough (dozens of outbound fetches) that it
 * shouldn't be triggerable by a random request.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await runNewsFetch();
  return NextResponse.json({ results });
}
