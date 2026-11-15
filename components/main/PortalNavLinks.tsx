"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PORTAL_NAV_LINKS } from "@/lib/main/nav";
import { cn } from "@/lib/utils";

/** Desktop main menu (lg+). Marks the current section with aria-current. */
export function PortalNavLinks() {
  const pathname = usePathname();

  return (
    <nav aria-label="주 메뉴" className="hidden items-center gap-1 lg:flex">
      {PORTAL_NAV_LINKS.map((link) => {
        const active =
          !link.href.startsWith("#") &&
          (pathname === link.href || pathname.startsWith(`${link.href}/`));
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-2 text-[15px] font-medium transition-colors",
              "group-data-[transparent=true]:text-ivory/90 group-data-[transparent=true]:hover:bg-white/10 group-data-[transparent=true]:hover:text-white",
              "text-foreground/80 hover:bg-muted hover:text-primary",
              active &&
                "text-primary group-data-[transparent=true]:bg-white/15 group-data-[transparent=true]:text-white bg-muted"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
