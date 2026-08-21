"use client";

import Link from "next/link";
import { Menu, type LucideIcon } from "lucide-react";
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
  Icon: LucideIcon;
}

/** Mobile fallback for a sidebar that's `hidden ... sm:block` — same nav items, in a drawer. */
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
          {navItems.map(({ href, label, Icon }) => (
            <DrawerClose
              key={href}
              render={
                <Link
                  href={href}
                  className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                />
              }
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </DrawerClose>
          ))}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
