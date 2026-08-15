import { notFound, redirect } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { SiteInfoForm } from "@/components/admin/SiteInfoForm";
import type { SiteSettings } from "@/types/site";

export default async function AdminSiteInfoPage() {
  const slug = await getCurrentSiteSlug();
  if (!slug) redirect("/");
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("site_id", site.id)
    .maybeSingle<SiteSettings>();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">사이트 정보</h1>
      <SiteInfoForm site={site} settings={settings ?? null} />
    </div>
  );
}
