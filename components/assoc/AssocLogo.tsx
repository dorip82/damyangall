import { cn } from "@/lib/utils";

/** 협회 심볼: 농구공 + 담양 대나무 잎. 공식 로고가 등록되면(사이트 정보 logo_url) 그 이미지를 쓴다. */
export function AssocLogo({
  className,
  logoUrl,
  label,
}: {
  className?: string;
  logoUrl?: string | null;
  label?: string;
}) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt={label ?? ""} className={cn("object-contain", className)} />;
  }
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle cx="30" cy="34" r="24" fill="#F28C28" />
      <g fill="none" stroke="#10264F" strokeWidth="2.6" strokeLinecap="round">
        <circle cx="30" cy="34" r="24" />
        <path d="M6 34h48" />
        <path d="M30 10v48" />
        <path d="M13 17c8 6 8 28 0 34" />
        <path d="M47 17c-8 6-8 28 0 34" />
      </g>
      <path d="M44 14C47 5 55 2 62 3c-1 8-6 14-15 14z" fill="#10966B" />
      <path d="M45 16c4-5 9-9 15-12" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
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
