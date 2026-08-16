import { LoginForm } from "@/components/admin/LoginForm";

export default function DirectoryAdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-6">
      <div className="w-full max-w-sm space-y-6 rounded-sm border border-border bg-background p-8 shadow-sm">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">올담 지역정보 관리자</p>
          <h1 className="mt-1 text-xl font-bold text-foreground">로그인</h1>
        </div>
        <LoginForm redirectTo="/directory/admin" />
      </div>
    </div>
  );
}
