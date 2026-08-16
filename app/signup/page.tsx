import Link from "next/link";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalFooter } from "@/components/main/PortalFooter";
import { SignupForm } from "@/components/main/SignupForm";

export default function SignupPage() {
  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">올담</p>
            <h1 className="mt-1 text-xl font-bold text-foreground">회원가입</h1>
          </div>
          <SignupForm />
          <p className="text-center text-sm text-muted-foreground">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="font-medium text-primary underline">
              로그인
            </Link>
          </p>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
