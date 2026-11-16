import { OcarinaMark } from "@/components/club/OcarinaMark";
import { telHref, type ClubContact } from "@/lib/site/contact";

export function ClubFooter({
  name,
  tagline,
  englishName,
  slogan,
  region,
  contact,
}: {
  name: string;
  tagline?: string;
  englishName?: string;
  slogan?: string;
  region?: string;
  contact: ClubContact;
}) {
  const location = contact.address ?? (region ? `${region} 소재` : null);
  const year = new Date().getFullYear();

  return (
    <footer className="on-dark relative mt-auto overflow-hidden bg-[var(--club-navy)] text-white">
      {/* 은은한 오선지·음표 장식 */}
      <svg
        aria-hidden
        viewBox="0 0 420 140"
        className="pointer-events-none absolute right-0 bottom-0 h-36 w-[420px] text-white/[0.12]"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        {[0, 8, 16, 24, 32].map((y) => (
          <path key={y} d={`M0 ${90 + y}C110 ${60 + y} 230 ${120 + y} 420 ${70 + y}`} />
        ))}
        <g fill="currentColor" stroke="none">
          <ellipse cx="300" cy="78" rx="7" ry="5" />
          <rect x="305" y="40" width="2" height="38" />
          <ellipse cx="360" cy="64" rx="7" ry="5" />
          <rect x="365" y="26" width="2" height="38" />
          <path d="M307 40c8 2 12 8 10 16-2-6-6-9-10-10z" />
        </g>
      </svg>

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-10 lg:px-8 lg:py-12">
        <div className="flex items-center gap-3 md:border-r md:border-white/20 md:pr-10">
          <OcarinaMark tone="light" className="h-11 w-14" />
          <div className="leading-tight">
            <p className="font-brush text-3xl">{name}</p>
            {tagline ? <p className="mt-0.5 text-sm text-white/85">{tagline}</p> : null}
            {englishName ? <p className="text-xs text-white/70">{englishName}</p> : null}
          </div>
        </div>

        <div className="space-y-1.5 text-sm text-white/85">
          <p className="flex flex-wrap gap-x-3 gap-y-1">
            {location ? <span>{location}</span> : null}
            {contact.phone ? (
              <>
                {location ? <span aria-hidden className="text-white/35">|</span> : null}
                <span>
                  {contact.phoneLabel ?? "대표전화"}{" "}
                  <a href={telHref(contact.phone)} className="font-semibold text-white underline-offset-4 hover:underline">
                    {contact.phone}
                  </a>
                </span>
              </>
            ) : null}
            {contact.email ? (
              <>
                <span aria-hidden className="text-white/35">|</span>
                <span>
                  이메일{" "}
                  <a href={`mailto:${contact.email}`} className="text-white underline-offset-4 hover:underline">
                    {contact.email}
                  </a>
                </span>
              </>
            ) : null}
          </p>
          <p className="text-white/70">
            Copyright © {year} {name}. All rights reserved.
          </p>
        </div>

        {slogan ? (
          <p className="font-hand text-3xl text-white md:pr-24 lg:text-4xl">{slogan}</p>
        ) : null}
      </div>
    </footer>
  );
}
