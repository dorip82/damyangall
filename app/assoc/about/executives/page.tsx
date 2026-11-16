import { ContentPage, contentMetadata, type ContentPageDef } from "@/components/assoc/ContentPage";

const DEF: ContentPageDef = {
  "section": "/about",
  "title": "임원진 소개",
  "pageSlug": "executives",
  "current": "/about/executives",
  "description": "담양군농구협회 임원진과 역대 임원을 소개합니다.",
  "emptyTitle": "임원진 정보를 준비하고 있습니다",
  "emptyDescription": "임원진과 역대 임원 정보가 등록되면 이곳에 표시됩니다."
};

export const metadata = contentMetadata(DEF);

export default function Page() {
  return <ContentPage def={DEF} />;
}
