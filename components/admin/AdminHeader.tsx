import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { NAV_ITEMS } from "@/components/admin/AdminSidebar";
import type { Site } from "@/types/site";

export function AdminHeader({ site }: { site: Site }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-2">
        <AdminMobileNav
          navItems={NAV_ITEMS.map(({ href, label, Icon }) => ({
            href,
            label,
            icon: <Icon className="size-4" aria-hidden />,
          }))}
        />
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-foreground">{site.name}</span>
          <span className="text-sm text-muted-foreground">관리자</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          사이트 보기
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
