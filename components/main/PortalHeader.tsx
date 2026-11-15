import Link from "next/link";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AccountMenu } from "@/components/main/AccountMenu";
import { MobileNav } from "@/components/main/MobileNav";
import { HeaderShell } from "@/components/main/HeaderShell";
import { PortalNavLinks } from "@/components/main/PortalNavLinks";
import { LogoMark } from "@/components/main/LogoMark";

/**
 * @param overlay 메인 페이지 전용: 히어로 이미지 위에 투명하게 겹쳐 놓았다가
 *   스크롤하면 밝은 고정 헤더로 바뀐다. 다른 페이지는 처음부터 밝은 고정 헤더.
 */
export async function PortalHeader({ overlay = false }: { overlay?: boolean } = {}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nickname: string | null = null;
  let isSuperAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("nickname, email, role")
      .eq("id", user.id)
      .maybeSingle();
    nickname = profile?.nickname || profile?.email?.split("@")[0] || null;
    isSuperAdmin = profile?.role === "SUPER_ADMIN";
  }

  return (
    <HeaderShell overlay={overlay}>
      <a
        href="#main-content"
        className="sr-only rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        본문 바로가기
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:px-6 lg:h-[72px]">
        <MobileNav isLoggedIn={Boolean(user)} />

        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg">
          <LogoMark className="group-data-[transparent=true]:bg-ivory/15 group-data-[transparent=true]:ring-1 group-data-[transparent=true]:ring-ivory/30" />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold tracking-tight">올담</span>
            <span className="hidden text-xs opacity-80 xl:inline">담양의 모든 이야기를 담다</span>
          </span>
        </Link>

        <div className="ml-4 flex-1 xl:ml-8">
          <PortalNavLinks />
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/search"
            aria-label="통합 검색"
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-muted group-data-[transparent=true]:hover:bg-white/10"
          >
            <Search className="size-5" aria-hidden />
          </Link>
          {user ? (
            <AccountMenu nickname={nickname} isSuperAdmin={isSuperAdmin} />
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-muted group-data-[transparent=true]:hover:bg-white/10 sm:inline-block"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 group-data-[transparent=true]:bg-ivory group-data-[transparent=true]:text-primary group-data-[transparent=true]:hover:bg-white"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </HeaderShell>
  );
}
