import { notFound } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import type { SitePage } from "@/types/site";

export default async function SiteHomePage() {
  const slug = await getCurrentSiteSlug();
  if (!slug) notFound();

  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("site_pages")
    .select("*")
    .eq("site_id", site.id)
    .eq("is_home", true)
    .maybeSingle<SitePage>();

  if (!page) notFound();

  return <BlockRenderer blocks={page.content.blocks} siteId={site.id} />;
}
