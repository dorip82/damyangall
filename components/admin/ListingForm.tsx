"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { ListingFormState } from "@/app/directory/admin/(protected)/listings/actions";
import { DIRECTORY_CATEGORIES, getCategoryLabel } from "@/lib/directory/categories";
import { getPublishStatusLabel } from "@/lib/utils/status-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ListingImageField } from "@/components/admin/ListingImageField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DirectoryListing } from "@/types/directory";
import type { DirectoryCategory } from "@/types/database";

const initialState: ListingFormState = { ok: false };

export function ListingForm({
  listing,
  action,
  submitLabel,
}: {
  listing?: DirectoryListing;
  action: (prevState: ListingFormState, formData: FormData) => Promise<ListingFormState>;
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
        <Label htmlFor="category">카테고리</Label>
        <Select name="category" defaultValue={listing?.category ?? DIRECTORY_CATEGORIES[0].value}>
          <SelectTrigger id="category" className="w-48">
            <SelectValue>{(value: DirectoryCategory) => getCategoryLabel(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DIRECTORY_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">업체명</Label>
        <Input id="name" name="name" defaultValue={listing?.name ?? ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">소개</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={listing?.description ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">전화번호</Label>
          <Input id="phone" name="phone" defaultValue={listing?.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">주소</Label>
          <Input id="address" name="address" defaultValue={listing?.address ?? ""} />
        </div>
      </div>

      <ListingImageField defaultValue={listing?.image_url} />

      <div className="space-y-2">
        <Label htmlFor="instagramUrl">인스타그램 URL</Label>
        <Input
          id="instagramUrl"
          name="instagramUrl"
          placeholder="https://instagram.com/..."
          defaultValue={listing?.instagram_url ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          입력하면 상세 페이지에 인스타그램 아이콘이 활성화됩니다. 비워두면 비활성 상태로 표시됩니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="websiteUrl">홈페이지 URL</Label>
        <Input
          id="websiteUrl"
          name="websiteUrl"
          placeholder="https://..."
          defaultValue={listing?.website_url ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          입력하면 상세 페이지에 홈페이지 아이콘이 활성화됩니다. 비워두면 비활성 상태로 표시됩니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">상태</Label>
        <Select name="status" defaultValue={listing?.status ?? "PUBLISHED"}>
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
