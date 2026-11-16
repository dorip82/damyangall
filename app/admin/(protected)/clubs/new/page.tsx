import { requireAssocAdmin } from "@/lib/assoc/admin";
import { ClubForm } from "@/components/admin/assoc/ClubForm";
import { createClub } from "@/app/admin/(protected)/clubs/actions";

export default async function AdminNewClubPage() {
  const { site } = await requireAssocAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">동호회 등록</h1>
      <ClubForm siteId={site.id} action={createClub} submitLabel="등록" />
    </div>
  );
}
