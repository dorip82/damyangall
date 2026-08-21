"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { NewsFormState } from "@/app/directory/admin/(protected)/news/actions";
import { NEWS_CATEGORIES } from "@/lib/news/categories";
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
import type { NewsRow } from "@/types/news";

const initialState: NewsFormState = { ok: false };

export function NewsForm({
  news,
  action,
  submitLabel,
}: {
  news?: NewsRow;
  action: (prevState: NewsFormState, formData: FormData) => Promise<NewsFormState>;
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
        <Select name="category" defaultValue={news?.category ?? NEWS_CATEGORIES[0].value}>
          <SelectTrigger id="category" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NEWS_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" name="title" defaultValue={news?.title ?? ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">요약 (목록/카드에 짧게 표시)</Label>
        <Textarea id="summary" name="summary" rows={2} defaultValue={news?.summary ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">본문</Label>
        <Textarea
          id="content"
          name="content"
          rows={10}
          defaultValue={news?.content ?? ""}
          required
        />
      </div>

      <ListingImageField
        defaultValue={news?.thumbnail_url}
        name="thumbnailUrl"
        label="썸네일 사진"
      />

      <div className="space-y-2">
        <Label htmlFor="status">상태</Label>
        <Select name="status" defaultValue={news?.status ?? "PUBLISHED"}>
          <SelectTrigger id="status" className="w-40">
            <SelectValue />
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
