"use client";

import { useState } from "react";
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from "@/lib/utils/youtube";
import { cn } from "@/lib/utils";

/**
 * 썸네일 + 재생 버튼만 먼저 보여주고, 누르면 그 자리에서 유튜브 플레이어를
 * 불러온다 (첫 화면에서 무거운 iframe 을 바로 띄우지 않기 위해).
 */
export function YouTubeFacade({
  videoId,
  title,
  className,
}: {
  videoId: string;
  title: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-xl bg-[var(--club-navy)]", className)}>
      {playing ? (
        <iframe
          src={`${getYouTubeEmbedUrl(videoId)}?autoplay=1&rel=0`}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 h-full w-full text-left"
          aria-label={`영상 재생: ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getYouTubeThumbnail(videoId)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span aria-hidden className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-3 pt-2.5 pb-8">
            <span className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className="flex h-4 w-6 shrink-0 items-center justify-center rounded-[4px] bg-[#ff0000]">
                <span className="ml-px border-y-[3.5px] border-l-[6px] border-y-transparent border-l-white" />
              </span>
              <span className="line-clamp-1">{title}</span>
            </span>
          </span>
          <span aria-hidden className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-[68px] items-center justify-center rounded-[14px] bg-[#ff0000] shadow-lg transition-transform duration-200 group-hover:scale-110">
              <span className="ml-1 border-y-[10px] border-l-[17px] border-y-transparent border-l-white" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
