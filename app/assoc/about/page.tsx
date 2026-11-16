import { ContentPage, contentMetadata, type ContentPageDef } from "@/components/assoc/ContentPage";

const DEF: ContentPageDef = {
  "section": "/about",
  "title": "협회 소개",
  "pageSlug": "about",
  "current": "/about",
  "description": "담양군농구협회의 설립 목적과 주요 활동을 소개합니다."
};

export const metadata = contentMetadata(DEF);

export default function Page() {
  return <ContentPage def={DEF} />;
}
