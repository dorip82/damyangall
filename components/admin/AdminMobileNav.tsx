"use client";

import type { ReactNode } from "react";
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

export interface AdminNavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

/**
 * Mobile fallback for a sidebar that's `hidden ... sm:block` — same nav
 * items, in a drawer. Takes pre-rendered icon elements rather than a
 * component reference: this renders inside a Client Component, and a raw
 * function (an unrendered icon component) can't be passed as a prop across
 * the Server -> Client boundary — only already-rendered elements can.
 */
export function AdminMobileNav({ navItems }: { navItems: readonly AdminNavItem[] }) {
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
          {navItems.map(({ href, label, icon }) => (
            <DrawerClose
              key={href}
              render={
                <Link
                  href={href}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                />
              }
            >
              {icon}
              {label}
            </DrawerClose>
          ))}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
