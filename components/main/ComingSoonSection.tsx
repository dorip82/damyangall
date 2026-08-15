import { Newspaper, Users, MapPin, CalendarDays } from "lucide-react";

const UPCOMING = [
  {
    label: "담양소식",
    description: "담양의 최신 소식과 유용한 정보를 확인해보세요.",
    Icon: Newspaper,
  },
  {
    label: "커뮤니티",
    description: "소통하고 나누며 함께 만들어가는 공간입니다.",
    Icon: Users,
  },
  {
    label: "지역정보",
    description: "담양의 맛집, 생활 정보를 한눈에 살펴보세요.",
    Icon: MapPin,
  },
  {
    label: "행사",
    description: "담양에서 열리는 다양한 행사 소식을 만나보세요.",
    Icon: CalendarDays,
  },
];

export function ComingSoonSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
        담양의 다양한 이야기를 만나보세요
      </h2>
      <p className="mb-8 text-sm text-muted-foreground">
        아래 이야기들은 순차적으로 열릴 예정입니다.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {UPCOMING.map(({ label, description, Icon }) => (
          <div
            key={label}
            className="relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <span className="absolute top-4 right-4 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              준비중
            </span>
            <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Icon className="size-5" aria-hidden />
            </span>
            <p className="font-semibold text-card-foreground">{label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
