import { ContentPage, contentMetadata, type ContentPageDef } from "@/components/assoc/ContentPage";

const DEF: ContentPageDef = {
  "section": "/about",
  "title": "조직도",
  "pageSlug": "organization",
  "current": "/about/organization",
  "description": "담양군농구협회의 조직 구성입니다.",
  "emptyTitle": "조직도를 준비하고 있습니다"
};

export const metadata = contentMetadata(DEF);

export default function Page() {
  return <ContentPage def={DEF} />;
}
