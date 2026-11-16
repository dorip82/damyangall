import { ContentPage, contentMetadata, type ContentPageDef } from "@/components/assoc/ContentPage";

const DEF: ContentPageDef = {
  "section": "/sitemap",
  "title": "이용약관",
  "pageSlug": "terms",
  "current": "/terms",
  "emptyTitle": "이용약관을 준비하고 있습니다"
};

export const metadata = contentMetadata(DEF);

export default function Page() {
  return <ContentPage def={DEF} />;
}
