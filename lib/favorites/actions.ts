"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FavoriteTargetType } from "@/types/database";

export interface ToggleFavoriteResult {
  ok: boolean;
  favorited?: boolean;
  requiresLogin?: boolean;
}

export async function toggleFavorite(
  targetType: FavoriteTargetType,
  targetId: string,
  shouldFavorite: boolean
): Promise<ToggleFavoriteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, requiresLogin: true };

  if (shouldFavorite) {
    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: user.id, target_type: targetType, target_id: targetId });
    // Already-favorited (unique constraint) is not a real failure.
    if (error && error.code !== "23505") return { ok: false };
  } else {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("target_type", targetType)
      .eq("target_id", targetId);
    if (error) return { ok: false };
  }

  revalidatePath("/directory");
  revalidatePath("/");
  return { ok: true, favorited: shouldFavorite };
}
