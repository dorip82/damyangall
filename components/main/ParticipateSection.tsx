import Link from "next/link";
import { ArrowRight, Megaphone, PenLine, Users } from "lucide-react";
import type { MainPageSettings } from "@/types/main-settings";

/**
 * 참여 안내 배너. 실제로 동작하는 기능(커뮤니티 글쓰기·지역제보·회원가입)만
 * 버튼으로 연결한다. 업체 광고·홍보는 아직 신청 기능이 없어서, 관리자가
 * /directory/admin/main 에서 켜 둔 경우에만 "준비중" 안내로 보여준다.
 */
export function ParticipateSection({
  isLoggedIn,
  settings,
}: {
  isLoggedIn: boolean;
  settings: Pick<MainPageSettings, "ad_banner_visible" | "ad_banner_title" | "ad_banner_description">;
}) {
  return (
    <section aria-labelledby="participate-title" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <h2 id="participate-title" className="sr-only">
        올담 참여하기
      </h2>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="on-dark relative overflow-hidden rounded-3xl bg-primary p-7 text-primary-foreground sm:p-10">
          <svg
            aria-hidden
            viewBox="0 0 200 200"
            className="pointer-events-none absolute -right-6 -bottom-10 h-64 w-64 text-white/[0.06]"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
          >
            <path d="M70 10v190M120 30v170M165 0v200" />
            <path d="M58 60h24M58 130h24M108 80h24M108 150h24M153 50h24M153 120h24" />
          </svg>
          <p className="text-xs font-bold tracking-[0.2em] text-wood uppercase">Join us</p>
          <h3 className="mt-3 text-2xl font-extrabold tracking-tight break-keep sm:text-3xl">
            담양의 이야기는 이웃이 함께 만들어요
          </h3>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-primary-foreground/85 break-keep">
            동네 소식, 맛집 추천, 구인구직, 행사 정보까지 — 커뮤니티에 글을 남기거나 지역제보
            분류로 알리고 싶은 소식을 공유해주세요.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/community/new"
              className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-3 text-sm font-bold text-primary shadow-sm transition-colors hover:bg-white"
            >
              <PenLine className="size-4" aria-hidden />
              커뮤니티 글쓰기
            </Link>
            <Link
              href="/community?category=REPORT"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-white/10"
            >
              지역제보 둘러보기
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {!isLoggedIn ? (
            <Link
              href="/signup"
              className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-6 shadow-[0_2px_10px_rgba(27,42,34,0.05)] transition-shadow hover:shadow-[0_10px_28px_rgba(27,42,34,0.12)]"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                <Users className="size-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold text-foreground">올담 회원가입</span>
                <span className="mt-0.5 block text-sm text-muted-foreground break-keep">
                  가입하면 마음에 드는 업체를 즐겨찾기로 모아볼 수 있어요.
                </span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          ) : null}

          {settings.ad_banner_visible ? (
            <div className="flex items-center gap-4 rounded-3xl border border-dashed border-input bg-secondary/60 p-6">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-card text-accent">
                <Megaphone className="size-6" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">{settings.ad_banner_title}</span>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                    준비중
                  </span>
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground break-keep">
                  {settings.ad_banner_description}
                </span>
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
