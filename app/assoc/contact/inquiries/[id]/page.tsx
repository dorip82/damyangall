import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { formatDate, getAssocContext } from "@/lib/assoc/data";
import { loadPublicInquiries } from "@/lib/assoc/inquiries";
import { InquiryViewer } from "@/components/assoc/InquiryViewer";
import { AssocContainer, AssocPageHeader } from "@/components/assoc/ui";

export const metadata: Metadata = {
  title: "내 문의 보기",
  robots: { index: false, follow: false },
};

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { site, config } = await getAssocContext();
  const row = (await loadPublicInquiries(site.id)).find((r) => r.id === id);
  if (!row || !row.can_view) notFound();
  const section = config.nav.find((n) => n.href === "/contact")!;
  const typeLabel = config.inquiryTypes.find((t) => t.key === row.inquiry_type)?.label ?? "문의";

  return (
    <>
      <AssocPageHeader section={section} title="문의 내역" current="/contact/inquiries" />
      <AssocContainer className="max-w-3xl">
        <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-[var(--dba-soft)] p-5 text-[15px] sm:grid-cols-4">
          <div>
            <dt className="text-sm text-muted-foreground">유형</dt>
            <dd className="font-bold text-primary">{typeLabel}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">작성자</dt>
            <dd className="font-bold text-primary">{row.masked_name}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">등록일</dt>
            <dd className="font-bold text-primary tabular-nums">{formatDate(row.created_at)}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">상태</dt>
            <dd className="font-bold text-primary">{row.answered ? "답변완료" : "답변 준비 중"}</dd>
          </div>
        </dl>

        <div className="mt-8">
          <InquiryViewer inquiryId={row.id} />
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <Link
            href="/contact/inquiries"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 font-bold text-primary hover:border-primary"
          >
            <ArrowLeft className="size-4" aria-hidden />
            목록으로
          </Link>
        </div>
      </AssocContainer>
    </>
  );
}
