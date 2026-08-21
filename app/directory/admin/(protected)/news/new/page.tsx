import { NewsForm } from "@/components/admin/NewsForm";
import { createNews } from "@/app/directory/admin/(protected)/news/actions";

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">새 소식 등록</h1>
      <NewsForm action={createNews} submitLabel="등록" />
    </div>
  );
}
