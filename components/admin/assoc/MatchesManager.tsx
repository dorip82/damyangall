"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMatch, saveMatch, type MatchInput } from "@/app/admin/(protected)/tournaments/actions";
import type { SiteTournamentMatch } from "@/types/site";

type Row = MatchInput & { id: string | null; key: string };

/** UTC ISO → 한국 시간 datetime-local 값 */
function toLocalInput(iso: string | null) {
  if (!iso) return null;
  const d = new Date(new Date(iso).getTime() + 9 * 3600 * 1000);
  return d.toISOString().slice(0, 16);
}

function fromMatch(m: SiteTournamentMatch): Row {
  return {
    id: m.id,
    key: m.id,
    round: m.round,
    matchNo: m.match_no,
    scheduledAt: toLocalInput(m.scheduled_at),
    court: m.court,
    teamA: m.team_a,
    teamB: m.team_b,
    scoreA: m.score_a,
    scoreB: m.score_b,
    status: m.status,
    note: m.note,
    sortOrder: m.sort_order,
  };
}

const cell = "h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm";
const num = (v: string) => (v === "" ? null : Math.max(0, Math.trunc(Number(v))));

export function MatchesManager({
  siteId,
  tournamentId,
  matches,
  teamNames,
}: {
  siteId: string;
  tournamentId: string;
  matches: SiteTournamentMatch[];
  teamNames: string[];
}) {
  const [rows, setRows] = useState<Row[]>(matches.map(fromMatch));
  const [pending, start] = useTransition();

  const update = (key: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  function add() {
    const last = rows.at(-1);
    setRows((rs) => [
      ...rs,
      {
        id: null,
        key: `new-${Date.now()}`,
        round: last?.round ?? "",
        matchNo: last?.matchNo ? last.matchNo + 1 : rs.length + 1,
        scheduledAt: null,
        court: last?.court ?? null,
        teamA: "",
        teamB: "",
        scoreA: null,
        scoreB: null,
        status: "SCHEDULED",
        note: null,
        sortOrder: (last?.sortOrder ?? 0) + 10,
      },
    ]);
  }

  function save(r: Row) {
    start(async () => {
      const { id, key, ...input } = r;
      const res = await saveMatch(siteId, tournamentId, id, input);
      if (res.ok) {
        if (!id && res.id) update(key, { id: res.id });
        toast.success("경기를 저장했습니다.");
      }
      else toast.error(res.error ?? "저장하지 못했습니다.");
    });
  }

  function remove(r: Row) {
    if (!r.id) {
      setRows((rs) => rs.filter((x) => x.key !== r.key));
      return;
    }
    if (!window.confirm("이 경기를 삭제할까요?")) return;
    start(async () => {
      const res = await deleteMatch(siteId, tournamentId, r.id!);
      if (res.ok) {
        setRows((rs) => rs.filter((x) => x.key !== r.key));
        toast.success("삭제했습니다.");
      } else toast.error("삭제하지 못했습니다.");
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        라운드 이름(예: 예선 A조, 4강, 결승)이 같은 경기끼리 대진표의 한 칸으로 묶입니다. 점수를 넣고 상태를 &quot;종료&quot;로 바꾸면 경기 결과에 표시됩니다.
        각 줄의 저장 버튼을 눌러야 반영됩니다.
      </p>
      <datalist id="team-names">
        {teamNames.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr>
              <th className="p-1 font-medium">순서</th>
              <th className="p-1 font-medium">라운드</th>
              <th className="p-1 font-medium">경기번호</th>
              <th className="p-1 font-medium">일시</th>
              <th className="p-1 font-medium">코트·장소</th>
              <th className="p-1 font-medium">A팀</th>
              <th className="p-1 font-medium">점수</th>
              <th className="p-1 font-medium">B팀</th>
              <th className="p-1 font-medium">상태</th>
              <th className="p-1 font-medium">비고</th>
              <th className="p-1" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.key} className="align-top">
                <td className="w-16 p-1">
                  <input aria-label="정렬 순서" type="number" className={cell} value={r.sortOrder} onChange={(e) => update(r.key, { sortOrder: Math.trunc(Number(e.target.value) || 0) })} />
                </td>
                <td className="w-28 p-1">
                  <input aria-label="라운드" className={cell} value={r.round ?? ""} onChange={(e) => update(r.key, { round: e.target.value })} />
                </td>
                <td className="w-16 p-1">
                  <input aria-label="경기번호" type="number" min={1} className={cell} value={r.matchNo ?? ""} onChange={(e) => update(r.key, { matchNo: num(e.target.value) || null })} />
                </td>
                <td className="w-44 p-1">
                  <input aria-label="경기 일시" type="datetime-local" className={cell} value={r.scheduledAt ?? ""} onChange={(e) => update(r.key, { scheduledAt: e.target.value || null })} />
                </td>
                <td className="w-28 p-1">
                  <input aria-label="코트" className={cell} value={r.court ?? ""} onChange={(e) => update(r.key, { court: e.target.value || null })} />
                </td>
                <td className="w-32 p-1">
                  <input aria-label="A팀" list="team-names" className={cell} value={r.teamA ?? ""} onChange={(e) => update(r.key, { teamA: e.target.value })} />
                </td>
                <td className="w-32 p-1">
                  <div className="flex items-center gap-1">
                    <input aria-label="A팀 점수" type="number" min={0} className={cell} value={r.scoreA ?? ""} onChange={(e) => update(r.key, { scoreA: num(e.target.value) })} />
                    :
                    <input aria-label="B팀 점수" type="number" min={0} className={cell} value={r.scoreB ?? ""} onChange={(e) => update(r.key, { scoreB: num(e.target.value) })} />
                  </div>
                </td>
                <td className="w-32 p-1">
                  <input aria-label="B팀" list="team-names" className={cell} value={r.teamB ?? ""} onChange={(e) => update(r.key, { teamB: e.target.value })} />
                </td>
                <td className="w-24 p-1">
                  <select aria-label="경기 상태" className={cell} value={r.status} onChange={(e) => update(r.key, { status: e.target.value as Row["status"] })}>
                    <option value="SCHEDULED">예정</option>
                    <option value="LIVE">진행중</option>
                    <option value="FINISHED">종료</option>
                    <option value="CANCELLED">취소</option>
                  </select>
                </td>
                <td className="w-32 p-1">
                  <input aria-label="비고" className={cell} value={r.note ?? ""} onChange={(e) => update(r.key, { note: e.target.value || null })} />
                </td>
                <td className="p-1 whitespace-nowrap">
                  <Button type="button" size="icon" variant="outline" aria-label="저장" disabled={pending} onClick={() => save(r)}>
                    <Save className="size-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" aria-label="삭제" disabled={pending} onClick={() => remove(r)}>
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="size-4" /> 경기 추가
      </Button>
    </div>
  );
}
