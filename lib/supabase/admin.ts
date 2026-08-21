import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Service-role client. Bypasses RLS entirely.
 *
 * NEVER import this from anything that can end up in a client bundle or in
 * a request-scoped server action that a normal user can trigger. It exists
 * only for trusted, operator-run contexts: supabase/seed.ts, the
 * CRON_SECRET-gated /api/cron/fetch-news route, and Server Actions that
 * already re-verify requireSuperAdmin themselves (lib/news-scraper/run.ts).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
