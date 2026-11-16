"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createInquiry, type InquiryFormState } from "@/app/site/inquiry/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { INQUIRY_TYPES, type InquiryType } from "@/lib/site/inquiry-types";

const initialState: InquiryFormState = { ok: false };

export function InquiryForm({
  siteId,
  defaultType = "join",
}: {
  siteId: string;
  defaultType?: InquiryType;
}) {
  const [state, formAction, pending] = useActionState(createInquiry, initialState);

  useEffect(() => {
    if (state === initialState) return;
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="siteId" value={siteId} />

      <fieldset>
        <legend className="mb-2.5 text-sm font-semibold text-foreground">문의 유형</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {INQUIRY_TYPES.map((t) => (
            <label
              key={t.value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-input bg-white px-4 py-3 text-[15px] transition-colors hover:border-[var(--club-green)] has-[:checked]:border-[var(--club-navy)] has-[:checked]:bg-[var(--club-green-light)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--club-green)]"
            >
              <input
                type="radio"
                name="inquiryType"
                value={t.value}
                defaultChecked={t.value === defaultType}
                className="size-4 accent-[var(--club-navy)]"
              />
              <span className="font-medium">{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="authorName">이름</Label>
          <Input id="authorName" name="authorName" maxLength={50} required autoComplete="name" className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="authorContact">연락처 (선택)</Label>
          <Input
            id="authorContact"
            name="authorContact"
            placeholder="답변 받으실 연락처나 이메일"
            maxLength={100}
            autoComplete="tel"
            className="h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" name="title" maxLength={180} required className="h-11" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">문의 내용</Label>
        <Textarea
          id="content"
          name="content"
          rows={8}
          maxLength={5000}
          required
          placeholder="공연 요청이라면 행사 일시·장소·인원 등을 함께 적어주시면 빠르게 안내해 드릴게요."
        />
      </div>

      <p className="rounded-lg bg-[var(--club-beige)] px-4 py-3 text-sm text-muted-foreground">
        작성하신 글은 별도 로그인 없이 누구나 볼 수 있습니다. 개인정보는 연락처 항목에만 남겨주세요.
      </p>

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-xl bg-[var(--club-navy)] text-base font-bold hover:bg-[var(--club-navy-deep)] sm:w-auto sm:px-10"
      >
        {pending ? "등록 중..." : "문의 등록하기"}
      </Button>
    </form>
  );
}
