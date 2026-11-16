import { CalendarHeart, Mail, Phone } from "lucide-react";
import { telHref, type ClubContact } from "@/lib/site/contact";

/** 문의 페이지 옆 연락처 카드 — 실제 등록된 연락처만 보인다. 전화번호는 눌러서 바로 연결. */
export function ContactPanel({ contact }: { contact: ClubContact }) {
  return (
    <aside className="on-dark rounded-2xl bg-[var(--club-navy)] p-6 text-white shadow-[0_14px_34px_rgba(30,53,92,0.2)] sm:p-7">
      <h2 className="font-hand text-3xl text-[var(--club-yellow)]">연락처</h2>
      <ul className="mt-5 space-y-4">
        {contact.phone ? (
          <li>
            <p className="text-sm text-white/75">{contact.phoneLabel ?? "대표 전화"}</p>
            <a
              href={telHref(contact.phone)}
              className="mt-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight hover:underline"
            >
              <Phone className="size-5 text-[var(--club-yellow)]" aria-hidden />
              {contact.phone}
            </a>
          </li>
        ) : null}
        {contact.email ? (
          <li>
            <p className="text-sm text-white/75">이메일</p>
            <a href={`mailto:${contact.email}`} className="mt-1 flex items-center gap-2 font-semibold hover:underline">
              <Mail className="size-5 text-[var(--club-yellow)]" aria-hidden />
              {contact.email}
            </a>
          </li>
        ) : null}
        <li className="flex items-center gap-2 border-t border-white/15 pt-4 text-white/90">
          <CalendarHeart className="size-5 text-[var(--club-yellow)]" aria-hidden />
          공연 문의도 환영합니다!
        </li>
      </ul>
      {contact.phone ? (
        <a
          href={telHref(contact.phone)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--club-yellow)] py-3.5 font-bold text-[var(--club-navy)] transition-colors hover:bg-[#f0cf10] lg:hidden"
        >
          <Phone className="size-5" aria-hidden />
          전화 걸기
        </a>
      ) : null}
    </aside>
  );
}
