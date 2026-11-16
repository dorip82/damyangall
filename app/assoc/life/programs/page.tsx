import { ContentPage, contentMetadata, type ContentPageDef } from "@/components/assoc/ContentPage";

const DEF: ContentPageDef = {
  "section": "/life",
  "title": "생활체육 프로그램",
  "pageSlug": "programs",
  "current": "/life/programs",
  "description": "협회가 운영하는 생활체육 농구 프로그램입니다.",
  "emptyTitle": "프로그램 안내를 준비하고 있습니다"
};

export const metadata = contentMetadata(DEF);

export default function Page() {
  return <ContentPage def={DEF} />;
}
