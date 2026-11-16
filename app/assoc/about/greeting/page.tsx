import { ContentPage, contentMetadata, type ContentPageDef } from "@/components/assoc/ContentPage";

const DEF: ContentPageDef = {
  "section": "/about",
  "title": "협회장 인사말",
  "pageSlug": "greeting",
  "current": "/about/greeting",
  "description": "담양군농구협회장의 인사말입니다.",
  "emptyTitle": "인사말을 준비하고 있습니다"
};

export const metadata = contentMetadata(DEF);

export default function Page() {
  return <ContentPage def={DEF} />;
}
