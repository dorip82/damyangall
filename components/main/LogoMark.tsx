import { cn } from "@/lib/utils";

/** 대나무 줄기와 마디를 단순화한 올담 마크 (장식용 — 옆의 "올담" 글자가 이름 역할을 한다). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M9 3v18M15 5v16" />
        <path d="M7.5 8h3M7.5 14h3M13.5 10h3M13.5 16h3" />
        <path d="M15 7c1.5-1.8 3.5-2.6 5-2.5M9 11C7.5 9.4 5.6 8.8 4 9" />
      </svg>
    </span>
  );
}
