import type { TimelineBlockProps } from "@/lib/blocks/types";

/** 연혁 — 세로 타임라인. 색은 사이트 테마 토큰(primary/accent)을 따른다. */
export function TimelineSection({ title, items }: TimelineBlockProps) {
  const list = (items ?? []).filter((it) => it.date && it.title);
  if (!list.length) return null;
  return (
    <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {title ? <h2 className="mb-8 text-2xl font-extrabold text-primary">{title}</h2> : null}
      <ol className="relative border-l-2 border-border pl-8">
        {list.map((it, i) => (
          <li key={i} className="relative pb-9 last:pb-0">
            <span
              aria-hidden
              className="absolute top-1 -left-[41px] size-4 rounded-full border-4 border-background bg-accent ring-2 ring-accent/30"
            />
            <p className="text-sm font-extrabold tracking-wide text-accent">{it.date}</p>
            <p className="mt-1 text-lg font-bold text-foreground">{it.title}</p>
            {it.description ? (
              <p className="mt-1.5 text-[15px] leading-relaxed whitespace-pre-line text-muted-foreground">{it.description}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
