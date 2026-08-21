import { BannerAdForm } from "@/components/admin/BannerAdForm";
import { createBannerAd } from "@/app/directory/admin/(protected)/ads/actions";

export default function NewBannerAdPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">새 광고 배너 등록</h1>
      <BannerAdForm action={createBannerAd} submitLabel="등록" />
    </div>
  );
}
