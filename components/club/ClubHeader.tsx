"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Home, Menu, X } from "lucide-react";
import { OcarinaMark } from "@/components/club/OcarinaMark";
import { cn } from "@/lib/utils";
import type { NavChild } from "@/lib/site/club-preset";

export interface ClubNavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

export function ClubHeader({
  name,
  tagline,
  englishName,
  slogan,
  nav,
}: {
  name: string;
  tagline?: string;
  englishName?: string;
  slogan?: string;
  nav: ClubNavItem[];
}) {
  const pathname = usePathname();
  // 메뉴를 연 페이지 경로를 기억해 두면, 다른 페이지로 옮겼을 때 자동으로 닫힌 상태가 된다.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (next: boolean | ((v: boolean) => boolean)) =>
    setOpenedAt((typeof next === "function" ? next(open) : next) ? pathname : null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-white transition-shadow duration-200",
        scrolled ? "border-border shadow-[0_2px_12px_rgba(30,53,92,0.08)]" : "border-transparent"
      )}
    >
      <a
        href="#main-content"
        className="sr-only rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        본문 바로가기
      </a>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[96px] lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg">
          <OcarinaMark className="h-10 w-14 lg:h-12 lg:w-16" />
          <span className="flex flex-col leading-none">
            <span className="flex items-baseline gap-2">
              <span className="font-brush text-[28px] text-primary lg:text-[34px]">{name}</span>
              {tagline ? (
                <span className="hidden text-sm font-semibold text-primary/80 sm:inline">{tagline}</span>
              ) : null}
            </span>
            {englishName ? (
              <span className="mt-1 text-[11px] tracking-wide text-muted-foreground lg:text-xs">
                {englishName}
              </span>
            ) : null}
          </span>
        </Link>

        <nav aria-label="주 메뉴" className="mx-auto hidden lg:block">
          <ul className="flex items-center">
            {nav.map((item, i) => (
              <li
                key={item.href}
                className={cn(
                  "group relative flex items-center",
                  i > 0 && "before:mx-1 before:h-5 before:w-px before:bg-border xl:before:mx-3"
                )}
              >
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  aria-label={item.href === "/" ? "홈" : undefined}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-[17px] font-semibold text-primary transition-colors hover:text-[var(--club-green)]",
                    isActive(item.href) && item.href !== "/" && "text-[var(--club-green-dark)]"
                  )}
                >
                  {item.href === "/" ? <Home className="size-6" aria-hidden /> : item.label}
                  {item.children?.length ? (
                    <ChevronDown
                      className="size-4 transition-transform group-focus-within:rotate-180 group-hover:rotate-180"
                      aria-hidden
                    />
                  ) : null}
                </Link>
                {item.children?.length ? (
                  <ul
                    aria-label={`${item.label} 하위 메뉴`}
                    className="invisible absolute top-full left-1/2 z-50 min-w-44 -translate-x-1/2 translate-y-1 rounded-xl border border-border bg-white p-1.5 opacity-0 shadow-[0_12px_32px_rgba(30,53,92,0.14)] transition-[opacity,transform,visibility] duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block rounded-lg px-4 py-2.5 text-[15px] font-medium text-foreground transition-colors hover:bg-[var(--club-green-light)] hover:text-primary"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        {slogan ? (
          <p className="relative ml-auto hidden shrink-0 pr-10 font-hand text-[28px] leading-none text-primary xl:block">
            {slogan}
            <svg
              aria-hidden
              viewBox="0 0 200 12"
              className="absolute -bottom-2 left-0 h-3 w-[calc(100%-2.5rem)] text-[var(--club-green)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M2 9c50-6 120-8 196-4" />
            </svg>
            <svg aria-hidden viewBox="0 0 40 40" className="absolute -top-3 right-0 size-9 text-[var(--club-green)]/70">
              <path d="M6 34C8 16 20 6 36 4 34 22 24 32 6 34z" fill="currentColor" opacity=".35" />
              <path d="M6 34C16 24 24 16 34 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="club-mobile-menu"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          className="ml-auto flex size-11 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted lg:hidden"
        >
          {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
        </button>
      </div>

      {open ? (
        <nav
          id="club-mobile-menu"
          aria-label="모바일 메뉴"
          className="max-h-[calc(100svh-72px)] overflow-y-auto border-t border-border bg-white px-4 pt-2 pb-6 lg:hidden"
        >
          <ul className="divide-y divide-border">
            {nav.map((item) => (
              <li key={item.href} className="py-1">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex items-center gap-2 rounded-lg px-3 py-3 text-base font-bold text-primary hover:bg-muted"
                >
                  {item.href === "/" ? <Home className="size-5" aria-hidden /> : null}
                  {item.label}
                </Link>
                {item.children?.length ? (
                  <ul className="mb-2 grid grid-cols-2 gap-1 pl-3">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-lg px-3 py-2.5 text-[15px] text-foreground/85 hover:bg-[var(--club-green-light)]"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          {slogan ? <p className="mt-4 px-3 font-hand text-2xl text-[var(--club-green-dark)]">{slogan}</p> : null}
        </nav>
      ) : null}
    </header>
  );
}
