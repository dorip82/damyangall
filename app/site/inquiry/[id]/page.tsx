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
    <article className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{inquiry.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {inquiry.author_name} ·{" "}
        {new Date(inquiry.created_at).toLocaleDateString("ko-KR")}
      </p>
      <div className="mt-8 whitespace-pre-line text-base leading-relaxed text-foreground/80">
        {inquiry.content}
      </div>

      {inquiry.reply_content ? (
        <div className="mt-10 border-l-2 border-accent bg-muted p-5">
          <p className="mb-2 text-sm font-semibold text-accent">소리향기 답변</p>
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
