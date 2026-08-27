import type { MetadataRoute } from "next";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const SITE_URL = "https://www.damyangall.kr";

// A plain anon-key client with no cookies() call, so this route stays
// eligible for Next's default sitemap caching instead of being forced
// fully dynamic on every crawl (see lib/supabase/server.ts for why the
// cookie-bound client used everywhere else can't be reused here).
function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();

  const [{ data: listings }, { data: news }, { data: events }, { data: posts }] =
    await Promise.all([
      supabase.from("directory_listings").select("id, updated_at").eq("status", "PUBLISHED"),
      supabase.from("news").select("id, updated_at").eq("status", "PUBLISHED"),
      supabase.from("events").select("id, updated_at").eq("status", "PUBLISHED"),
      supabase.from("community_posts").select("id, updated_at").eq("status", "PUBLISHED"),
    ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/directory`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/news`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/events`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/community`, changeFrequency: "daily", priority: 0.6 },
  ];

  const listingEntries: MetadataRoute.Sitemap = (listings ?? []).map((l) => ({
    url: `${SITE_URL}/directory/${l.id}`,
    lastModified: l.updated_at,
    changeFrequency: "monthly",
    priority: 0.5,
  }));
  const newsEntries: MetadataRoute.Sitemap = (news ?? []).map((n) => ({
    url: `${SITE_URL}/news/${n.id}`,
    lastModified: n.updated_at,
    changeFrequency: "weekly",
    priority: 0.5,
  }));
  const eventEntries: MetadataRoute.Sitemap = (events ?? []).map((e) => ({
    url: `${SITE_URL}/events/${e.id}`,
    lastModified: e.updated_at,
    changeFrequency: "weekly",
    priority: 0.5,
  }));
  const communityEntries: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${SITE_URL}/community/${p.id}`,
    lastModified: p.updated_at,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [
    ...staticEntries,
    ...listingEntries,
    ...newsEntries,
    ...eventEntries,
    ...communityEntries,
  ];
}
