import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import type { SiteSettings, SiteMenu } from "@/types/site";

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getCurrentSiteSlug();
  if (!slug) return {};
  const site = await getSiteBySlug(slug);
  if (!site) return {};

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("seo_title, seo_description, og_image")
    .eq("site_id", site.id)
    .maybeSingle();

  return {
    title: {
      default: settings?.seo_title ?? `${site.name} | 올담`,
      template: `%s | ${site.name}`,
    },
    description: settings?.seo_description ?? site.description ?? undefined,
    openGraph: settings?.og_image ? { images: [settings.og_image] } : undefined,
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const slug = await getCurrentSiteSlug();
  if (!slug) notFound();

  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const [{ data: settings }, { data: menus }] = await Promise.all([
    supabase
      .from("site_settings")
      .select("*")
      .eq("site_id", site.id)
      .maybeSingle<SiteSettings>(),
    supabase
      .from("site_menus")
      .select("*")
      .eq("site_id", site.id)
      .order("sort_order")
      .returns<SiteMenu[]>(),
  ]);

  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader site={site} menus={menus ?? []} />
      <main className="flex-1">{children}</main>
      <SiteFooter site={site} settings={settings ?? null} />
    </div>
  );
}
