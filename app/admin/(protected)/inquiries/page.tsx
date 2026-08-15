import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export default async function AdminInquiriesPage() {
  const slug = await getCurrentSiteSlug();
  if (!slug) redirect("/");
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const { data: inquiries } = await supabase
    .from("site_inquiries")
    .select("id, title, author_name, status, reply_content, created_at")
    .eq("site_id", site.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">문의</h1>

      {!inquiries?.length ? (
        <p className="text-sm text-muted-foreground">등록된 문의가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id}>
              <Link
                href={`/admin/inquiries/${inquiry.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted"
              >
                <div>
                  <p className="font-medium text-foreground">{inquiry.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {inquiry.author_name} ·{" "}
                    {new Date(inquiry.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {inquiry.status === "HIDDEN" ? (
                    <Badge variant="destructive">숨김</Badge>
                  ) : null}
                  <Badge variant={inquiry.reply_content ? "default" : "outline"}>
                    {inquiry.reply_content ? "답변완료" : "미답변"}
                  </Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
