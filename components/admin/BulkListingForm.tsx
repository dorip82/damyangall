"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  bulkCreateListings,
  type BulkListingFormState,
} from "@/app/directory/admin/(protected)/listings/actions";
import { DIRECTORY_CATEGORIES } from "@/lib/directory/categories";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const initialState: BulkListingFormState = { ok: false };

const EXAMPLE_ROW = [
  "카테고리",
  "업체명",
  "소개",
  "전화번호",
  "주소",
  "인스타그램URL",
  "상태",
].join("\t");

export function BulkListingForm() {
  const [state, formAction, pending] = useActionState(bulkCreateListings, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === initialState) return;
    if (state.ok) {
      toast.success(`${state.insertedCount ?? 0}건 등록되었습니다.`);
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2 rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">사용 방법</p>
        <p>
          엑셀/구글 시트에서 아래 순서로 열을 만들고, 표를 그대로 복사해서 아래 칸에 붙여넣으세요.
          (Ctrl+V로 붙여넣으면 열 구분이 자동으로 유지됩니다.)
        </p>
        <p className="font-mono text-xs">{EXAMPLE_ROW}</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>카테고리: {DIRECTORY_CATEGORIES.map((c) => c.label).join(", ")} 중 하나</li>
          <li>업체명은 필수, 나머지는 비워둬도 됩니다.</li>
          <li>상태를 비워두면 &ldquo;게시&rdquo;로 등록됩니다. (&ldquo;숨김&rdquo;으로 비공개 등록 가능)</li>
          <li>첫 줄이 &ldquo;카테고리&rdquo;로 시작하면 제목행으로 보고 건너뜁니다.</li>
          <li>사진은 일괄등록에 포함되지 않습니다 — 등록 후 각 업체 상세에서 개별로 추가해주세요.</li>
        </ul>
      </div>

      <form ref={formRef} action={formAction} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="rows">붙여넣기</Label>
          <Textarea
            id="rows"
            name="rows"
            rows={12}
            placeholder={EXAMPLE_ROW}
            className="font-mono text-xs"
            required
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "등록 중..." : "일괄 등록"}
        </Button>
      </form>

      {state.skipped?.length ? (
        <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            건너뛴 행 {state.skipped.length}건
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {state.skipped.map((s) => (
              <li key={s.line}>
                {s.line}번째 줄 — {s.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
