import type { ImageBlockProps } from "@/lib/blocks/types";

export function ImageBlock({ image, caption }: ImageBlockProps) {
  return (
    <figure className="mx-auto max-w-4xl px-6 py-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={caption ?? ""}
        className="w-full rounded-sm object-cover"
      />
      {caption ? (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
