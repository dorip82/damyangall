import { cn } from "@/lib/utils";

/**
 * 협회 CI. 관리자가 사이트 정보에 로고를 따로 올리면(logo_url) 그 이미지를 쓰고,
 * 아니면 기본 CI(public/images/assoc/dba-ci.png)를 쓴다. 어두운 배경에는 tone="light".
 */
export function AssocLogo({
  className,
  logoUrl,
  label,
  tone = "dark",
}: {
  className?: string;
  logoUrl?: string | null;
  label?: string;
  tone?: "dark" | "light";
}) {
  const src = logoUrl || (tone === "light" ? "/images/assoc/dba-ci-white.png" : "/images/assoc/dba-ci.png");
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={label ?? ""} width={300} height={362} className={cn("object-contain", className)} />;
}

/** 농구 코트 라인 장식 (배경용) */
export function CourtLines({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 320"
      className={className}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="2" y="2" width="596" height="316" rx="4" />
      <path d="M300 2v316" />
      <circle cx="300" cy="160" r="54" />
      <rect x="2" y="100" width="118" height="120" />
      <rect x="480" y="100" width="118" height="120" />
      <path d="M2 24c150 0 230 60 230 136S152 296 2 296" />
      <path d="M598 24c-150 0-230 60-230 136s80 136 230 136" />
    </svg>
  );
}
