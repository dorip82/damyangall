"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export async function toggleCommunityPostVisibility(
  postId: string,
  nextStatus: "PUBLISHED" | "HIDDEN"
) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("community_posts").update({ status: nextStatus }).eq("id", postId);

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  revalidatePath("/directory/admin/community");
  revalidatePath(`/directory/admin/community/${postId}`);
}

export async function deleteCommunityPost(postId: string) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("community_posts").delete().eq("id", postId);

  revalidatePath("/community");
  revalidatePath("/directory/admin/community");
  redirect("/directory/admin/community");
}
