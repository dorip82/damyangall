"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUrlField } from "@/components/admin/AssetUpload";
import type { AdminFormState } from "@/app/admin/(protected)/tournaments/actions";
import type { SiteClub } from "@/types/site";

const initial: AdminFormState = { ok: false };

export function ClubForm({
  siteId,
  club,
  action,
  submitLabel,
}: {
  siteId: string;
  club?: SiteClub;
  action: (p: AdminFormState, fd: FormData) => Promise<AdminFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  useEffect(() => {
    if (state === initial) return;
    if (state.ok) toast.success("저장되었습니다.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <input type="hidden" name="siteId" value={siteId} />
      <div className="space-y-2">
        <Label htmlFor="name">동호회명 *</Label>
        <Input id="name" name="name" required defaultValue={club?.name ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="leader">대표자</Label>
          <Input id="leader" name="leader" defaultValue={club?.leader ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">가입 문의 연락처</Label>
          <Input id="contact" name="contact" defaultValue={club?.contact ?? ""} />
          <p className="text-xs text-muted-foreground">홈페이지에 공개됩니다. 본인 동의를 받은 연락처만 입력하세요.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">활동 장소</Label>
          <Input id="location" name="location" defaultValue={club?.location ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="schedule">정기 활동 일정</Label>
          <Input id="schedule" name="schedule" placeholder="예: 매주 화·목 19:30" defaultValue={club?.schedule ?? ""} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">동호회 소개</Label>
        <Textarea id="description" name="description" rows={5} defaultValue={club?.description ?? ""} />
      </div>
      <div className="space-y-2">
        <Label>대표 이미지</Label>
        <ImageUrlField siteId={siteId} name="imageUrl" defaultValue={club?.image_url} folder="clubs" />
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <div className="space-y-2">
          <Label htmlFor="sortOrder">표시 순서</Label>
          <Input id="sortOrder" name="sortOrder" type="number" className="w-28" defaultValue={club?.sort_order ?? 0} />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="isRecruiting" defaultChecked={club?.is_recruiting ?? false} className="size-4" />
          회원 모집중
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="isPublished" defaultChecked={club?.is_published ?? true} className="size-4" />
          홈페이지에 공개
        </label>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : submitLabel}
      </Button>
    </form>
  );
}
