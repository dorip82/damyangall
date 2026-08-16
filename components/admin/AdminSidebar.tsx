import Link from "next/link";
import { LayoutDashboard, Settings, FileText, Newspaper, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", Icon: LayoutDashboard },
  { href: "/admin/site-info", label: "사이트 정보", Icon: Settings },
  { href: "/admin/pages", label: "페이지", Icon: FileText },
  { href: "/admin/posts", label: "활동내역", Icon: Newspaper },
  { href: "/admin/inquiries", label: "문의", Icon: MessageCircle },
  { href: "/admin/account", label: "계정", Icon: User },
] as const;

export function AdminSidebar() {
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
