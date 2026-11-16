import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageCircle, PenLine } from "lucide-react";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/club/PageHeader";
import { ContactPanel } from "@/components/club/ContactPanel";
import { loadClubContact } from "@/lib/site/load-contact";
import { INQUIRY_TYPES } from "@/lib/site/inquiry-types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

export const metadata: Metadata = { title: "문의" };

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
  const [{ data: inquiries, count }, contact] = await Promise.all([
    supabase
      .from("site_inquiries")
      .select("id, title, author_name, created_at, reply_content", { count: "exact" })
      .eq("site_id", site.id)
      .eq("status", "PUBLISHED")
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1),
    loadClubContact(site),
  ]);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <>
      <PageHeader
        eyebrow="Contact us"
        title="문의"
        description={`${site.name}에 궁금한 점이나 하고 싶은 말을 자유롭게 남겨주세요. 누구나 글을 작성할 수 있습니다.`}
      />

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_340px] lg:py-16">
        <div className="min-w-0">
          <h2 className="mb-4 text-xl font-extrabold text-primary">어떤 문의를 하시나요?</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {INQUIRY_TYPES.map((t) => (
              <li key={t.value}>
                <Link
                  href={`/inquiry/new?type=${t.value}`}
                  className="group flex h-full items-center gap-3 rounded-2xl border border-border bg-white p-4 shadow-[0_4px_14px_rgba(30,53,92,0.05)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--club-green)] hover:shadow-[0_10px_24px_rgba(30,53,92,0.1)]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-primary">{t.label}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground break-keep">{t.description}</span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-[var(--club-green)] transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-12 mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold text-primary">문의 게시판</h2>
            <Link
              href="/inquiry/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--club-navy)] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--club-navy-deep)]"
            >
              <PenLine className="size-4" aria-hidden />
              글쓰기
            </Link>
          </div>

          {!inquiries?.length ? (
            <p className="rounded-2xl border border-dashed border-input bg-[var(--club-beige)] px-6 py-12 text-center text-muted-foreground">
              아직 등록된 글이 없습니다.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
              {inquiries.map((inquiry) => (
                <li key={inquiry.id}>
                  <Link
                    href={`/inquiry/${inquiry.id}`}
                    className="flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-[var(--club-beige)] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <span className="flex min-w-0 items-center gap-2 font-semibold text-foreground">
                      <span className="truncate">{inquiry.title}</span>
                      {inquiry.reply_content ? (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-[var(--club-green-light)] px-2 py-0.5 text-xs font-semibold text-[var(--club-green-dark)]">
                          <MessageCircle className="size-3.5" aria-hidden />
                          답변완료
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {inquiry.author_name} · {new Date(inquiry.created_at).toLocaleDateString("ko-KR")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 ? (
            <nav aria-label="페이지" className="mt-8 flex justify-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/inquiry?page=${p}`}
                  aria-current={p === page ? "page" : undefined}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full text-sm font-semibold",
                    p === page ? "bg-[var(--club-navy)] text-white" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {p}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <ContactPanel contact={contact} />
        </div>
      </div>
    </>
  );
}
