import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** 메인 페이지 섹션 공통 제목줄: 작은 영문 라벨 + 제목 + 설명 + (선택) 전체 보기 링크. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  href,
  linkLabel = "전체 보기",
  as: Tag = "h2",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  as?: "h2" | "h3";
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
        ) : null}
        <Tag
          id={id}
          className={
            Tag === "h2"
              ? "text-2xl font-extrabold tracking-tight text-foreground break-keep sm:text-[2rem]"
              : "text-xl font-bold tracking-tight text-foreground break-keep"
          }
        >
          {title}
        </Tag>
        {description ? (
          <p className="mt-2 text-[15px] text-muted-foreground break-keep">{description}</p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-muted"
        >
          {linkLabel}
          <span className="sr-only">: {title}</span>
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
