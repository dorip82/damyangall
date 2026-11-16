import Link from "next/link";
import { ChevronRight, Home, Inbox } from "lucide-react";
import { CourtLines } from "@/components/assoc/AssocLogo";
import { cn } from "@/lib/utils";
import type { AssocNavItem } from "@/lib/assoc/config";

/** 서브페이지 상단: 제목 띠 + 경로 + 같은 메뉴의 하위 탭 */
export function AssocPageHeader({
  section,
  title,
  description,
  current,
}: {
  section: AssocNavItem;
  title: string;
  description?: string;
  /** 현재 하위 메뉴 href (탭 강조용) */
  current?: string;
}) {
  return (
    <>
      <div className="on-dark relative isolate overflow-hidden bg-[var(--dba-navy)] text-white">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_0%,rgba(23,79,145,0.9),transparent_60%),radial-gradient(ellipse_at_0%_100%,rgba(16,150,107,0.35),transparent_55%)]"
        />
        <CourtLines className="pointer-events-none absolute top-1/2 -right-32 -z-10 w-[620px] -translate-y-1/2 text-white/[0.08]" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav aria-label="현재 위치" className="text-sm text-white/75">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="flex items-center gap-1 hover:text-white">
                  <Home className="size-3.5" aria-hidden />
                  <span>홈</span>
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link href={section.href} className="hover:text-white">
                  {section.label}
                </Link>
              </li>
              {title !== section.label ? (
                <>
                  <li aria-hidden>
                    <ChevronRight className="size-3.5" />
                  </li>
                  <li aria-current="page" className="font-semibold text-white">
                    {title}
                  </li>
                </>
              ) : null}
            </ol>
          </nav>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-[44px]">{title}</h1>
          {description ? <p className="mt-3 max-w-2xl text-[15px] text-white/80 sm:text-base">{description}</p> : null}
        </div>
      </div>
      <div className="sticky top-16 z-30 border-b border-border bg-white/95 backdrop-blur lg:top-20">
        <nav aria-label={`${section.label} 메뉴`} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]">
            {section.children.map((c) => {
              const active = c.href === current;
              return (
                <li key={c.href} className="shrink-0">
                  <Link
                    href={c.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block border-b-[3px] px-3 py-4 text-[15px] font-semibold whitespace-nowrap transition-colors sm:px-4",
                      active
                        ? "border-[var(--dba-orange)] text-primary"
                        : "border-transparent text-muted-foreground hover:text-primary"
                    )}
                  >
                    {c.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}

export function AssocContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8", className)}>{children}</div>;
}

export function SectionTitle({
  title,
  eyebrow,
  moreHref,
  moreLabel = "더보기",
  as: Tag = "h2",
  id,
}: {
  title: string;
  eyebrow?: string;
  moreHref?: string;
  moreLabel?: string;
  as?: "h2" | "h3";
  id?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-bold tracking-[0.14em] text-[var(--dba-green-text)] uppercase">{eyebrow}</p>
        ) : null}
        <Tag id={id} className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-primary sm:text-2xl">
          <span className="h-5 w-1.5 rounded-full bg-[var(--dba-orange)]" aria-hidden />
          {title}
        </Tag>
      </div>
      {moreHref ? (
        <Link
          href={moreHref}
          className="flex shrink-0 items-center gap-0.5 rounded-full border border-border px-3.5 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {moreLabel}
          <ChevronRight className="size-4" aria-hidden />
          <span className="sr-only">: {title}</span>
        </Link>
      ) : null}
    </div>
  );
}

/** 실제 데이터가 아직 없을 때 — 임의의 내용을 채우지 않고 "등록 대기"로 안내한다. */
export function EmptyState({
  title = "등록된 내용이 없습니다",
  description = "관리자가 내용을 등록하면 이곳에 표시됩니다.",
  className,
  children,
}: {
  title?: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--input)] bg-[var(--dba-soft)] px-6 py-14 text-center",
        className
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-white text-[var(--dba-blue)] shadow-sm">
        <Inbox className="size-6" aria-hidden />
      </span>
      <p className="mt-4 font-bold text-primary">{title}</p>
      {description ? <p className="mt-1.5 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  OPEN: "bg-[var(--dba-green)] text-white",
  BEFORE: "bg-[var(--dba-blue)] text-white",
  PREPARING: "bg-slate-200 text-slate-700",
  NONE: "bg-slate-200 text-slate-700",
  CLOSED: "bg-slate-600 text-white",
  ONGOING: "bg-[var(--dba-orange)] text-[var(--dba-navy)]",
  FINISHED: "bg-[var(--dba-navy)] text-white",
};

export function StatusBadge({ tone, children, className }: { tone: string; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap",
        STATUS_TONE[tone] ?? "bg-slate-200 text-slate-700",
        className
      )}
    >
      {children}
    </span>
  );
}

export function CategoryBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-md bg-[var(--dba-soft)] px-2 py-0.5 text-xs font-bold whitespace-nowrap text-[var(--dba-blue)] ring-1 ring-[var(--border)] ring-inset">
      {children}
    </span>
  );
}
