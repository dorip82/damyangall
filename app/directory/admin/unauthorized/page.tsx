import Link from "next/link";

export default function DirectoryAdminUnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-muted px-6 text-center">
      <h1 className="text-xl font-bold text-foreground">접근 권한이 없습니다</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        올담 지역정보 관리자(SUPER_ADMIN) 계정으로 로그인해주세요.
      </p>
      <Link
        href="/directory/admin/login"
        className="text-sm font-medium text-primary underline"
      >
        다른 계정으로 로그인
      </Link>
    </div>
  );
}
