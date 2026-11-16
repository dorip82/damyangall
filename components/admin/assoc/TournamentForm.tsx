"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AssetUploadButton, ImageUrlField } from "@/components/admin/AssetUpload";
import type { AdminFormState } from "@/app/admin/(protected)/tournaments/actions";
import type { SiteTournament } from "@/types/site";

const STATUS = [
  ["PREPARING", "준비중 (접수 전)"],
  ["OPEN", "접수중"],
  ["CLOSED", "접수마감"],
  ["ONGOING", "대회 진행중"],
  ["FINISHED", "종료"],
] as const;

const initial: AdminFormState = { ok: false };
const selectCls = "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm";

export function TournamentForm({
  siteId,
  tournament: t,
  action,
  submitLabel,
}: {
  siteId: string;
  tournament?: SiteTournament;
  action: (p: AdminFormState, fd: FormData) => Promise<AdminFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [photos, setPhotos] = useState((t?.photo_urls ?? []).join("\n"));

  useEffect(() => {
    if (state === initial) return;
    if (state.ok) toast.success("저장되었습니다.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      <input type="hidden" name="siteId" value={siteId} />
      <div className="space-y-2">
        <Label htmlFor="title">대회명 *</Label>
        <Input id="title" name="title" defaultValue={t?.title ?? ""} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">한 줄 소개</Label>
        <Input id="summary" name="summary" defaultValue={t?.summary ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">진행 상태</Label>
          <select id="status" name="status" defaultValue={t?.status ?? "PREPARING"} className={selectCls}>
            {STATUS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            &quot;접수중&quot;이고 접수 기간 안일 때만 홈페이지에서 참가 신청을 받습니다.
          </p>
        </div>
        <label className="flex items-center gap-2 self-center text-sm font-medium">
          <input type="checkbox" name="isPublished" defaultChecked={t?.is_published ?? false} className="size-4" />
          홈페이지에 공개
        </label>
      </div>
      <fieldset className="grid gap-4 rounded-md border border-border p-4 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold">일정</legend>
        <div className="space-y-2">
          <Label htmlFor="startDate">개최 시작일</Label>
          <Input id="startDate" name="startDate" type="date" defaultValue={t?.start_date ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">개최 종료일</Label>
          <Input id="endDate" name="endDate" type="date" defaultValue={t?.end_date ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="applyStart">접수 시작일</Label>
          <Input id="applyStart" name="applyStart" type="date" defaultValue={t?.apply_start ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="applyEnd">접수 마감일</Label>
          <Input id="applyEnd" name="applyEnd" type="date" defaultValue={t?.apply_end ?? ""} />
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="venue">장소</Label>
          <Input id="venue" name="venue" defaultValue={t?.venue ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="division">참가 부문</Label>
          <Input id="division" name="division" placeholder="예: 일반부, 고등부" defaultValue={t?.division ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxTeams">모집 팀 수</Label>
          <Input id="maxTeams" name="maxTeams" type="number" min={1} defaultValue={t?.max_teams ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fee">참가비</Label>
          <Input id="fee" name="fee" defaultValue={t?.fee ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="host">주최 · 주관</Label>
          <Input id="host" name="host" defaultValue={t?.host ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">대회 문의처</Label>
          <Input id="contact" name="contact" defaultValue={t?.contact ?? ""} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">대회 요강 · 상세 안내</Label>
        <Textarea id="description" name="description" rows={8} defaultValue={t?.description ?? ""} />
      </div>
      <div className="space-y-2">
        <Label>포스터 이미지</Label>
        <ImageUrlField siteId={siteId} name="posterUrl" defaultValue={t?.poster_url} folder="tournaments" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="resultSummary">대회 결과 요약 (종료 후)</Label>
        <Textarea id="resultSummary" name="resultSummary" rows={3} placeholder="예: 우승 ○○팀, 준우승 ○○팀" defaultValue={t?.result_summary ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="photoUrls">대회 사진 URL (한 줄에 하나)</Label>
        <Textarea id="photoUrls" name="photoUrls" rows={4} value={photos} onChange={(e) => setPhotos(e.target.value)} />
        <AssetUploadButton
          siteId={siteId}
          folder="tournaments"
          label="사진 올리기 (여러 번 가능)"
          onUploaded={(a) => setPhotos((v) => (v.trim() ? v.trim() + String.fromCharCode(10) + a.url : a.url))}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : submitLabel}
      </Button>
    </form>
  );
}
