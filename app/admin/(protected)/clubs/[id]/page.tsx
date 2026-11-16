import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAssocAdmin } from "@/lib/assoc/admin";
import { createClient } from "@/lib/supabase/server";
import { ClubForm } from "@/components/admin/assoc/ClubForm";
import { DeleteButton } from "@/components/admin/assoc/DeleteButton";
import { deleteClub, updateClub } from "@/app/admin/(protected)/clubs/actions";

export default async function AdminClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { site } = await requireAssocAdmin();
  const supabase = await createClient();
  const { data: club } = await supabase.from("site_clubs").select("*").eq("id", id).eq("site_id", site.id).maybeSingle();
  if (!club) notFound();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/clubs" className="text-sm text-muted-foreground hover:underline">
            ← 동호회 목록
          </Link>
          <h1 className="mt-1 text-xl font-bold text-foreground">{club.name}</h1>
        </div>
        <DeleteButton confirmText={`"${club.name}" 동호회를 삭제할까요?`} action={deleteClub.bind(null, club.id, site.id)} />
      </div>
      <ClubForm siteId={site.id} club={club} action={updateClub.bind(null, club.id)} submitLabel="저장" />
    </div>
  );
}
