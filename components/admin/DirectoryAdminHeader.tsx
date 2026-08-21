import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { NAV_ITEMS } from "@/components/admin/DirectoryAdminSidebar";

export function DirectoryAdminHeader() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-2">
        <AdminMobileNav navItems={NAV_ITEMS} />
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-foreground">올담</span>
          <span className="text-sm text-muted-foreground">플랫폼 관리자</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          메인 사이트 보기
        </Link>
        <Link
          href="/directory/admin/account"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          계정
        </Link>
        <LogoutButton redirectTo="/directory/admin/login" />
      </div>
    </header>
  );
}
