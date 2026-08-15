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
      <section className="bg-forest px-6 py-16 text-ivory sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          {title ? (
            <h2 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h2>
          ) : null}
          <Paragraphs
            content={content}
            className="whitespace-pre-line text-base leading-relaxed text-ivory/90 sm:text-lg"
          />
        </div>
      </section>
    );
  }

  if (variant === "lead") {
    return (
      <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-20">
        {title ? (
          <h2 className="mb-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h2>
        ) : null}
        <Paragraphs
          content={content}
          className="whitespace-pre-line text-base leading-relaxed text-foreground/70 sm:text-lg"
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      {title ? (
        <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">
          {title}
        </h2>
      ) : null}
      <Paragraphs
        content={content}
        className="whitespace-pre-line text-base leading-relaxed text-foreground/80"
      />
    </section>
  );
}
