"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { PORTAL_NAV_LINKS } from "@/lib/main/nav";

/** The header's main <nav> is hidden below lg: this drawer is the fallback for it. */
export function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <Drawer swipeDirection="left">
      <DrawerTrigger
        render={
          <button
            type="button"
            aria-label="메뉴 열기"
            className="-ml-2 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted group-data-[transparent=true]:hover:bg-white/10 lg:hidden"
          />
        }
      >
        <Menu className="size-5" aria-hidden />
      </DrawerTrigger>
      <DrawerContent className="site-theme portal-theme w-72 bg-background text-foreground">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-extrabold text-primary">올담</DrawerTitle>
          <p className="text-xs text-muted-foreground">담양의 모든 이야기를 담다</p>
        </DrawerHeader>

        <form action="/search" role="search" className="px-4">
          <label htmlFor="mobile-search" className="sr-only">
            통합 검색
          </label>
          <div className="flex h-11 items-center gap-2 rounded-full border border-input bg-card px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <input
              id="mobile-search"
              type="search"
              name="q"
              placeholder="업체, 키워드, 소식 검색"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </form>

        <nav aria-label="모바일 메뉴" className="flex flex-col gap-0.5 p-4">
          {PORTAL_NAV_LINKS.map((link) => (
            <DrawerClose
              nativeButton={false}
              key={link.href}
              render={
                <Link
                  href={link.href}
                  className="rounded-lg px-3 py-3 text-[15px] font-medium text-foreground hover:bg-muted"
                />
              }
            >
              {link.label}
            </DrawerClose>
          ))}
        </nav>

        {!isLoggedIn ? (
          <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border p-4">
            <DrawerClose
              nativeButton={false}
              render={
                <Link
                  href="/login"
                  className="rounded-full border border-border py-2.5 text-center text-sm font-medium hover:bg-muted"
                />
              }
            >
              로그인
            </DrawerClose>
            <DrawerClose
              nativeButton={false}
              render={
                <Link
                  href="/signup"
                  className="rounded-full bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                />
              }
            >
              회원가입
            </DrawerClose>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
