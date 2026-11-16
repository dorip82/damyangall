import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  FileText,
  Newspaper,
  MessageCircle,
  User,
  Trophy,
  Users,
  FolderOpen,
  Megaphone,
  ShieldCheck,
} from "lucide-react";

export const NAV_ITEMS = [
  { href: "/admin", label: "대시보드", Icon: LayoutDashboard },
  { href: "/admin/site-info", label: "사이트 정보", Icon: Settings },
  { href: "/admin/pages", label: "페이지", Icon: FileText },
  { href: "/admin/posts", label: "활동내역", Icon: Newspaper },
  { href: "/admin/inquiries", label: "문의", Icon: MessageCircle },
  { href: "/admin/account", label: "계정", Icon: User },
] as const;

/** 협회형 사이트(담양군농구협회 등) 관리자 메뉴 */
export const ASSOC_NAV_ITEMS = [
  { href: "/admin", label: "대시보드", Icon: LayoutDashboard },
  { href: "/admin/site-info", label: "기본 정보", Icon: Settings },
  { href: "/admin/pages", label: "페이지 · 메인배너", Icon: FileText },
  { href: "/admin/posts", label: "공지 · 소식 · 갤러리", Icon: Newspaper },
  { href: "/admin/tournaments", label: "대회 · 참가신청", Icon: Trophy },
  { href: "/admin/clubs", label: "동호회", Icon: Users },
  { href: "/admin/files", label: "자료실", Icon: FolderOpen },
  { href: "/admin/inquiries", label: "문의", Icon: MessageCircle },
  { href: "/admin/banners", label: "팝업 · 홍보배너", Icon: Megaphone },
  { href: "/admin/members", label: "관리자 계정", Icon: ShieldCheck },
  { href: "/admin/account", label: "내 계정", Icon: User },
] as const;

export function getAdminNav(isAssoc: boolean) {
  return isAssoc ? ASSOC_NAV_ITEMS : NAV_ITEMS;
}

export function AdminSidebar({ isAssoc = false }: { isAssoc?: boolean }) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-sidebar-border bg-sidebar sm:block">
      <nav className="flex flex-col gap-1 p-4">
        {getAdminNav(isAssoc).map(({ href, label, Icon }) => (
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
