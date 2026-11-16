import { ContentPage, contentMetadata, type ContentPageDef } from "@/components/assoc/ContentPage";

const DEF: ContentPageDef = {
  "section": "/sitemap",
  "title": "개인정보처리방침",
  "pageSlug": "privacy",
  "current": "/privacy",
  "emptyTitle": "개인정보처리방침을 준비하고 있습니다",
  "emptyDescription": "이 사이트는 문의와 대회 참가 신청을 처리하기 위해 입력하신 정보(이름, 연락처, 팀·선수 명단 등)만 수집합니다. 상세 방침은 협회가 확정한 뒤 게시합니다."
};

export const metadata = contentMetadata(DEF);

export default function Page() {
  return <ContentPage def={DEF} />;
}
