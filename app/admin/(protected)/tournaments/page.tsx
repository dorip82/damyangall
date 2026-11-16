import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAssocAdmin } from "@/lib/assoc/admin";
import { createClient } from "@/lib/supabase/server";
import { TOURNAMENT_STATUS_LABEL } from "@/lib/assoc/config";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export default async function AdminTournamentsPage() {
  const { site } = await requireAssocAdmin();
  const supabase = await createClient();
  const [{ data: tournaments }, { data: apps }] = await Promise.all([
    supabase.from("site_tournaments").select("*").eq("site_id", site.id).order("start_date", { ascending: false, nullsFirst: true }),
    supabase.from("site_tournament_applications").select("tournament_id, status").eq("site_id", site.id),
  ]);

  const count = (id: string, status?: string) => (apps ?? []).filter((a) => a.tournament_id === id && (!status || a.status === status)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">대회 · 참가신청</h1>
          <p className="mt-1 text-sm text-muted-foreground">대회를 등록하고, 참가 신청 승인과 경기 일정·대진·결과를 관리합니다.</p>
        </div>
        <Link href="/admin/tournaments/new" className={buttonVariants()}>
          <Plus className="size-4" /> 대회 등록
        </Link>
      </div>
      {tournaments?.length ? (
        <ul className="divide-y divide-border rounded-md border border-border">
          {tournaments.map((t) => (
            <li key={t.id}>
              <Link href={`/admin/tournaments/${t.id}`} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-muted">
                <span className="font-medium">{t.title}</span>
                <Badge variant="secondary">{TOURNAMENT_STATUS_LABEL[t.status]}</Badge>
                {!t.is_published ? <Badge variant="outline">비공개</Badge> : null}
                <span className="ml-auto text-sm text-muted-foreground">
                  {t.start_date ?? "일정 미정"} · 신청 {count(t.id)}건
                  {count(t.id, "PENDING") ? <strong className="ml-1 text-destructive">(대기 {count(t.id, "PENDING")})</strong> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          등록된 대회가 없습니다. &quot;대회 등록&quot;으로 첫 대회를 만들어 보세요.
        </p>
      )}
    </div>
  );
}
