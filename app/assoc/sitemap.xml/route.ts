import { getAssocContext, loadPosts, loadTournaments } from "@/lib/assoc/data";
import { getSiteUrl } from "@/lib/site/get-site-url";

/** dba.damyangall.kr/sitemap.xml — 협회 사이트의 공개 페이지 목록 */
export async function GET() {
  const { site, config } = await getAssocContext();
  const base = await getSiteUrl(site.slug);
  const [posts, tournaments] = await Promise.all([loadPosts(site.id, { limit: 500 }), loadTournaments(site.id)]);

  const staticPaths = new Set<string>(["/"]);
  for (const item of config.nav) {
    staticPaths.add(item.href);
    for (const c of item.children) if (!c.href.includes("#") && !c.href.includes("?")) staticPaths.add(c.href);
  }
  ["/privacy", "/terms", "/sitemap"].forEach((p) => staticPaths.add(p));

  const urls = [
    ...[...staticPaths].map((p) => ({ loc: `${base}${p === "/" ? "" : p}`, lastmod: undefined as string | undefined })),
    ...tournaments.map((t) => ({ loc: `${base}/tournament/${t.id}`, lastmod: t.updated_at })),
    ...posts.map((p) => ({ loc: `${base}/news/${p.id}`, lastmod: p.published_at ?? undefined })),
  ];
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}</url>`).join("\n")}
</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
