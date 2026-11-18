import Link from "next/link";
import { Globe, Mail, MapPin, Phone, PlaySquare, ThumbsUp } from "lucide-react";
import { InstagramIcon } from "@/components/site/InstagramIcon";
import { AssocLogo, CourtLines } from "@/components/assoc/AssocLogo";

export interface AssocFooterInfo {
  name: string;
  englishName: string;
  slogan: string;
  logoUrl?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  blog?: string | null;
}

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** 연락처·주소·SNS 는 관리자 "사이트 정보"에서 입력한 값만 보여준다. */
export function AssocFooter({ info }: { info: AssocFooterInfo }) {
  type SnsLink = { href: string; label: string; Icon: React.ComponentType<{ className?: string }> };
  const sns: SnsLink[] = (
    [
      { href: info.instagram, label: "인스타그램", Icon: InstagramIcon },
      { href: info.facebook, label: "페이스북", Icon: ThumbsUp },
      { href: info.youtube, label: "유튜브", Icon: PlaySquare },
      { href: info.blog, label: "블로그", Icon: Globe },
    ] as { href?: string | null; label: string; Icon: SnsLink["Icon"] }[]
  ).filter((s): s is SnsLink => !!s.href);
  const hasContact = info.address || info.phone || info.email;

  return (
    <footer className="on-dark relative isolate overflow-hidden bg-[var(--dba-navy)] text-white">
      <CourtLines className="pointer-events-none absolute -right-24 -bottom-10 -z-10 w-[640px] text-white/[0.05]" />
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_auto]">
          <div>
            <div className="flex items-center gap-3">
              <AssocLogo logoUrl={info.logoUrl} tone="light" className="h-14 w-12 shrink-0" />
              <div>
                <p className="text-xl font-extrabold">{info.name}</p>
                <p className="text-[11px] font-semibold tracking-[0.08em] text-white/70">{info.englishName}</p>
              </div>
            </div>
            <p className="mt-5 text-lg font-bold text-[var(--dba-orange)]">{info.slogan}</p>
          </div>

          <address className="space-y-2.5 text-[15px] not-italic text-white/85">
            {info.address ? (
              <p className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-white/60" aria-hidden />
                <span>
                  <span className="sr-only">주소 </span>
                  {info.address}
                </span>
              </p>
            ) : null}
            {info.phone ? (
              <p className="flex gap-2.5">
                <Phone className="mt-0.5 size-4 shrink-0 text-white/60" aria-hidden />
                <a href={telHref(info.phone)} className="whitespace-nowrap hover:text-white hover:underline">
                  <span className="sr-only">대표 연락처 </span>
                  {info.phone}
                </a>
              </p>
            ) : null}
            {info.email ? (
              <p className="flex gap-2.5">
                <Mail className="mt-0.5 size-4 shrink-0 text-white/60" aria-hidden />
                <a href={`mailto:${info.email}`} className="break-all hover:text-white hover:underline">
                  <span className="sr-only">이메일 </span>
                  {info.email}
                </a>
              </p>
            ) : null}
            {!hasContact ? (
              <p className="text-white/70">
                협회 주소와 연락처는 등록 준비 중입니다.{" "}
                <Link href="/contact" className="font-semibold text-white underline underline-offset-4">
                  문의하기
                </Link>
                를 이용해 주세요.
              </p>
            ) : null}
          </address>

          {sns.length ? (
            <ul className="flex gap-2 lg:justify-end" aria-label="SNS">
              {sns.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} (새 창)`}
                    className="flex size-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                  >
                    <Icon className="size-5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/15 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li>
              <Link href="/privacy" className="font-bold text-[var(--dba-orange)] hover:underline">
                개인정보처리방침
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-white/85 hover:text-white hover:underline">
                이용약관
              </Link>
            </li>
            <li>
              <Link href="/sitemap" className="text-white/85 hover:text-white hover:underline">
                사이트맵
              </Link>
            </li>
            <li>
              <Link href="/admin" className="text-white/60 hover:text-white hover:underline">
                관리자
              </Link>
            </li>
          </ul>
          <p className="text-white/60">
            © {new Date().getFullYear()} {info.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
