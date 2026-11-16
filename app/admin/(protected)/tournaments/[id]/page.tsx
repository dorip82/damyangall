import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireAssocAdmin } from "@/lib/assoc/admin";
import { createClient } from "@/lib/supabase/server";
import { TournamentForm } from "@/components/admin/assoc/TournamentForm";
import { ApplicationsManager } from "@/components/admin/assoc/ApplicationsManager";
import { MatchesManager } from "@/components/admin/assoc/MatchesManager";
import { DeleteButton } from "@/components/admin/assoc/DeleteButton";
import { deleteTournament, updateTournament } from "@/app/admin/(protected)/tournaments/actions";

export default async function AdminTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { site, role } = await requireAssocAdmin();
  const supabase = await createClient();
  const { data: t } = await supabase.from("site_tournaments").select("*").eq("id", id).eq("site_id", site.id).maybeSingle();
  if (!t) notFound();
  const [{ data: apps }, { data: matches }] = await Promise.all([
    supabase.from("site_tournament_applications").select("*").eq("tournament_id", id).order("created_at"),
    supabase.from("site_tournament_matches").select("*").eq("tournament_id", id).order("sort_order").order("scheduled_at"),
  ]);
  const approved = (apps ?? []).filter((a) => a.status === "APPROVED").map((a) => a.team_name);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/tournaments" className="text-sm text-muted-foreground hover:underline">
            ← 대회 목록
          </Link>
          <h1 className="mt-1 text-xl font-bold text-foreground">{t.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {t.is_published ? (
            <Link href={`/tournament/${t.id}`} target="_blank" className="flex items-center gap-1 text-sm text-primary underline">
              홈페이지에서 보기 <ExternalLink className="size-3.5" />
            </Link>
          ) : null}
          {role === "SITE_ADMIN" ? (
            <DeleteButton
              label="대회 삭제"
              confirmText={`"${t.title}" 대회를 삭제할까요? 참가 신청과 경기 기록도 함께 삭제되며 되돌릴 수 없습니다.`}
              action={deleteTournament.bind(null, t.id, site.id)}
            />
          ) : null}
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">참가 신청 ({apps?.length ?? 0})</h2>
        <ApplicationsManager siteId={site.id} tournamentId={t.id} applications={apps ?? []} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">경기 일정 · 대진 · 결과</h2>
        <MatchesManager siteId={site.id} tournamentId={t.id} matches={matches ?? []} teamNames={approved} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">대회 정보</h2>
        <TournamentForm siteId={site.id} tournament={t} action={updateTournament.bind(null, t.id)} submitLabel="저장" />
      </section>
    </div>
  );
}
