import { notFound, redirect } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { PageBlocksEditor } from "@/components/admin/PageBlocksEditor";
import type { SitePage } from "@/types/site";

export default async function AdminPageEditorPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const slug = await getCurrentSiteSlug();
  if (!slug) redirect("/");
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("site_pages")
    .select("*")
    .eq("id", pageId)
    .eq("site_id", site.id)
    .maybeSingle<SitePage>();

  if (!page) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">{page.title}</h1>
      <PageBlocksEditor
        pageId={page.id}
        siteId={site.id}
        initialBlocks={page.content.blocks}
      />
    </div>
  );
}
