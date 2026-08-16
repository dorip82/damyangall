import Link from "next/link";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalFooter } from "@/components/main/PortalFooter";
import { LoginForm } from "@/components/admin/LoginForm";

export default function LoginPage() {
  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">올담</p>
            <h1 className="mt-1 text-xl font-bold text-foreground">로그인</h1>
          </div>
          <LoginForm redirectTo="/" />
          <p className="text-center text-sm text-muted-foreground">
            아직 계정이 없으신가요?{" "}
            <Link href="/signup" className="font-medium text-primary underline">
              회원가입
            </Link>
          </p>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
