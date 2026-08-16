import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the current auth user has the platform-wide SUPER_ADMIN role
 * (public.users.role), for root-level features like /directory/admin that
 * aren't scoped to any one club site. Called both from the admin layout and
 * again at the top of every write action, same reasoning as
 * requireSiteRole: a Server Action can be invoked directly, so the layout
 * having rendered proves nothing on its own. The self-read here is
 * RLS-protected (users_select_own lets a user read their own row), so this
 * can't be spoofed by a non-admin.
 */
export async function requireSuperAdmin(): Promise<{ userId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/directory/admin/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "SUPER_ADMIN") {
    redirect("/directory/admin/unauthorized");
  }

  return { userId: user.id };
}
