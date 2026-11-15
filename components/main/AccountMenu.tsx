"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountMenu({
  nickname,
  isSuperAdmin,
}: {
  nickname: string | null;
  isSuperAdmin: boolean;
}) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors hover:bg-muted group-data-[transparent=true]:hover:bg-white/10">
        <span className="hidden sm:inline">{nickname}님</span>
        <ChevronDown className="size-3.5" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isSuperAdmin ? (
          <>
            <DropdownMenuItem render={<Link href="/directory/admin" />}>
              <LayoutDashboard className="size-4" aria-hidden />
              관리자 페이지
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem variant="destructive" onClick={handleLogout}>
          <LogOut className="size-4" aria-hidden />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
