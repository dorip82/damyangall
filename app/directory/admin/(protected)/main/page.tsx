import { getMainPageSettings } from "@/lib/main-settings/get-main-page-settings";
import { MainPageSettingsForm } from "@/components/admin/MainPageSettingsForm";

export default async function AdminMainSettingsPage() {
  const settings = await getMainPageSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">메인 페이지 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          올담 메인 페이지의 Hero 문구와 광고 배너를 편집합니다. 담양소식·지역정보·
          동아리·커뮤니티·행사 섹션은 각 메뉴에서 관리합니다.
        </p>
      </div>
      <MainPageSettingsForm settings={settings} />
    </div>
  );
}
