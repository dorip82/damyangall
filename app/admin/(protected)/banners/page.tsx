import { requireAssocAdmin } from "@/lib/assoc/admin";
import { createClient } from "@/lib/supabase/server";
import { BannerSettingsForm } from "@/components/admin/assoc/BannerSettingsForm";
import type { AssocExtraSettings } from "@/lib/assoc/data";

export default async function AdminBannersPage() {
  const { site } = await requireAssocAdmin(["SITE_ADMIN"]);
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("settings").eq("site_id", site.id).maybeSingle();
  const s = (data?.settings ?? {}) as AssocExtraSettings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">팝업 · 홍보배너</h1>
        <p className="mt-1 text-sm text-muted-foreground">홈페이지 공지 팝업과 메인 화면 홍보 배너를 관리합니다.</p>
      </div>
      <BannerSettingsForm
        siteId={site.id}
        initial={{
          popup: {
            enabled: !!s.popup?.enabled,
            title: s.popup?.title ?? "",
            content: s.popup?.content ?? "",
            image: s.popup?.image ?? "",
            link: s.popup?.link ?? "",
            startDate: s.popup?.startDate ?? "",
            endDate: s.popup?.endDate ?? "",
          },
          promos: (s.promos ?? []).map((p) => ({ title: p.title, description: p.description ?? "", href: p.href, image: p.image ?? "" })),
          youtubeUrl: s.youtubeUrl ?? "",
          blogUrl: s.blogUrl ?? "",
        }}
      />
    </div>
  );
}
