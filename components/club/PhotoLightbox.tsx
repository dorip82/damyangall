"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LightboxPhoto {
  url: string;
  caption?: string;
}

/**
 * 사진 썸네일 그리드 + 클릭하면 크게 보는 라이트박스.
 * 네이티브 <dialog>를 써서 포커스 가두기·Esc 닫기를 브라우저에 맡긴다.
 * 좌우 방향키로 이전/다음 사진.
 */
export function PhotoLightbox({
  photos,
  className,
  thumbClassName,
  limit,
}: {
  photos: LightboxPhoto[];
  className?: string;
  thumbClassName?: string;
  /** 썸네일을 몇 장까지 보여줄지 (라이트박스에서는 전체를 넘겨볼 수 있다) */
  limit?: number;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [current, setCurrent] = useState(0);
  const count = photos.length;

  const open = (i: number) => {
    setCurrent(i);
    dialogRef.current?.showModal();
  };
  const step = useCallback(
    (d: number) => setCurrent((c) => (((c + d) % count) + count) % count),
    [count]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    dialog.addEventListener("keydown", onKey);
    return () => dialog.removeEventListener("keydown", onKey);
  }, [step]);

  if (!count) return null;
  const shown = limit ? photos.slice(0, limit) : photos;
  const photo = photos[current];

  return (
    <>
      <ul className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4", className)}>
        {shown.map((p, i) => (
          <li key={p.url + i}>
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={`사진 크게 보기${p.caption ? `: ${p.caption}` : ` ${i + 1}`}`}
              className={cn(
                "group block aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted",
                thumbClassName
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.caption ?? ""}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label="사진 크게 보기"
        className="m-auto h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/85"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="on-dark flex h-full w-full flex-col items-center justify-center p-4 sm:p-10" onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.url}
            alt={photo.caption ?? ""}
            className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
          />
          <p className="mt-4 text-center text-sm text-white/90">
            {photo.caption ? `${photo.caption} · ` : ""}
            {current + 1} / {count}
          </p>
        </div>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="닫기"
          className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
        >
          <X className="size-6" aria-hidden />
        </button>
        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="이전 사진"
              className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
            >
              <ChevronLeft className="size-6" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="다음 사진"
              className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
            >
              <ChevronRight className="size-6" aria-hidden />
            </button>
          </>
        ) : null}
      </dialog>
    </>
  );
}
