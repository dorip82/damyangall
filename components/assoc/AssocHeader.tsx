"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { AssocLogo } from "@/components/assoc/AssocLogo";
import { cn } from "@/lib/utils";
import type { AssocNavItem } from "@/lib/assoc/config";

export function AssocHeader({
  name,
  englishName,
  logoUrl,
  nav,
}: {
  name: string;
  englishName: string;
  logoUrl?: string | null;
  nav: AssocNavItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  // 연 페이지 경로를 기억해 두면 다른 페이지로 이동했을 때 자동으로 닫힌다.
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const [searchAt, setSearchAt] = useState<string | null>(null);
  const menuOpen = menuAt === pathname;
  const searchOpen = searchAt === pathname;
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-white/95 backdrop-blur transition-shadow",
        scrolled ? "border-border shadow-[0_2px_14px_rgba(16,38,79,0.08)]" : "border-transparent"
      )}
    >
      <a
        href="#main-content"
        className="sr-only rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        본문 바로가기
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-lg" aria-label={`${name} 홈`}>
          <AssocLogo logoUrl={logoUrl} className="size-10 shrink-0 lg:size-12" />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-lg font-extrabold tracking-tight text-primary lg:text-xl">{name}</span>
            <span className="truncate text-[9.5px] font-semibold tracking-[0.06em] text-[var(--dba-blue)] sm:text-[10px] lg:text-[11px]">
              {englishName}
            </span>
          </span>
        </Link>

        <nav aria-label="주 메뉴" className="mx-auto hidden lg:block">
          <ul className="flex items-center">
            {nav.map((item) => (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-3 py-3 text-[16px] font-bold text-foreground transition-colors hover:text-[var(--dba-blue)] xl:px-5",
                    isActive(item.href) && "text-[var(--dba-blue)]"
                  )}
                >
                  {item.label}
                  <ChevronDown
                    className="size-3.5 opacity-60 transition-transform group-focus-within:rotate-180 group-hover:rotate-180"
                    aria-hidden
                  />
                </Link>
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-x-3 -bottom-[14px] h-[3px] rounded-full bg-[var(--dba-orange)] transition-opacity xl:inset-x-5",
                    isActive(item.href) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                />
                <ul
                  aria-label={`${item.label} 하위 메뉴`}
                  className="invisible absolute top-full left-1/2 z-50 mt-3 min-w-48 -translate-x-1/2 translate-y-1 rounded-xl border border-border bg-white p-2 opacity-0 shadow-[0_14px_36px_rgba(16,38,79,0.16)] transition-[opacity,transform,visibility] duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 before:absolute before:inset-x-0 before:-top-4 before:h-4"
                >
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="block rounded-lg px-4 py-2.5 text-[15px] font-medium whitespace-nowrap text-foreground/85 transition-colors hover:bg-[var(--dba-soft)] hover:text-primary"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <button
            type="button"
            onClick={() => setSearchAt(searchOpen ? null : pathname)}
            aria-expanded={searchOpen}
            aria-controls="assoc-search"
            aria-label={searchOpen ? "검색 닫기" : "사이트 검색"}
            className="flex size-11 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted"
          >
            {searchOpen ? <X className="size-5" aria-hidden /> : <Search className="size-5" aria-hidden />}
          </button>
          <button
            type="button"
            onClick={() => setMenuAt(menuOpen ? null : pathname)}
            aria-expanded={menuOpen}
            aria-controls="assoc-mobile-menu"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            className="flex size-11 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted lg:hidden"
          >
            {menuOpen ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div id="assoc-search" className="border-t border-border bg-white">
          <form
            role="search"
            className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4 sm:px-6"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q")?.toString().trim();
              if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
            }}
          >
            <label htmlFor="assoc-search-input" className="sr-only">
              검색어
            </label>
            <input
              ref={searchRef}
              id="assoc-search-input"
              name="q"
              type="search"
              placeholder="공지, 대회, 동호회, 자료를 검색하세요"
              className="h-12 min-w-0 flex-1 rounded-full border border-input bg-[var(--dba-soft)] px-5 text-[15px] outline-none focus:border-[var(--dba-blue)] focus:bg-white"
            />
            <button
              type="submit"
              className="h-12 shrink-0 rounded-full bg-primary px-6 text-[15px] font-bold text-primary-foreground hover:bg-[var(--dba-blue)]"
            >
              검색
            </button>
          </form>
        </div>
      ) : null}

      {menuOpen ? (
        <nav
          id="assoc-mobile-menu"
          aria-label="모바일 메뉴"
          className="max-h-[calc(100svh-64px)] overflow-y-auto border-t border-border bg-white px-4 pt-2 pb-8 lg:hidden"
        >
          <ul className="divide-y divide-border">
            {nav.map((item) => (
              <li key={item.href} className="py-2">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-[17px] font-extrabold text-primary hover:bg-muted"
                >
                  {item.label}
                </Link>
                <ul className="grid grid-cols-2 gap-1 pl-2">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={() => setMenuAt(null)}
                        className="block rounded-lg px-3 py-2.5 text-[15px] text-foreground/80 hover:bg-[var(--dba-soft)]"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
