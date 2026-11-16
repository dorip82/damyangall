import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { InquiryForm } from "@/components/site/InquiryForm";
import { PageHeader } from "@/components/club/PageHeader";
import { ContactPanel } from "@/components/club/ContactPanel";
import { loadClubContact } from "@/lib/site/load-contact";
import { getInquiryType } from "@/lib/site/inquiry-types";

export const metadata: Metadata = { title: "문의하기" };

export default async function NewInquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const slug = await getCurrentSiteSlug();
  if (!slug) notFound();
  const site = await getSiteBySlug(slug);
  if (!site) notFound();
  const contact = await loadClubContact(site);

  return (
    <>
      <PageHeader eyebrow="Contact us" title="문의하기" description="문의 유형을 고르고 내용을 남겨주시면 확인 후 답변드립니다." />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px] lg:py-16">
        <div className="rounded-2xl border border-border bg-white p-5 shadow-[0_4px_18px_rgba(30,53,92,0.06)] sm:p-8">
          <InquiryForm siteId={site.id} defaultType={getInquiryType(type)?.value} />
        </div>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <ContactPanel contact={contact} />
        </div>
      </div>
    </>
  );
}
