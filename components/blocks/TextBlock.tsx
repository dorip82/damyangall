import type { TextBlockProps } from "@/lib/blocks/types";

function Paragraphs({ content, className }: { content: string; className: string }) {
  const paragraphs = content.split(/\n{2,}/);
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, i) => (
        <p key={i} className={className}>
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function TextBlock({ title, content, variant = "default" }: TextBlockProps) {
  if (variant === "quote") {
    return (
      <section className="on-dark bg-[var(--club-navy)] px-6 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          {title ? (
            <h2 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h2>
          ) : null}
          <Paragraphs
            content={content}
            className="whitespace-pre-line text-base leading-relaxed text-white/90 sm:text-lg"
          />
        </div>
      </section>
    );
  }

  if (variant === "lead") {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
        {title ? (
          <h2 className="mb-5 font-hand text-4xl text-primary sm:text-5xl">
            {title}
          </h2>
        ) : null}
        <Paragraphs
          content={content}
          className="whitespace-pre-line text-base leading-[1.85] text-foreground/75 break-keep sm:text-lg"
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      {title ? (
        <h2 className="mb-6 flex items-center gap-3 text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
          <span aria-hidden className="h-7 w-1.5 rounded-full bg-[var(--club-green)]" />
          {title}
        </h2>
      ) : null}
      <Paragraphs
        content={content}
        className="whitespace-pre-line text-base leading-[1.85] text-foreground/80 break-keep"
      />
    </section>
  );
}
