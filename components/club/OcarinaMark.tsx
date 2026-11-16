import { cn } from "@/lib/utils";

/**
 * 오카리나를 형상화한 심볼 (장식용 — 옆의 동아리 이름 글자가 이름 역할).
 * `tone="light"`는 어두운 배경(푸터)용.
 */
export function OcarinaMark({
  className,
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const body = tone === "dark" ? "#1e355c" : "#ffffff";
  const hole = tone === "dark" ? "#ffffff" : "#1e355c";
  return (
    <svg viewBox="0 0 64 48" aria-hidden className={cn("h-12 w-16", className)}>
      {/* leaves */}
      <path d="M45 13c-1-6 3-11 9-12-1 6-4 10-9 12z" fill="#5b8e36" />
      <path d="M47 14c4-4 10-4 14-1-4 3-9 4-14 1z" fill="#7aab4f" />
      {/* body */}
      <path
        d="M5 34c-3-6 2-13 10-16 9-3 20-4 28-8 3-1.5 6 0 6 3 0 3-2 4-1 7 2 6-3 13-14 17-11 4-25 5-29-3z"
        fill={body}
      />
      {/* mouthpiece */}
      <path d="M43 10c2-3 6-4 8-2 1 2-1 4-4 5z" fill={body} />
      {/* finger holes */}
      <g fill={hole}>
        <circle cx="13" cy="31" r="2.2" />
        <circle cx="20" cy="27" r="2" />
        <circle cx="27" cy="24.5" r="2" />
        <circle cx="34" cy="21.5" r="1.8" />
        <circle cx="24" cy="33" r="1.5" />
        <circle cx="31" cy="30.5" r="1.4" />
        <circle cx="40" cy="18" r="1.3" />
      </g>
    </svg>
  );
}
