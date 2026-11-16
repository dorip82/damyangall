import { requireAssocAdmin } from "@/lib/assoc/admin";
import { createClient } from "@/lib/supabase/server";
import { MembersManager } from "@/components/admin/assoc/MembersManager";

export default async function AdminMembersPage() {
  const { site, userId } = await requireAssocAdmin(["SITE_ADMIN"]);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_site_members", { target_site_id: site.id });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">관리자 계정</h1>
        <p className="mt-1 text-sm text-muted-foreground">이 홈페이지를 관리할 수 있는 사람과 권한입니다.</p>
      </div>
      {error ? (
        <p className="text-sm text-destructive">계정 목록을 불러오지 못했습니다.</p>
      ) : (
        <MembersManager siteId={site.id} members={data ?? []} me={userId} />
      )}
    </div>
  );
}
