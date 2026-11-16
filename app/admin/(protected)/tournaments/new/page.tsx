import { requireAssocAdmin } from "@/lib/assoc/admin";
import { TournamentForm } from "@/components/admin/assoc/TournamentForm";
import { createTournament } from "@/app/admin/(protected)/tournaments/actions";

export default async function AdminNewTournamentPage() {
  const { site } = await requireAssocAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">대회 등록</h1>
      <TournamentForm siteId={site.id} action={createTournament} submitLabel="등록" />
    </div>
  );
}
