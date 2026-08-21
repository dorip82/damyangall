import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewsForm } from "@/components/admin/NewsForm";
import { DeleteNewsButton } from "@/components/admin/DeleteNewsButton";
import { updateNews } from "@/app/directory/admin/(protected)/news/actions";
import type { NewsRow } from "@/types/news";

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: news } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .maybeSingle<NewsRow>();

  if (!news) notFound();

  const boundUpdate = updateNews.bind(null, news.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">소식 수정</h1>
        <DeleteNewsButton newsId={news.id} />
      </div>
      <NewsForm news={news} action={boundUpdate} submitLabel="저장" />
    </div>
  );
}
