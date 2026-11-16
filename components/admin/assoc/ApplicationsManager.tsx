"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteApplication, setApplicationStatus } from "@/app/admin/(protected)/tournaments/actions";
import type { SiteTournamentApplication } from "@/types/site";

const LABEL = { PENDING: "대기", APPROVED: "승인", REJECTED: "반려" } as const;
const VARIANT = { PENDING: "outline", APPROVED: "default", REJECTED: "secondary" } as const;

export function ApplicationsManager({
  siteId,
  tournamentId,
  applications,
}: {
  siteId: string;
  tournamentId: string;
  applications: SiteTournamentApplication[];
}) {
  const [filter, setFilter] = useState<"ALL" | keyof typeof LABEL>("ALL");
  const [pending, start] = useTransition();
  const list = filter === "ALL" ? applications : applications.filter((a) => a.status === filter);

  function change(a: SiteTournamentApplication, status: keyof typeof LABEL) {
    const memo = status === "REJECTED" ? (window.prompt("반려 사유 메모 (관리자만 봄, 선택)", a.admin_memo ?? "") ?? undefined) : (a.admin_memo ?? undefined);
    start(async () => {
      const r = await setApplicationStatus(a.id, tournamentId, siteId, status, memo);
      if (r.ok) toast.success(`${a.team_name}: ${LABEL[status]} 처리했습니다.`);
      else toast.error("처리하지 못했습니다.");
    });
  }

  function remove(a: SiteTournamentApplication) {
    if (!window.confirm(`${a.team_name} 신청을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    start(async () => {
      const r = await deleteApplication(a.id, tournamentId, siteId);
      if (r.ok) toast.success("삭제했습니다.");
      else toast.error("삭제하지 못했습니다.");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
          <Button key={f} type="button" size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)}>
            {f === "ALL" ? "전체" : LABEL[f]} ({f === "ALL" ? applications.length : applications.filter((a) => a.status === f).length})
          </Button>
        ))}
      </div>
      {list.length ? (
        <ul className="space-y-3">
          {list.map((a) => (
            <li key={a.id} className="rounded-md border border-border p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={VARIANT[a.status]}>{LABEL[a.status]}</Badge>
                <p className="font-bold">{a.team_name}</p>
                {a.affiliation ? <span className="text-sm text-muted-foreground">({a.affiliation})</span> : null}
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
                </span>
              </div>
              <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                <div>
                  <dt className="inline text-muted-foreground">대표자 </dt>
                  <dd className="inline font-medium">{a.leader_name}</dd>
                </div>
                <div>
                  <dt className="inline text-muted-foreground">연락처 </dt>
                  <dd className="inline font-medium">
                    <a href={`tel:${a.phone.replace(/[^\d+]/g, "")}`} className="underline">
                      {a.phone}
                    </a>
                  </dd>
                </div>
              </dl>
              {a.players.length ? (
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-muted-foreground">선수 명단 {a.players.length}명</summary>
                  <ol className="mt-1 list-decimal pl-6">
                    {a.players.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ol>
                </details>
              ) : null}
              {a.notes ? <p className="mt-2 rounded bg-muted p-2 text-sm whitespace-pre-line">{a.notes}</p> : null}
              {a.admin_memo ? <p className="mt-2 text-xs text-muted-foreground">메모: {a.admin_memo}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" size="sm" disabled={pending || a.status === "APPROVED"} onClick={() => change(a, "APPROVED")}>
                  승인
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={pending || a.status === "PENDING"} onClick={() => change(a, "PENDING")}>
                  대기로
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={pending || a.status === "REJECTED"} onClick={() => change(a, "REJECTED")}>
                  반려
                </Button>
                <Button type="button" size="sm" variant="ghost" className="text-destructive" disabled={pending} onClick={() => remove(a)}>
                  삭제
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">신청 내역이 없습니다.</p>
      )}
    </div>
  );
}
