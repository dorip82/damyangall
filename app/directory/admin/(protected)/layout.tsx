import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { LogoutButton } from "@/components/admin/LogoutButton";

export default async function DirectoryAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect-based gate for UX; every write action under here re-verifies
  // independently via requireSuperAdmin (see components/admin/LoginForm.tsx
  // usage note in lib/auth/require-site-role.ts for why).
  await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b border-border px-6">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-foreground">올담</span>
          <span className="text-sm text-muted-foreground">플랫폼 관리자</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/directory/admin/main"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            메인 관리
          </Link>
          <Link
            href="/directory/admin"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            업체 목록
          </Link>
          <Link
            href="/directory/admin/events"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            행사
          </Link>
          <Link
            href="/directory/admin/community"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            커뮤니티
          </Link>
          <Link
            href="/directory"
            target="_blank"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            지역정보 보기
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
      <main className="p-6">{children}</main>
    </div>
  );
}
