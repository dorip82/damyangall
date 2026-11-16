import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

/** 서브 페이지 상단 제목 영역 + 같은 메뉴의 하위 탭. */
export function PageHeader({
  eyebrow,
  title,
  description,
  tabs,
  activeHref,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  tabs?: { label: string; href: string }[];
  activeHref?: string;
}) {
  return (
    <div className="relative overflow-hidden border-b border-border bg-[linear-gradient(120deg,var(--club-green-light)_0%,var(--club-beige)_60%,#ffffff_100%)]">
      <svg
        aria-hidden
        viewBox="0 0 520 160"
        className="pointer-events-none absolute -right-10 bottom-0 h-40 w-[520px] text-[var(--club-green)]/20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      >
        {[0, 9, 18, 27, 36].map((y) => (
          <path key={y} d={`M0 ${100 + y}C140 ${60 + y} 300 ${140 + y} 520 ${70 + y}`} />
        ))}
        <g fill="currentColor" stroke="none">
          <ellipse cx="380" cy="86" rx="8" ry="6" />
          <rect x="386" y="42" width="2.2" height="44" />
          <ellipse cx="450" cy="70" rx="8" ry="6" />
          <rect x="456" y="26" width="2.2" height="44" />
          <path d="M388 42h70v6h-70z" />
        </g>
      </svg>
      <div className="relative mx-auto max-w-6xl px-4 pt-8 pb-10 sm:px-6 lg:pt-10 lg:pb-12">
        <nav aria-label="현재 위치" className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 rounded hover:text-primary">
            <Home className="size-4" aria-hidden />
            <span className="sr-only">홈</span>
          </Link>
          <ChevronRight className="size-3.5" aria-hidden />
          <span className="font-medium text-foreground">{title}</span>
        </nav>
        {eyebrow ? <p className="font-hand text-2xl text-[var(--club-green-dark)]">{eyebrow}</p> : null}
        <h1 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground break-keep sm:text-base">
            {description}
          </p>
        ) : null}

        {tabs?.length ? (
          <ul className="mt-7 flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = tab.href === activeHref;
              return (
                <li key={tab.href}>
                  <Link
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    scroll={!tab.href.includes("#") ? true : undefined}
                    className={cn(
                      "inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                      active
                        ? "bg-[var(--club-navy)] text-white shadow-sm"
                        : "border border-border bg-white text-foreground/80 hover:border-[var(--club-green)] hover:text-[var(--club-green-dark)]"
                    )}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
