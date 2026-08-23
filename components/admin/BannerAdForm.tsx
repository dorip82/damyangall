"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { BannerAdFormState } from "@/app/directory/admin/(protected)/ads/actions";
import { getPublishStatusLabel } from "@/lib/utils/status-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListingImageField } from "@/components/admin/ListingImageField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BannerAdRow } from "@/types/banner-ad";

const POSITION_LABELS = { LEFT: "왼쪽", RIGHT: "오른쪽" } as const;
function getPositionLabel(position: string): string {
  return POSITION_LABELS[position as keyof typeof POSITION_LABELS] ?? position;
}

const initialState: BannerAdFormState = { ok: false };

export function BannerAdForm({
  banner,
  action,
  submitLabel,
}: {
  banner?: BannerAdRow;
  action: (prevState: BannerAdFormState, formData: FormData) => Promise<BannerAdFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state === initialState) return;
    if (state.ok) toast.success("저장되었습니다.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="position">노출 위치</Label>
        <Select name="position" defaultValue={banner?.position ?? "LEFT"}>
          <SelectTrigger id="position" className="w-40">
            <SelectValue>{(value: string) => getPositionLabel(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LEFT">왼쪽</SelectItem>
            <SelectItem value="RIGHT">오른쪽</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">제목 (내부 관리용, 화면에는 alt 텍스트로만 쓰임)</Label>
        <Input id="title" name="title" defaultValue={banner?.title ?? ""} required />
      </div>

      <ListingImageField
        defaultValue={banner?.image_url}
        previewClassName="w-full max-w-40 rounded-md border border-border object-cover"
      />

      <div className="space-y-2">
        <Label htmlFor="linkUrl">클릭 시 이동할 링크 (선택)</Label>
        <Input
          id="linkUrl"
          name="linkUrl"
          type="url"
          placeholder="https://..."
          defaultValue={banner?.link_url ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sortOrder">정렬 순서 (작을수록 위)</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={banner?.sort_order ?? 0}
          className="w-32"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">상태</Label>
        <Select name="status" defaultValue={banner?.status ?? "PUBLISHED"}>
          <SelectTrigger id="status" className="w-40">
            <SelectValue>{(value: string) => getPublishStatusLabel(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PUBLISHED">게시</SelectItem>
            <SelectItem value="HIDDEN">숨김</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : submitLabel}
      </Button>
    </form>
  );
}
