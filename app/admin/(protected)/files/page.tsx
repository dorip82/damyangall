import { requireAssocAdmin } from "@/lib/assoc/admin";
import { createClient } from "@/lib/supabase/server";
import { FilesManager } from "@/components/admin/assoc/FilesManager";

export default async function AdminFilesPage() {
  const { site, config } = await requireAssocAdmin();
  const supabase = await createClient();
  const { data: files } = await supabase.from("site_files").select("*").eq("site_id", site.id).order("created_at", { ascending: false });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">자료실</h1>
        <p className="mt-1 text-sm text-muted-foreground">규정, 신청서, 서식 파일을 올리면 홈페이지 자료실에서 내려받을 수 있습니다.</p>
      </div>
      <FilesManager siteId={site.id} categories={config.fileCategories} files={files ?? []} />
    </div>
  );
}
