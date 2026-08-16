import { createClient } from "@/lib/supabase/server";
import type { FavoriteTargetType } from "@/types/database";

/** IDs the current signed-in user has favorited, for a given target type. Empty set if logged out. */
export async function getFavoritedIds(
  targetType: FavoriteTargetType
): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from("favorites")
    .select("target_id")
    .eq("user_id", user.id)
    .eq("target_type", targetType);

  return new Set((data ?? []).map((f) => f.target_id));
}
