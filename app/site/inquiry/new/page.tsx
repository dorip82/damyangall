import { notFound } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { InquiryForm } from "@/components/site/InquiryForm";

export default async function NewInquiryPage() {
  const slug = await getCurrentSiteSlug();
  if (!slug) notFound();
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
        문의 글쓰기
      </h1>
      <InquiryForm siteId={site.id} />
    </section>
  );
}
