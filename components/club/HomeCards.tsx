import Link from "next/link";
import type { ReactNode } from "react";
import { CalendarHeart, ChevronRight, Mail, MessageSquareText, Phone, Play, Users } from "lucide-react";
import { YouTubeFacade } from "@/components/club/YouTubeFacade";
import { PhotoLightbox } from "@/components/club/PhotoLightbox";
import { Reveal } from "@/components/club/Reveal";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";
import { telHref, type ClubContact } from "@/lib/site/contact";
import type { ClubPost } from "@/lib/site/load-posts";
import type { NavChild } from "@/lib/site/club-preset";

function CardShell({
  icon,
  iconClassName,
  title,
  description,
  href,
  titleId,
  children,
}: {
  icon: ReactNode;
  iconClassName: string;
  title: string;
  description: string;
  href: string;
  titleId: string;
  children: ReactNode;
}) {
  return (
    <article
      aria-labelledby={titleId}
      className="group/card flex h-full flex-col rounded-2xl border border-border bg-white p-2 shadow-[0_4px_18px_rgba(30,53,92,0.07)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(30,53,92,0.13)]"
    >
      <header className="relative flex items-center gap-3.5 px-3 pt-3 pb-4 sm:px-4 xl:gap-4">
        <span
          className={`flex size-14 shrink-0 items-center justify-center rounded-full text-white lg:size-12 xl:size-16 [&_svg]:lg:size-6 [&_svg]:xl:size-7 ${iconClassName}`}
        >
          {icon}
        </span>
        <div className="min-w-0 flex-1 pr-16">
          <h2 id={titleId} className="text-2xl font-extrabold tracking-tight whitespace-nowrap text-primary lg:text-xl xl:text-2xl">
            {title}
          </h2>
          <p className="mt-1 text-[15px] text-muted-foreground break-keep lg:text-sm xl:text-[15px]">{description}</p>
        </div>
        <Link
          href={href}
          className="absolute top-3 right-2 flex items-center gap-0.5 rounded-full px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/80 transition-colors hover:text-[var(--club-green-dark)]"
        >
          바로가기
          <span className="sr-only">: {title}</span>
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </header>
      {children}
    </article>
  );
}

export function AboutCard({
  image,
  links,
}: {
  image?: { src: string; alt: string };
  links: (NavChild & { description: string })[];
}) {
  return (
    <CardShell
      titleId="card-about"
      icon={<Users className="size-7" aria-hidden />}
      iconClassName="bg-[var(--club-navy)]"
      title="동아리 소개"
      description="우리 소리향기를 소개합니다"
      href={links[0]?.href ?? "/about"}
    >
      <div className="aspect-[16/9] overflow-hidden rounded-xl bg-[var(--club-green-light)]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-[1.04]"
          />
        ) : null}
      </div>
      <ul className="flex-1 space-y-1 px-3 py-4 sm:px-4">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-[var(--club-green-light)]"
            >
              <span aria-hidden className="flex size-4 items-center justify-center rounded-full bg-[#c9d6e8]">
                <span className="size-1.5 rounded-full bg-[var(--club-navy)]" />
              </span>
              <span className="w-24 shrink-0 font-bold text-primary">{l.label}</span>
              <span className="min-w-0 truncate text-sm text-muted-foreground">{l.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </CardShell>
  );
}

export function ActivityCard({ posts }: { posts: ClubPost[] }) {
  const featured = posts.find((p) => p.youtubeId);
  const photos = posts.flatMap((p) => p.photos.map((ph) => ({ ...ph, caption: ph.caption ?? p.title })));
  // 사진이 없으면 다른 최근 영상 게시물 썸네일로 대신한다 (실제 동아리 영상).
  const otherVideos = posts.filter((p) => p.youtubeId && p.id !== featured?.id).slice(0, 3);

  return (
    <CardShell
      titleId="card-activity"
      icon={<Play className="size-7 translate-x-0.5 fill-white" aria-hidden />}
      iconClassName="bg-[var(--club-green)]"
      title="활동소식"
      description="우리의 활동을 만나보세요"
      href="/posts"
    >
      {featured?.youtubeId ? (
        <YouTubeFacade videoId={featured.youtubeId} title={featured.title} />
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
          아직 등록된 공연 영상이 없습니다.
        </div>
      )}
      <div className="flex-1 px-1 pt-2 pb-1">
        {photos.length ? (
          <PhotoLightbox photos={photos} limit={3} className="grid-cols-3 gap-2 sm:grid-cols-3 lg:grid-cols-3" />
        ) : otherVideos.length ? (
          <ul className="grid grid-cols-3 gap-2">
            {otherVideos.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/posts/${p.id}`}
                  className="group/thumb relative block aspect-[4/3] overflow-hidden rounded-lg bg-muted"
                  aria-label={p.title}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getYouTubeThumbnail(p.youtubeId!)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                  />
                  <span aria-hidden className="absolute right-1.5 bottom-1.5 flex size-6 items-center justify-center rounded-full bg-black/55">
                    <Play className="size-3 translate-x-px fill-white text-white" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </CardShell>
  );
}

export function ContactCard({ contact }: { contact: ClubContact }) {
  return (
    <CardShell
      titleId="card-contact"
      icon={<Mail className="size-7" aria-hidden />}
      iconClassName="bg-[var(--club-navy)]"
      title="문의"
      description="궁금한 점은 언제든 문의하세요"
      href="/inquiry"
    >
      {/* 노트와 펜을 그린 장식 이미지 (사진이 아니라 CSS/SVG 그래픽) */}
      <div
        aria-hidden
        className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[radial-gradient(circle_at_85%_15%,#f8e9b8_0%,transparent_45%),linear-gradient(135deg,#dfe8d0_0%,#c9d9b4_100%)]"
      >
        <div className="absolute top-[12%] left-[9%] h-[84%] w-[78%] -rotate-[5deg] rounded-md bg-[#fffdf7] shadow-[0_10px_24px_rgba(60,60,30,0.22)] transition-transform duration-700 group-hover/card:-rotate-[3deg]">
          <div className="absolute inset-y-3 left-2 flex flex-col justify-between">
            {Array.from({ length: 7 }).map((_, i) => (
              <span key={i} className="block h-1.5 w-4 rounded-full border-2 border-[#7c8594]" />
            ))}
          </div>
          <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,transparent_0,transparent_27px,#e6e2d6_28px)] [mask-image:linear-gradient(90deg,transparent_0,transparent_12%,#000_12%)]" />
          <p className="absolute top-[22%] left-[22%] -rotate-[4deg] font-hand text-[34px] leading-[1.15] text-[#2f3a4c] sm:text-[38px]">
            언제든지
            <br />
            문의하세요!
          </p>
          <svg viewBox="0 0 40 24" className="absolute right-[16%] bottom-[16%] w-10 text-[#2f3a4c]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 4v3M28 4v3M6 13c6 9 22 9 28 0" />
          </svg>
        </div>
        <svg viewBox="0 0 40 200" className="absolute -right-1 bottom-[-18%] h-[95%] rotate-[28deg]">
          <rect x="12" y="0" width="16" height="150" rx="4" fill="#26303f" />
          <rect x="12" y="20" width="16" height="6" fill="#c9a24e" />
          <path d="M12 150 L20 190 L28 150 Z" fill="#b9b4a6" />
          <path d="M18 178 L20 190 L22 178 Z" fill="#26303f" />
        </svg>
      </div>

      <ul className="flex-1 space-y-3 px-4 py-5 text-[15px] sm:px-6">
        {contact.phone ? (
          <li className="flex items-center gap-3">
            <Phone className="size-5 shrink-0 text-primary" aria-hidden />
            <span className="flex flex-wrap items-baseline gap-x-2">
              <a
                href={telHref(contact.phone)}
                className="text-lg font-bold whitespace-nowrap text-primary underline-offset-4 hover:underline"
              >
                {contact.phone}
              </a>
              {contact.phoneLabel ? (
                <span className="text-xs whitespace-nowrap text-muted-foreground">{contact.phoneLabel}</span>
              ) : null}
            </span>
          </li>
        ) : null}
        {contact.email ? (
          <li className="flex items-center gap-3">
            <Mail className="size-5 shrink-0 text-primary" aria-hidden />
            <a href={`mailto:${contact.email}`} className="font-medium text-foreground underline-offset-4 hover:underline">
              {contact.email}
            </a>
          </li>
        ) : null}
        <li className="flex items-center gap-3">
          <CalendarHeart className="size-5 shrink-0 text-primary" aria-hidden />
          <span className="text-foreground">공연 문의도 환영합니다!</span>
        </li>
      </ul>
      <div className="px-4 pb-4 sm:px-6">
        <Link
          href="/inquiry/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--club-navy)] py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[var(--club-navy-deep)]"
        >
          <MessageSquareText className="size-5" aria-hidden />
          문의하기
        </Link>
      </div>
    </CardShell>
  );
}

export function HomeCardsSection({ children }: { children: ReactNode[] }) {
  return (
    <section aria-label="바로가기" className="bg-[linear-gradient(180deg,#ffffff_0%,var(--club-beige)_100%)]">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 lg:px-8 lg:py-10">
        {children.map((child, i) => (
          <Reveal key={i} delay={i * 90} className={i === 2 ? "md:col-span-2 lg:col-span-1" : undefined}>
            {child}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
