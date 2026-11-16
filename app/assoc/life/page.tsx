import { ContentPage, contentMetadata, type ContentPageDef } from "@/components/assoc/ContentPage";

const DEF: ContentPageDef = {
  "section": "/life",
  "title": "생활농구 소개",
  "pageSlug": "life",
  "current": "/life",
  "description": "군민 누구나 즐기는 생활체육 농구를 소개합니다."
};

export const metadata = contentMetadata(DEF);

export default function Page() {
  return <ContentPage def={DEF} />;
}
