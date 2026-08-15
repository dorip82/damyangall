import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 20;

export default async function InquiryListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1) || 1);

  const slug = await getCurrentSiteSlug();
  if (!slug) notFound();
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const from = (page - 1) * PAGE_SIZE;
  const { data: inquiries, count } = await supabase
    .from("site_inquiries")
    .select("id, title, author_name, created_at, reply_content", { count: "exact" })
    .eq("site_id", site.id)
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">문의</h1>
        <Button render={<Link href="/inquiry/new" />}>글쓰기</Button>
      </div>
      <p className="mb-8 text-sm text-muted-foreground">
        소리향기에 궁금한 점이나 하고 싶은 말을 자유롭게 남겨주세요. 누구나 글을 작성할 수 있습니다.
      </p>

      {!inquiries?.length ? (
        <p className="text-sm text-muted-foreground">아직 등록된 글이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border">
          {inquiries.map((inquiry) => (
            <li key={inquiry.id}>
              <Link
                href={`/inquiry/${inquiry.id}`}
                className="flex items-center justify-between gap-4 py-4"
              >
                <span className="flex items-center gap-2 font-medium text-foreground">
                  {inquiry.title}
                  {inquiry.reply_content ? (
                    <span className="flex items-center gap-1 text-xs font-normal text-accent">
                      <MessageCircle className="size-3.5" aria-hidden />
                      답변완료
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {inquiry.author_name} ·{" "}
                  {new Date(inquiry.created_at).toLocaleDateString("ko-KR")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav className="mt-8 flex justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/inquiry?page=${p}`}
              className={
                p === page
                  ? "font-bold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              {p}
            </Link>
          ))}
        </nav>
      ) : null}
    </section>
  );
}
