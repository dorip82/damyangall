import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.damyangall.kr";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = await createClient();
  const { data: newsList } = await supabase
    .from("news")
    .select("id, title, summary, created_at")
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })
    .limit(50);

  const items = (newsList ?? [])
    .map((news) => {
      const link = `${SITE_URL}/news/${news.id}`;
      const pubDate = new Date(news.created_at).toUTCString();
      return `    <item>
      <title>${escapeXml(news.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
${news.summary ? `      <description>${escapeXml(news.summary)}</description>\n` : ""}    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>담양 올담 - 담양소식</title>
    <link>${SITE_URL}/news</link>
    <description>담양의 지역소식, 생활정보, 군민제보를 전하는 담양 올담 담양소식입니다.</description>
    <language>ko</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
