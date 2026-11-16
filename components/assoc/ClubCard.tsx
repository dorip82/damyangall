import Link from "next/link";
import { CalendarClock, MapPin, Phone, UserRound } from "lucide-react";
import type { SiteClub } from "@/types/site";

function telHref(v: string) {
  const digits = v.replace(/[^\d+]/g, "");
  return digits.length >= 8 ? `tel:${digits}` : null;
}

export function ClubCard({ club }: { club: SiteClub }) {
  const tel = club.contact ? telHref(club.contact) : null;
  return (
    <article id={`club-${club.id}`} className="flex scroll-mt-40 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <div className="relative aspect-[16/9] bg-[var(--dba-soft)]">
        {club.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={club.image_url} alt={`${club.name} 대표 사진`} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,var(--dba-navy),var(--dba-blue))]">
            <span className="text-2xl font-black text-white/90">{club.name}</span>
          </div>
        )}
        {club.is_recruiting ? (
          <span className="absolute top-3 left-3 rounded-full bg-[var(--dba-orange)] px-3 py-1 text-xs font-extrabold text-[var(--dba-navy)]">
            회원 모집중
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-extrabold text-primary">{club.name}</h3>
        <dl className="mt-3 space-y-1.5 text-[15px] text-foreground/85">
          {club.leader ? (
            <div className="flex gap-2">
              <dt className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                <UserRound className="size-4" aria-hidden />
                대표자
              </dt>
              <dd>{club.leader}</dd>
            </div>
          ) : null}
          {club.location ? (
            <div className="flex gap-2">
              <dt className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-4" aria-hidden />
                활동 장소
              </dt>
              <dd>{club.location}</dd>
            </div>
          ) : null}
          {club.schedule ? (
            <div className="flex gap-2">
              <dt className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                <CalendarClock className="size-4" aria-hidden />
                정기 활동
              </dt>
              <dd>{club.schedule}</dd>
            </div>
          ) : null}
        </dl>
        {club.description ? (
          <p className="mt-3 line-clamp-4 text-[15px] leading-relaxed whitespace-pre-line text-muted-foreground">{club.description}</p>
        ) : null}
        <div className="mt-auto flex flex-wrap gap-2 pt-5">
          {club.contact ? (
            tel ? (
              <a
                href={tel}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-[var(--dba-blue)]"
              >
                <Phone className="size-4" aria-hidden />
                가입 문의 {club.contact}
              </a>
            ) : (
              <p className="text-sm font-semibold text-primary">가입 문의: {club.contact}</p>
            )
          ) : null}
          <Link
            href={`/contact?type=club&club=${encodeURIComponent(club.name)}`}
            className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm font-bold text-primary hover:border-primary"
          >
            협회에 가입 문의
          </Link>
        </div>
      </div>
    </article>
  );
}
