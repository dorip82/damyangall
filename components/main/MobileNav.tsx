"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/news", label: "담양소식" },
  { href: "/directory", label: "지역정보" },
  { href: "/community", label: "커뮤니티" },
  { href: "/events", label: "행사" },
];

/** The header's main <nav> is hidden below sm: this is the mobile fallback for it. */
export function MobileNav() {
  return (
    <Drawer swipeDirection="left">
      <DrawerTrigger
        render={
          <Button variant="ghost" size="icon" className="sm:hidden" aria-label="메뉴 열기">
            <Menu className="size-5" />
          </Button>
        }
      />
      <DrawerContent className="w-64">
        <DrawerHeader>
          <DrawerTitle>메뉴</DrawerTitle>
        </DrawerHeader>
        <nav className="flex flex-col gap-1 p-4 pt-2">
          {NAV_LINKS.map((link) => (
            <DrawerClose
              key={link.href}
              render={
                <Link
                  href={link.href}
                  className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                />
              }
            >
              {link.label}
            </DrawerClose>
          ))}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
