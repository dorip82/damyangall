import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { formatDate, getAssocContext, loadFiles } from "@/lib/assoc/data";
import { AssocContainer, AssocPageHeader, CategoryBadge, EmptyState } from "@/components/assoc/ui";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "자료실",
  description: "담양군농구협회 규정, 대회 규정, 각종 신청서와 서식을 내려받을 수 있습니다.",
  alternates: { canonical: "/archive" },
};

function formatBytes(n: number | null) {
  if (!n) return "";
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))}KB`;
  return `${(n / 1024 / 1024).toFixed(1)}MB`;
}

export default async function ArchivePage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat } = await searchParams;
  const { site, config } = await getAssocContext();
  const section = config.nav.find((n) => n.href === "/archive")!;
  const category = cat && config.fileCategories.includes(cat) ? cat : undefined;
  const files = await loadFiles(site.id, { category });
  const tabs = [{ label: "전체", value: undefined as string | undefined }, ...config.fileCategories.map((c) => ({ label: c, value: c }))];

  return (
    <>
      <AssocPageHeader
        section={{ ...section, children: [{ label: "전체 자료", href: "/archive" }, ...section.children] }}
        title={category ?? "자료실"}
        description="협회 규정과 각종 신청서, 서식을 내려받으세요."
        current={category ? `/archive?cat=${category}` : "/archive"}
      />
      <AssocContainer>
        <nav aria-label="자료 분류" className="mb-6 sm:hidden">
          <ul className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <li key={t.label}>
                <Link
                  href={t.value ? `/archive?cat=${encodeURIComponent(t.value)}` : "/archive"}
                  className={cn(
                    "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-semibold",
                    t.value === category ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  )}
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {files.length ? (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white">
            {files.map((f) => {
              const ext = f.file_name.split(".").pop()?.toUpperCase() ?? "";
              return (
                <li key={f.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                  <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--dba-soft)] text-[var(--dba-blue)]">
                    <FileText className="size-5" aria-hidden />
                    <span className="text-[10px] font-black">{ext}</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <CategoryBadge>{f.category}</CategoryBadge>
                      <p className="font-bold text-foreground">{f.title}</p>
                    </div>
                    {f.description ? <p className="mt-1 text-sm text-muted-foreground">{f.description}</p> : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(f.created_at)} · {f.file_name}
                      {f.file_size ? ` · ${formatBytes(f.file_size)}` : ""} · 다운로드 {f.download_count}
                    </p>
                  </div>
                  <a
                    href={`/archive/download/${f.id}`}
                    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-[var(--dba-blue)]"
                  >
                    <Download className="size-4" aria-hidden />
                    내려받기
                    <span className="sr-only">: {f.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title="등록된 자료가 없습니다" description="자료가 등록되면 이곳에서 내려받을 수 있습니다." />
        )}
      </AssocContainer>
    </>
  );
}
