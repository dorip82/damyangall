import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BannerAdForm } from "@/components/admin/BannerAdForm";
import { DeleteBannerAdButton } from "@/components/admin/DeleteBannerAdButton";
import { updateBannerAd } from "@/app/directory/admin/(protected)/ads/actions";
import type { BannerAdRow } from "@/types/banner-ad";

export default async function EditBannerAdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: banner } = await supabase
    .from("banner_ads")
    .select("*")
    .eq("id", id)
    .maybeSingle<BannerAdRow>();

  if (!banner) notFound();

  const boundUpdate = updateBannerAd.bind(null, banner.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">광고 배너 수정</h1>
        <DeleteBannerAdButton bannerId={banner.id} />
      </div>
      <BannerAdForm banner={banner} action={boundUpdate} submitLabel="저장" />
    </div>
  );
}
