import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import type { SiteInquiry } from "@/types/site";

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const slug = await getCurrentSiteSlug();
  if (!slug) notFound();
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const { data: inquiry } = await supabase
    .from("site_inquiries")
    .select("*")
    .eq("id", id)
    .eq("site_id", site.id)
    .eq("status", "PUBLISHED")
    .maybeSingle<SiteInquiry>();

  if (!inquiry) notFound();

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <p className="font-hand text-2xl text-[var(--club-green-dark)]">문의 게시판</p>
      <h1 className="text-2xl font-extrabold tracking-tight text-primary break-keep sm:text-3xl">{inquiry.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {inquiry.author_name} ·{" "}
        {new Date(inquiry.created_at).toLocaleDateString("ko-KR")}
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-white p-6 whitespace-pre-line text-base leading-relaxed text-foreground/85 shadow-[0_4px_18px_rgba(30,53,92,0.06)]">
        {inquiry.content}
      </div>

      {inquiry.reply_content ? (
        <div className="mt-8 rounded-2xl border-l-4 border-[var(--club-green)] bg-[var(--club-green-light)] p-6">
          <p className="mb-2 text-sm font-bold text-[var(--club-green-dark)]">{site.name} 답변</p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">
            {inquiry.reply_content}
          </p>
          {inquiry.replied_at ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {new Date(inquiry.replied_at).toLocaleDateString("ko-KR")}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-10 border-t border-border pt-6">
        <Button variant="outline" render={<Link href="/inquiry" />}>
          목록보기
        </Button>
      </div>
    </article>
  );
}
