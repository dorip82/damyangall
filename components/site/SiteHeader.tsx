"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteNavigation } from "@/components/site/SiteNavigation";
import type { Site, SiteMenu } from "@/types/site";

export function SiteHeader({ site, menus }: { site: Site; menus: SiteMenu[] }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          {site.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={site.logo_url} alt={site.name} className="h-12 w-auto" />
          ) : (
            <span className="text-lg font-bold tracking-tight text-primary">
              {site.name}
            </span>
          )}
        </Link>

        <SiteNavigation menus={menus} className="hidden items-center gap-8 sm:flex" />

        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open ? (
        <SiteNavigation
          menus={menus}
          onNavigate={() => setOpen(false)}
          className="flex flex-col gap-1 border-t border-border bg-background px-6 py-4 sm:hidden"
        />
      ) : null}
    </header>
  );
}
