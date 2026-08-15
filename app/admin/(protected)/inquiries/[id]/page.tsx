import { notFound, redirect } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { InquiryReplyForm } from "@/components/admin/InquiryReplyForm";
import { InquiryModerationActions } from "@/components/admin/InquiryModerationActions";
import type { SiteInquiry } from "@/types/site";

export default async function AdminInquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const slug = await getCurrentSiteSlug();
  if (!slug) redirect("/");
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const { data: inquiry } = await supabase
    .from("site_inquiries")
    .select("*")
    .eq("id", id)
    .eq("site_id", site.id)
    .maybeSingle<SiteInquiry>();

  if (!inquiry) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{inquiry.title}</h1>
            {inquiry.status === "HIDDEN" ? <Badge variant="destructive">숨김</Badge> : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {inquiry.author_name}
            {inquiry.author_contact ? ` · ${inquiry.author_contact}` : ""} ·{" "}
            {new Date(inquiry.created_at).toLocaleString("ko-KR")}
          </p>
        </div>
        <InquiryModerationActions inquiryId={inquiry.id} siteId={site.id} status={inquiry.status} />
      </div>

      <p className="whitespace-pre-line rounded-md border border-border bg-card p-4 text-sm leading-relaxed text-card-foreground">
        {inquiry.content}
      </p>

      <div className="border-t border-border pt-6">
        <h2 className="mb-3 text-sm font-semibold text-foreground">답변</h2>
        <InquiryReplyForm
          inquiryId={inquiry.id}
          siteId={site.id}
          defaultValue={inquiry.reply_content ?? ""}
        />
      </div>
    </div>
  );
}
