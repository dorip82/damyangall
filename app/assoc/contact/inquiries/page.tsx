import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Lock, PenLine } from "lucide-react";
import { formatDate, getAssocContext } from "@/lib/assoc/data";
import { loadPublicInquiries } from "@/lib/assoc/inquiries";
import { AssocContainer, AssocPageHeader, EmptyState } from "@/components/assoc/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "문의 내역",
  description: "접수된 문의 목록입니다. 문의 내용과 답변은 작성자가 조회 비밀번호로 확인할 수 있습니다.",
  alternates: { canonical: "/contact/inquiries" },
};

const PAGE_SIZE = 15;
const cols = "md:grid-cols-[72px_130px_minmax(0,1fr)_100px_110px_96px]";

export default async function InquiryListPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const { site, config } = await getAssocContext();
  const section = config.nav.find((n) => n.href === "/contact")!;
  const rows = await loadPublicInquiries(site.id);
  const typeLabel = (k: string | null) => config.inquiryTypes.find((t) => t.key === k)?.label ?? "문의";

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number(pageParam) || 1));
  const shown = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const start = rows.length - (page - 1) * PAGE_SIZE;

  return (
    <>
      <AssocPageHeader
        section={section}
        title="문의 내역"
        description="문의 내용과 답변은 비공개입니다. 내 문의를 누르고 접수할 때 정한 조회 비밀번호를 입력하면 볼 수 있습니다."
        current="/contact/inquiries"
      />
      <AssocContainer>
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[15px] text-muted-foreground">
            전체 <strong className="text-primary tabular-nums">{rows.length}</strong>건
          </p>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-5 text-[15px] font-bold text-primary-foreground hover:bg-[var(--dba-blue)]"
          >
            <PenLine className="size-4" aria-hidden />
            문의하기
          </Link>
        </div>

        {!shown.length ? (
          <EmptyState title="접수된 문의가 없습니다" description="궁금한 점은 문의하기에서 남겨주세요." />
        ) : (
          <div className="border-t-2 border-primary bg-white">
            <div className={cn("hidden border-b border-border bg-[var(--dba-soft)] px-5 py-3 text-center text-sm font-bold text-primary md:grid md:gap-x-2", cols)}>
              <span>번호</span>
              <span>유형</span>
              <span>제목</span>
              <span>작성자</span>
              <span>등록일</span>
              <span>상태</span>
            </div>
            <ul className="divide-y divide-border border-b border-border">
              {shown.map((r, i) => {
                const inner = (
                  <>
                    <span className="hidden text-center text-sm text-muted-foreground tabular-nums md:block">{start - i}</span>
                    <span className="hidden text-center text-sm font-semibold text-[var(--dba-blue)] md:block">{typeLabel(r.inquiry_type)}</span>
                    <span className="flex min-w-0 items-center gap-2 font-medium">
                      <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <span className="truncate group-hover:text-[var(--dba-blue)] group-hover:underline">
                        <span className="md:hidden">[{typeLabel(r.inquiry_type)}] </span>비공개 문의입니다
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground md:contents md:text-sm">
                      <span className="md:text-center">{r.masked_name}</span>
                      <span className="tabular-nums md:text-center">{formatDate(r.created_at)}</span>
                      <span className="md:flex md:justify-center">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold",
                            r.answered ? "bg-[var(--dba-green)] text-white" : "bg-slate-200 text-slate-700"
                          )}
                        >
                          {r.answered ? "답변완료" : "접수"}
                        </span>
                      </span>
                    </span>
                  </>
                );
                const rowCls = cn("grid grid-cols-[minmax(0,1fr)] gap-y-1 px-4 py-4 sm:px-5 md:items-center md:gap-x-2", cols);
                return (
                  <li key={r.id}>
                    {r.can_view ? (
                      <Link href={`/contact/inquiries/${r.id}`} className={cn("group hover:bg-[var(--dba-soft)]", rowCls)}>
                        {inner}
                      </Link>
                    ) : (
                      <div className={rowCls} title="조회 비밀번호 없이 접수된 문의입니다">
                        {inner}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {pages > 1 ? (
          <nav aria-label="페이지 이동" className="mt-10 flex items-center justify-center gap-1">
            {page > 1 ? (
              <Link href={`/contact/inquiries?page=${page - 1}`} aria-label="이전 페이지" className="flex size-10 items-center justify-center rounded-full border border-border hover:border-primary">
                <ChevronLeft className="size-4" aria-hidden />
              </Link>
            ) : null}
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={`/contact/inquiries?page=${n}`}
                aria-current={n === page ? "page" : undefined}
                className={
                  n === page
                    ? "flex size-10 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground"
                    : "flex size-10 items-center justify-center rounded-full text-foreground/80 hover:bg-muted"
                }
              >
                {n}
              </Link>
            ))}
            {page < pages ? (
              <Link href={`/contact/inquiries?page=${page + 1}`} aria-label="다음 페이지" className="flex size-10 items-center justify-center rounded-full border border-border hover:border-primary">
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            ) : null}
          </nav>
        ) : null}
      </AssocContainer>
    </>
  );
}
