import { PhotoLightbox } from "@/components/club/PhotoLightbox";
import type { GalleryBlockProps } from "@/lib/blocks/types";

/** 사진 썸네일 그리드 — 누르면 라이트박스로 크게 본다. */
export function GalleryBlock({ title, images }: GalleryBlockProps) {
  const photos = (images ?? []).filter((img) => img.url);
  if (!photos.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      {title ? (
        <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">{title}</h2>
      ) : null}
      <PhotoLightbox photos={photos} className="sm:grid-cols-3 lg:grid-cols-3" />
    </section>
  );
}
