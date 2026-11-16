import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ClipboardList,
  FolderOpen,
  Megaphone,
  MessagesSquare,
  Trophy,
  Users,
  MapPin,
  PlayCircle,
} from "lucide-react";
import {
  applicationState,
  formatDate,
  formatPeriod,
  getAssocContext,
  loadPageBlocks,
  loadPosts,
  loadTournaments,
  todayKST,
} from "@/lib/assoc/data";
import { TOURNAMENT_STATUS_LABEL, type AssocSlide } from "@/lib/assoc/config";
import { AssocHero } from "@/components/assoc/AssocHero";
import { CategoryBadge, EmptyState, SectionTitle, StatusBadge } from "@/components/assoc/ui";
import { PhotoLightbox } from "@/components/club/PhotoLightbox";
import { getYouTubeThumbnail } from "@/lib/utils/youtube";

export default async function AssocHomePage() {
  const { site, extra, config } = await getAssocContext();

  const [homeBlocks, notices, tournaments, galleryPosts] = await Promise.all([
    loadPageBlocks(site.id, "home"),
    loadPosts(site.id, { categories: ["공지사항", "협회 소식", "보도자료"], limit: 5 }),
    loadTournaments(site.id),
    loadPosts(site.id, { limit: 30 }),
  ]);

  // 관리자가 "메인 (슬라이드 배너)" 페이지에 슬라이드를 등록했으면 그것을, 아니면 기본 슬라이드
  const sliderBlock = homeBlocks.find((b) => b.type === "slider");
  const adminSlides: AssocSlide[] =
    sliderBlock?.type === "slider"
      ? sliderBlock.props.slides
          .filter((s) => s.image)
          .map((s) => ({
            image: s.image,
            alt: s.alt ?? "",
            eyebrow: s.eyebrow,
            title: s.title ?? site.name,
            subtitle: s.subtitle,
            buttonLabel: s.buttonLabel,
            buttonHref: s.buttonHref,
          }))
      : [];
  const slides = adminSlides.length ? adminSlides : config.defaultSlides;

  const today = todayKST();
  const upcoming = tournaments
    .filter((t) => t.status !== "FINISHED" && (!t.end_date || t.end_date >= today))
    .sort((a, b) => (a.start_date ?? "9999").localeCompare(b.start_date ?? "9999"))
    .slice(0, 4);

  const photos = galleryPosts.flatMap((p) => p.photos.map((ph) => ({ ...ph, caption: ph.caption ?? p.title }))).slice(0, 6);
  const latestVideo = galleryPosts.find((p) => p.youtubeId);

  const quickLinks = [
    { label: "협회소개", href: "/about", Icon: Building2, desc: "인사말 · 임원 · 연혁" },
    { label: "대회일정", href: "/tournament/schedule", Icon: CalendarDays, desc: "예정 대회와 경기 일정" },
    { label: "생활농구", href: "/life", Icon: Users, desc: "동호회 · 회원 모집" },
    { label: "활동소식", href: "/news", Icon: Megaphone, desc: "공지 · 소식 · 갤러리" },
    { label: "자료실", href: "/archive", Icon: FolderOpen, desc: "규정 · 신청서 · 서식" },
    { label: "문의하기", href: "/contact", Icon: MessagesSquare, desc: "협회에 문의 남기기" },
  ];

  const promos =
    extra.promos?.filter((p) => p.title && p.href).slice(0, 3) ?? [
      { title: "생활농구 참여 안내", description: "누구나 가까운 코트에서 함께하는 농구", href: "/life" },
      { title: "대회 참가 신청", description: "접수 중인 대회에 온라인으로 신청하세요", href: "/tournament/apply" },
      { title: "농구 동호회 가입 안내", description: "지역 동호회를 찾고 가입을 문의하세요", href: "/life/clubs" },
    ];
  const promoTones = [
    "from-[var(--dba-blue)] to-[var(--dba-navy)]",
    "from-[#f59a3c] to-[#d9700f]",
    "from-[var(--dba-green)] to-[#0b6b4c]",
  ];
  const promoIcons = [Users, ClipboardList, Trophy];

  return (
    <>
      <AssocHero slides={slides} />

      {/* 주요 바로가기 */}
      <section aria-labelledby="quick-title" className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="quick-title" className="sr-only">
          주요 바로가기
        </h2>
        <ul className="grid grid-cols-3 overflow-hidden rounded-2xl border border-border bg-white shadow-[0_18px_40px_rgba(16,38,79,0.12)] md:grid-cols-6">
          {quickLinks.map(({ label, href, Icon, desc }, i) => (
            <li
              key={href}
              className={[
                "border-border",
                i % 3 !== 2 ? "border-r" : "md:border-r",
                i < 3 ? "border-b md:border-b-0" : "",
                i === 5 ? "md:border-r-0" : "",
              ].join(" ")}
            >
              <Link
                href={href}
                className="group flex h-full flex-col items-center gap-2 px-2 py-5 text-center transition-colors hover:bg-[var(--dba-soft)] sm:py-7"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-[var(--dba-soft)] text-[var(--dba-blue)] transition-colors group-hover:bg-[var(--dba-navy)] group-hover:text-white sm:size-14">
                  <Icon className="size-6 sm:size-7" aria-hidden />
                </span>
                <span className="text-[15px] font-extrabold text-primary sm:text-base">{label}</span>
                <span className="hidden text-xs text-muted-foreground lg:block">{desc}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 메인 콘텐츠 4영역 */}
      <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-12 px-4 py-14 sm:px-6 md:grid-cols-2 lg:px-8 xl:grid-cols-4">
        {/* 공지사항 */}
        <section aria-labelledby="home-notice">
          <SectionTitle id="home-notice" title="공지사항" moreHref="/news/notice" />
          {notices.length ? (
            <ul className="divide-y divide-border rounded-2xl border border-border bg-white">
              {notices.map((n) => (
                <li key={n.id}>
                  <Link href={`/news/${n.id}`} className="group flex flex-col gap-1.5 px-4 py-3.5 hover:bg-[var(--dba-soft)]">
                    <span className="flex items-center gap-2">
                      <CategoryBadge>{n.category ?? "공지"}</CategoryBadge>
                      <time className="ml-auto text-xs text-muted-foreground tabular-nums">{formatDate(n.published_at)}</time>
                    </span>
                    <span className="line-clamp-1 text-[15px] font-semibold text-foreground group-hover:text-[var(--dba-blue)]">
                      {n.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState className="py-10" title="등록된 공지가 없습니다" description="새 공지가 등록되면 이곳에 표시됩니다." />
          )}
        </section>

        {/* 대회 일정 */}
        <section aria-labelledby="home-tournament">
          <SectionTitle id="home-tournament" title="대회 일정" moreHref="/tournament/schedule" />
          {upcoming.length ? (
            <ul className="space-y-3">
              {upcoming.map((t) => {
                const st = applicationState(t);
                const label =
                  t.status === "OPEN"
                    ? st === "OPEN"
                      ? "접수중"
                      : st === "BEFORE"
                        ? "접수예정"
                        : "접수마감"
                    : TOURNAMENT_STATUS_LABEL[t.status];
                return (
                  <li key={t.id}>
                    <Link
                      href={`/tournament/${t.id}`}
                      className="group block rounded-2xl border border-border bg-white p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 font-bold text-foreground group-hover:text-[var(--dba-blue)]">{t.title}</p>
                        <StatusBadge tone={t.status === "OPEN" ? st : t.status}>{label}</StatusBadge>
                      </div>
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="size-4 shrink-0" aria-hidden />
                        {formatPeriod(t.start_date, t.end_date)}
                      </p>
                      {t.venue ? (
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-4 shrink-0" aria-hidden />
                          <span className="line-clamp-1">{t.venue}</span>
                        </p>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState className="py-10" title="예정된 대회가 없습니다" description="대회가 확정되면 일정과 접수 안내를 알려드립니다." />
          )}
        </section>

        {/* 갤러리 */}
        <section aria-labelledby="home-gallery">
          <SectionTitle id="home-gallery" title="갤러리" moreHref="/news/gallery" />
          {photos.length ? (
            <PhotoLightbox photos={photos} className="grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-2" limit={4} />
          ) : latestVideo?.youtubeId ? (
            <Link href={`/news/${latestVideo.id}`} className="group relative block overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getYouTubeThumbnail(latestVideo.youtubeId)} alt="" className="aspect-video w-full object-cover" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                <PlayCircle className="size-14 text-white" aria-hidden />
              </span>
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-3 text-sm font-semibold text-white">
                {latestVideo.title}
              </span>
            </Link>
          ) : (
            <EmptyState className="py-10" title="등록된 사진이 없습니다" description="경기와 행사 사진이 등록되면 이곳에 표시됩니다." />
          )}
        </section>

        {/* 홍보 배너 */}
        <section aria-labelledby="home-promo">
          <SectionTitle id="home-promo" title="참여 안내" />
          <ul className="space-y-3">
            {promos.map((p, i) => {
              const Icon = promoIcons[i % promoIcons.length];
              return (
                <li key={p.href + i}>
                  <Link
                    href={p.href}
                    className={`group on-dark relative flex min-h-[104px] items-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-sm transition-transform hover:-translate-y-0.5 ${promoTones[i % promoTones.length]}`}
                  >
                    {"image" in p && p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="absolute inset-0 -z-0 h-full w-full object-cover opacity-25" />
                    ) : null}
                    <span className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                      <Icon className="size-6" aria-hidden />
                    </span>
                    <span className="relative min-w-0">
                      <span className="block text-[17px] font-extrabold">{p.title}</span>
                      {p.description ? <span className="mt-0.5 block text-sm text-white/85">{p.description}</span> : null}
                    </span>
                    <ArrowRight className="relative ml-auto size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* 담양 + 농구 정체성 띠 */}
      <section className="on-dark relative isolate overflow-hidden bg-[var(--dba-navy)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero-1.webp" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25" loading="lazy" />
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <p className="text-sm font-bold tracking-[0.14em] text-[var(--dba-orange)]">{config.englishName}</p>
            <p className="mt-2 text-3xl font-black text-white sm:text-4xl">{config.slogan}</p>
            <p className="mt-3 text-white/80">군민과 함께하는 농구, 스포츠로 빛나는 담양</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/tournament/apply"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--dba-orange)] px-6 font-extrabold text-[var(--dba-navy)] hover:brightness-105"
            >
              대회 참가 신청
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-full px-6 font-bold text-white ring-1 ring-white/50 hover:bg-white/10"
            >
              문의하기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
