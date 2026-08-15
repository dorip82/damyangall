import { getYouTubeEmbedUrl } from "@/lib/utils/youtube";

export function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-sm bg-deep-forest">
      <iframe
        src={getYouTubeEmbedUrl(videoId)}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
