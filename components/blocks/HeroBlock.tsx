import type { HeroBlockProps } from "@/lib/blocks/types";

export function HeroBlock({
  title,
  subtitle,
  image,
  overlay = 0.35,
  showText = true,
}: HeroBlockProps) {
  // Poster mode: `image` already has the title/subtitle designed into it,
  // so it's shown uncropped instead of cover-cropped, with no dark scrim.
  if (!showText && image) {
    return (
      <section className="flex items-center justify-center bg-ivory px-4 py-10 sm:py-16">
        <h1 className="sr-only">{title}</h1>
        {subtitle ? <p className="sr-only">{subtitle}</p> : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          className="animate-slide-up mx-auto w-full max-w-4xl"
        />
      </section>
    );
  }

  return (
    <section className="relative flex h-[60vh] min-h-[420px] items-center justify-center overflow-hidden bg-deep-forest text-ivory">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="animate-slow-zoom absolute inset-0 h-full w-full object-cover motion-reduce:animate-none"
        />
      ) : null}
      <div
        className="absolute inset-0 bg-deep-forest"
        style={{ opacity: overlay }}
        aria-hidden
      />
      <div className="animate-fade-in relative z-10 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-4 text-base tracking-[0.2em] text-wood uppercase sm:text-lg">
            {subtitle}
          </p>
        ) : null}
      </div>
    </section>
  );
}
