import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const slug = await getCurrentSiteSlug();
  if (!slug) redirect("/");
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const [
    { count: pageCount },
    { count: postCount },
    { count: publishedPostCount },
    { count: unansweredInquiryCount },
  ] = await Promise.all([
    supabase
      .from("site_pages")
      .select("*", { count: "exact", head: true })
      .eq("site_id", site.id),
    supabase
      .from("site_posts")
      .select("*", { count: "exact", head: true })
      .eq("site_id", site.id),
    supabase
      .from("site_posts")
      .select("*", { count: "exact", head: true })
      .eq("site_id", site.id)
      .eq("status", "PUBLISHED"),
    supabase
      .from("site_inquiries")
      .select("*", { count: "exact", head: true })
      .eq("site_id", site.id)
      .is("reply_content", null),
  ]);

  const stats = [
    { label: "페이지", value: pageCount ?? 0, href: "/admin/pages" },
    { label: "활동내역(전체)", value: postCount ?? 0, href: "/admin/posts" },
    { label: "활동내역(게시됨)", value: publishedPostCount ?? 0, href: "/admin/posts" },
    { label: "미답변 문의", value: unansweredInquiryCount ?? 0, href: "/admin/inquiries" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">대시보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          상태: {site.status === "ACTIVE" ? "게시됨" : site.status}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/site-info" className="text-sm font-medium text-primary underline">
          사이트 정보 수정
        </Link>
        <Link href="/admin/pages" className="text-sm font-medium text-primary underline">
          페이지 관리
        </Link>
        <Link href="/admin/posts/new" className="text-sm font-medium text-primary underline">
          활동내역 등록
        </Link>
        <Link href="/admin/inquiries" className="text-sm font-medium text-primary underline">
          문의 확인
        </Link>
      </div>
    </div>
  );
}
