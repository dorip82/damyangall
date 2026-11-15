import Link from "next/link";
import { Rss } from "lucide-react";
import { getMainPageSettings } from "@/lib/main-settings/get-main-page-settings";
import { LogoMark } from "@/components/main/LogoMark";

const SERVICE_LINKS = [
  { href: "/news", label: "담양소식" },
  { href: "/community", label: "커뮤니티" },
  { href: "/directory", label: "지역정보" },
  { href: "/events", label: "행사" },
  { href: "/search", label: "업체·단체 찾기" },
];

const JOIN_LINKS = [
  { href: "/community/new", label: "커뮤니티 글쓰기" },
  { href: "/login", label: "로그인" },
  { href: "/signup", label: "회원가입" },
];

/**
 * 소개 문구는 /directory/admin/main 에서 편집하는 main_page_settings 값을 그대로 쓴다.
 * 고객센터 연락처·운영 정보·소셜 계정은 현재 사이트에 등록된 실제 정보가 없어
 * 임의로 넣지 않았다 — 정보가 정해지면 이 컴포넌트에 추가한다.
 * id="about"은 상단 메뉴 "올담 소개"의 이동 지점이다.
 */
export async function PortalFooter() {
  const settings = await getMainPageSettings();

  return (
    <footer className="on-dark mt-auto bg-deep-forest text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr] lg:py-16">
        <div id="about" className="scroll-mt-24">
          <div className="flex items-center gap-2.5">
            <LogoMark className="bg-ivory/10 ring-1 ring-ivory/20" />
            <p className="text-xl font-extrabold tracking-tight">{settings.footer_title}</p>
          </div>
          <h2 className="mt-5 text-sm font-bold text-wood">올담 소개</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ivory/80 break-keep">
            {settings.footer_description}
          </p>
        </div>

        <nav aria-label="서비스 메뉴">
          <h2 className="text-sm font-bold text-wood">서비스</h2>
          <ul className="mt-4 space-y-2.5">
            {SERVICE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-ivory/80 transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="참여 메뉴">
          <h2 className="text-sm font-bold text-wood">참여하기</h2>
          <ul className="mt-4 space-y-2.5">
            {JOIN_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-sm text-ivory/80 transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="/rss.xml" className="inline-flex items-center gap-1.5 text-sm text-ivory/80 transition-colors hover:text-white">
                <Rss className="size-3.5" aria-hidden />
                담양소식 RSS
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs text-ivory/60 sm:px-6">
          © {new Date().getFullYear()} {settings.footer_title}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
