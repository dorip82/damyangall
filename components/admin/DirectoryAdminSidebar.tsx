import Link from "next/link";
import {
  LayoutDashboard,
  Home,
  Store,
  Newspaper,
  CalendarDays,
  MessageCircle,
  Megaphone,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/directory/admin", label: "대시보드", Icon: LayoutDashboard },
  { href: "/directory/admin/main", label: "메인 페이지", Icon: Home },
  { href: "/directory/admin/listings", label: "업체(지역정보)", Icon: Store },
  { href: "/directory/admin/news", label: "담양소식", Icon: Newspaper },
  { href: "/directory/admin/events", label: "행사", Icon: CalendarDays },
  { href: "/directory/admin/community", label: "커뮤니티", Icon: MessageCircle },
  { href: "/directory/admin/ads", label: "광고 배너", Icon: Megaphone },
] as const;

export function DirectoryAdminSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-sidebar-border bg-sidebar sm:block">
      <nav className="flex flex-col gap-1 p-4">
        {NAV_ITEMS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
