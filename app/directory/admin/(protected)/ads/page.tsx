import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { StatusToggleBadge } from "@/components/admin/StatusToggleBadge";
import { toggleBannerAdStatus } from "@/app/directory/admin/(protected)/ads/actions";

const POSITION_LABEL = { LEFT: "왼쪽", RIGHT: "오른쪽" } as const;

export default async function AdminBannerAdsPage() {
  const supabase = await createClient();
  const { data: banners } = await supabase
    .from("banner_ads")
    .select("id, position, title, image_url, sort_order, status")
    .order("position", { ascending: true })
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">광고 배너</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            메인 페이지 좌/우 여백에 노출되는 배너를 관리합니다.
          </p>
        </div>
        <Button render={<Link href="/directory/admin/ads/new" />}>
          <Plus className="size-4" /> 새 배너 등록
        </Button>
      </div>

      {!banners?.length ? (
        <p className="text-sm text-muted-foreground">등록된 배너가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {banners.map((banner) => (
            <li
              key={banner.id}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted"
            >
              <Link
                href={`/directory/admin/ads/${banner.id}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="h-12 w-8 shrink-0 overflow-hidden rounded border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{banner.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {POSITION_LABEL[banner.position]} · 순서 {banner.sort_order}
                  </p>
                </div>
              </Link>
              <StatusToggleBadge
                status={banner.status}
                onToggle={toggleBannerAdStatus.bind(null, banner.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
