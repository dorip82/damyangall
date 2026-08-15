import type { MapBlockProps } from "@/lib/blocks/types";

export function MapBlock({ latitude, longitude, address, note }: MapBlockProps) {
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
  const hasCoords = latitude != null && longitude != null;

  if (!kakaoKey || !hasCoords) {
    return (
      <section className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex h-64 flex-col items-center justify-center gap-2 border border-dashed border-border bg-muted text-center">
          <p className="text-sm text-muted-foreground">
            {note ?? "지도가 준비되면 표시됩니다."}
          </p>
          {address ? (
            <p className="text-sm text-foreground/70">{address}</p>
          ) : null}
        </div>
      </section>
    );
  }

  // Kakao Maps SDK integration point — wired up once NEXT_PUBLIC_KAKAO_MAP_KEY
  // and a real address/lat-lng are supplied.
  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <div
        id="kakao-map"
        className="h-64 w-full border border-border bg-muted"
        data-lat={latitude}
        data-lng={longitude}
      />
      {address ? (
        <p className="mt-3 text-sm text-foreground/70">{address}</p>
      ) : null}
    </section>
  );
}
