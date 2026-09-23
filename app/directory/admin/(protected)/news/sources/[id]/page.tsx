import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewsSourceForm } from "@/components/admin/NewsSourceForm";
import { DeleteNewsSourceButton } from "@/components/admin/DeleteNewsSourceButton";
import { updateNewsSource } from "@/app/directory/admin/(protected)/news/sources/actions";
import type { NewsSourceRow } from "@/types/news";

export const preferredRegion = "icn1";
export const maxDuration = 60;

export default async function EditNewsSourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: source } = await supabase
    .from("news_sources")
    .select("*")
    .eq("id", id)
    .maybeSingle<NewsSourceRow>();

  if (!source) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">수집처 수정</h1>
        <DeleteNewsSourceButton sourceId={source.id} />
      </div>
      <NewsSourceForm
        source={source}
        action={updateNewsSource.bind(null, source.id)}
        submitLabel="저장"
      />
    </div>
  );
}
