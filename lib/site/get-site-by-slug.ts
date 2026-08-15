import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Site } from "@/types/site";

/**
 * Looks up a site by its subdomain slug through the RLS-scoped client, so an
 * anonymous visitor only ever gets the row back if it's ACTIVE (see the
 * sites_select_public policy) — there is no separate "is it published"
 * check needed here, the database enforces it.
 */
export const getSiteBySlug = cache(async (slug: string): Promise<Site | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getSiteBySlug failed", error);
    return null;
  }
  return data;
});
