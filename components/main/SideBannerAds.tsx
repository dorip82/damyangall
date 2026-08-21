import { createClient } from "@/lib/supabase/server";
import { isSafeHttpUrl } from "@/lib/utils/safe-url";
import type { BannerAdRow } from "@/types/banner-ad";

/**
 * Skyscraper-style ad rails in the empty side margins of the centered
 * max-w-6xl layout. Only shown once the viewport is wide enough to fit
 * content (1152px) + both 160px rails + breathing room without overlap —
 * below that they'd collide with the centered content, so they're hidden
 * until the 2xl breakpoint (1536px) rather than reflowing anything.
 */
export async function SideBannerAds() {
  const supabase = await createClient();
  const { data: banners } = await supabase
    .from("banner_ads")
    .select("id, position, title, image_url, link_url")
    .eq("status", "PUBLISHED")
    .order("sort_order", { ascending: true });

  if (!banners?.length) return null;

  const left = banners.filter((b) => b.position === "LEFT");
  const right = banners.filter((b) => b.position === "RIGHT");

  return (
    <>
      <BannerRail side="left" banners={left} />
      <BannerRail side="right" banners={right} />
    </>
  );
}

function BannerRail({
  side,
  banners,
}: {
  side: "left" | "right";
  banners: Pick<BannerAdRow, "id" | "title" | "image_url" | "link_url">[];
}) {
  if (!banners.length) return null;

  return (
    <aside
      className={`fixed top-24 z-10 hidden max-h-[calc(100vh-7rem)] w-40 flex-col gap-4 overflow-y-auto 2xl:flex ${
        side === "left" ? "left-4" : "right-4"
      }`}
    >
      {banners.map((banner) => (
        <div key={banner.id} className="relative">
          <span className="absolute top-1.5 left-1.5 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            AD
          </span>
          {isSafeHttpUrl(banner.link_url) ? (
            <a href={banner.link_url} target="_blank" rel="noopener noreferrer sponsored">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full rounded-lg border border-border object-cover shadow-sm"
              />
            </a>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full rounded-lg border border-border object-cover shadow-sm"
            />
          )}
        </div>
      ))}
    </aside>
  );
}
