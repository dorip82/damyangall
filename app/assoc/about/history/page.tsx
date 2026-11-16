import { ContentPage, contentMetadata, type ContentPageDef } from "@/components/assoc/ContentPage";

const DEF: ContentPageDef = {
  "section": "/about",
  "title": "협회 연혁",
  "pageSlug": "history",
  "current": "/about/history",
  "description": "담양군농구협회가 걸어온 길입니다.",
  "emptyTitle": "연혁을 준비하고 있습니다"
};

export const metadata = contentMetadata(DEF);

export default function Page() {
  return <ContentPage def={DEF} />;
}
