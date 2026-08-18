import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/admin/LogoutButton";

export async function PortalHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nickname: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("nickname, email")
      .eq("id", user.id)
      .maybeSingle();
    nickname = profile?.nickname || profile?.email?.split("@")[0] || null;
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-primary">올담</span>
          <span className="hidden text-sm text-muted-foreground sm:inline">
            담양의 모든 이야기를 담다
          </span>
        </Link>

        <nav className="ml-8 hidden items-center gap-6 sm:flex">
          <Link
            href="/directory"
            className="text-sm font-medium text-foreground/80 hover:text-primary"
          >
            지역정보
          </Link>
          <Link
            href="/community"
            className="text-sm font-medium text-foreground/80 hover:text-primary"
          >
            커뮤니티
          </Link>
          <Link
            href="/events"
            className="text-sm font-medium text-foreground/80 hover:text-primary"
          >
            행사
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {nickname}님
              </span>
              <LogoutButton redirectTo="/" />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground/80 hover:text-primary"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
