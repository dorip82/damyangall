import type { GalleryBlockProps } from "@/lib/blocks/types";

export function GalleryBlock({ title, images }: GalleryBlockProps) {
  if (!images?.length) return null;

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      {title ? (
        <h2 className="mb-8 text-2xl font-bold text-foreground sm:text-3xl">
          {title}
        </h2>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.url + i}
            src={img.url}
            alt={img.caption ?? ""}
            className="aspect-square w-full rounded-sm object-cover"
          />
        ))}
      </div>
    </section>
  );
}
