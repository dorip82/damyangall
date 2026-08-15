"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSiteRole } from "@/lib/auth/require-site-role";
import { blockSchemaByType } from "@/lib/blocks/validate";
import type { AnyBlock } from "@/lib/blocks/types";

export interface UpdatePageContentResult {
  ok: boolean;
  error?: string;
}

export async function updatePageContent(
  pageId: string,
  siteId: string,
  blocks: AnyBlock[]
): Promise<UpdatePageContentResult> {
  // Content writes require EDITOR or higher (spec §7.2/§8); re-verified here
  // independently of the admin layout's redirect-based gate.
  await requireSiteRole(siteId, ["SITE_ADMIN", "EDITOR"]);

  for (const block of blocks) {
    const schema = blockSchemaByType[block.type];
    const result = schema.safeParse(block.props);
    if (!result.success) {
      return { ok: false, error: `"${block.type}" 블록 값이 올바르지 않습니다.` };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_pages")
    .update({ content: { version: 1, blocks } })
    .eq("id", pageId)
    .eq("site_id", siteId);

  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/", "layout");
  revalidatePath(`/admin/pages/${pageId}`);
  return { ok: true };
}
