import { ContentPage, contentMetadata, type ContentPageDef } from "@/components/assoc/ContentPage";
import { RecruitingClubs } from "@/components/assoc/RecruitingClubs";

const DEF: ContentPageDef = {
  "section": "/life",
  "title": "회원 모집 안내",
  "pageSlug": "recruit",
  "current": "/life/recruit",
  "description": "협회와 동호회 회원 모집 안내입니다.",
  "emptyTitle": "모집 안내를 준비하고 있습니다"
};

export const metadata = contentMetadata(DEF);

export default function Page() {
  return (
    <ContentPage def={DEF}>
      <RecruitingClubs />
    </ContentPage>
  );
}
