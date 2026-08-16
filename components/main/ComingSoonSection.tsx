import Link from "next/link";
import { Newspaper, Users, MapPin, CalendarDays } from "lucide-react";

const ITEMS = [
  {
    label: "담양소식",
    description: "담양의 최신 소식과 유용한 정보를 확인해보세요.",
    Icon: Newspaper,
    href: null,
  },
  {
    label: "커뮤니티",
    description: "소통하고 나누며 함께 만들어가는 공간입니다.",
    Icon: Users,
    href: null,
  },
  {
    label: "지역정보",
    description: "담양의 카페, 음식점, 생활 정보를 카테고리별로 찾아보세요.",
    Icon: MapPin,
    href: "/directory",
  },
  {
    label: "행사",
    description: "담양에서 열리는 다양한 행사 소식을 만나보세요.",
    Icon: CalendarDays,
    href: null,
  },
];

export function ComingSoonSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
        담양의 다양한 이야기를 만나보세요
      </h2>
      <p className="mb-8 text-sm text-muted-foreground">
        하나씩 열리고 있어요.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ label, description, Icon, href }) => {
          const card = (
            <div
              className={
                href
                  ? "group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  : "relative flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
              }
            >
              {!href ? (
                <span className="absolute top-4 right-4 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  준비중
                </span>
              ) : null}
              <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Icon className="size-5" aria-hidden />
              </span>
              <p className="font-semibold text-card-foreground">{label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
          );
          return href ? (
            <Link key={label} href={href}>
              {card}
            </Link>
          ) : (
            <div key={label}>{card}</div>
          );
        })}
      </div>
    </section>
  );
}
