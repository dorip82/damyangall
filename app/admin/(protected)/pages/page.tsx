import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export default async function AdminPagesListPage() {
  const slug = await getCurrentSiteSlug();
  if (!slug) redirect("/");
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const { data: pages } = await supabase
    .from("site_pages")
    .select("id, title, slug, is_home, is_published")
    .eq("site_id", site.id)
    .order("sort_order");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">페이지</h1>

      <ul className="divide-y divide-border rounded-md border border-border">
        {(pages ?? []).map((page) => (
          <li key={page.id}>
            <Link
              href={`/admin/pages/${page.id}`}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{page.title}</span>
                <span className="text-sm text-muted-foreground">/{page.is_home ? "" : page.slug}</span>
              </div>
              <div className="flex gap-2">
                {page.is_home ? <Badge variant="secondary">홈</Badge> : null}
                <Badge variant={page.is_published ? "default" : "outline"}>
                  {page.is_published ? "게시됨" : "미게시"}
                </Badge>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
