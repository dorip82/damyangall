import { NewsSourceForm } from "@/components/admin/NewsSourceForm";
import { createNewsSource } from "@/app/directory/admin/(protected)/news/sources/actions";

// 미리보기 runs the scraper — same Seoul-region / duration reasoning as the
// news list page's "지금 수집하기".
export const preferredRegion = "icn1";
export const maxDuration = 60;

export default function NewNewsSourcePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">수집처 추가</h1>
      <NewsSourceForm action={createNewsSource} submitLabel="추가" />
    </div>
  );
}
