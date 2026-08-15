import { notFound } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function AdminLoginPage() {
  const slug = await getCurrentSiteSlug();
  if (!slug) notFound();
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-6">
      <div className="w-full max-w-sm space-y-6 rounded-sm border border-border bg-background p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{site.name} 관리자</p>
          <h1 className="mt-1 text-xl font-bold text-foreground">로그인</h1>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
