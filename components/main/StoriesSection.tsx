import Link from "next/link";
import { ArrowRight, CalendarDays, MessageCircle, Newspaper, Store } from "lucide-react";
import { SectionHeading } from "@/components/main/SectionHeading";

/**
 * "담양의 다양한 이야기" — 포털의 네 영역을 이미지 카드로 안내한다.
 * 사진은 public/images 의 담양 풍경을 재사용하며, 장식용이 아니라 영역의 분위기를
 * 전하므로 사진 내용을 묘사하는 alt를 둔다. 사진이 안 떠도 아이콘·제목·설명으로
 * 내용을 알 수 있다.
 */
const STORIES = [
  {
    href: "/news",
    title: "담양소식",
    description: "지역 언론과 군민 제보로 모은 담양의 최신 소식과 생활정보",
    image: "/images/hero-5.webp",
    alt: "냇가를 따라 나무가 늘어선 담양의 산책길",
    Icon: Newspaper,
  },
  {
    href: "/community",
    title: "커뮤니티",
    description: "맛집 추천부터 구인구직, 중고거래까지 이웃과 나누는 이야기",
    image: "/images/hero-1.webp",
    alt: "돌담과 나무 사이의 전통 정자",
    Icon: MessageCircle,
  },
  {
    href: "/directory",
    title: "지역정보",
    description: "카페, 음식점, 펜션 등 담양의 업체와 생활 편의 정보",
    image: "/images/hero-7.webp",
    alt: "초록빛 나무가 터널처럼 이어진 가로수 길",
    Icon: Store,
  },
  {
    href: "/events",
    title: "행사",
    description: "담양에서 열리는 축제, 공연, 전시와 지역 행사 일정",
    image: "/images/hero-6.webp",
    alt: "운무가 걸린 가을 산과 누각",
    Icon: CalendarDays,
  },
] as const;

export function StoriesSection() {
  return (
    <section aria-labelledby="stories-title" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
      <SectionHeading
        id="stories-title"
        eyebrow="Stories"
        title="담양의 다양한 이야기"
        description="소식부터 이웃과의 대화, 생활 정보와 행사까지 한곳에서 만나보세요."
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {STORIES.map(({ href, title, description, image, alt, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_2px_10px_rgba(27,42,34,0.05)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(27,42,34,0.12)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt={alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute top-3 left-3 flex size-10 items-center justify-center rounded-xl bg-card/95 text-primary shadow-sm">
                  <Icon className="size-5" aria-hidden />
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-bold text-foreground">{title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground break-keep">
                  {description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  자세히 보기
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
