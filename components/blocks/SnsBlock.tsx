import { ExternalLink } from "lucide-react";
import type { SnsBlockProps } from "@/lib/blocks/types";

export function SnsBlock({ instagram, facebook, youtube }: SnsBlockProps) {
  const links = [
    { href: instagram, label: "Instagram" },
    { href: facebook, label: "Facebook" },
    { href: youtube, label: "YouTube" },
  ].filter((l): l is { href: string; label: string } => Boolean(l.href));

  if (!links.length) return null;

  return (
    <section className="mx-auto max-w-4xl px-6 pb-16">
      <div className="flex justify-center gap-3">
        {links.map(({ href, label }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-foreground/70 transition-colors hover:border-accent hover:text-accent"
          >
            {label}
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        ))}
      </div>
    </section>
  );
}
