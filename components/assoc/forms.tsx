"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { submitApplication, submitInquiry, type PublicFormState } from "@/app/assoc/actions";
import { cn } from "@/lib/utils";

const initial: PublicFormState = { ok: false };

const inputCls =
  "w-full rounded-xl border border-input bg-white px-4 text-[16px] outline-none transition-colors focus:border-[var(--dba-blue)] focus:ring-2 focus:ring-[var(--dba-blue)]/20 aria-[invalid=true]:border-red-500";

function Field({
  id,
  label,
  required,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[15px] font-bold text-primary">
        {label}
        {required ? (
          <span className="ml-1 text-red-600" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-medium text-muted-foreground">(선택)</span>
        )}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-semibold text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint?: boolean, error?: string) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

function PrivacyConsent({ items, error }: { items: string; error?: string }) {
  return (
    <fieldset className="rounded-2xl border border-border bg-[var(--dba-soft)] p-5">
      <legend className="px-1 text-[15px] font-bold text-primary">개인정보 수집 · 이용 동의 (필수)</legend>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-foreground/80">
        <li>수집 항목: {items}</li>
        <li>이용 목적: 접수 확인과 결과 안내, 문의에 대한 답변</li>
        <li>보유 기간: 처리 완료 후 1년 이내 파기 (관련 법령에 따라 보관이 필요한 경우 제외)</li>
        <li>동의를 거부할 수 있으나, 거부하면 접수할 수 없습니다.</li>
      </ul>
      <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-[15px] font-semibold">
        <input
          type="checkbox"
          name="privacy"
          required
          aria-invalid={!!error}
          className="size-5 accent-[var(--dba-blue)]"
        />
        위 내용을 확인했으며 개인정보 수집 · 이용에 동의합니다.
      </label>
      {error ? <p className="mt-2 text-sm font-semibold text-red-600">{error}</p> : null}
      <p className="mt-2 text-xs text-muted-foreground">
        자세한 내용은{" "}
        <Link href="/privacy" className="underline">
          개인정보처리방침
        </Link>
        을 확인하세요.
      </p>
    </fieldset>
  );
}

/** 봇이 채우는 숨은 칸 — 사람은 보지 못한다 */
function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        웹사이트
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

function Done({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="status" className="rounded-2xl border border-[var(--dba-green)]/40 bg-[#ecf8f3] p-8 text-center">
      <CheckCircle2 className="mx-auto size-12 text-[var(--dba-green)]" aria-hidden />
      <p className="mt-3 text-xl font-extrabold text-primary">{title}</p>
      <div className="mt-2 text-[15px] text-foreground/80">{children}</div>
    </div>
  );
}

export function ApplicationForm({
  tournaments,
  defaultTournamentId,
}: {
  tournaments: { id: string; title: string; period: string }[];
  defaultTournamentId?: string;
}) {
  const [state, action, pending] = useActionState(submitApplication, initial);
  const fe = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <Done title="참가 신청이 접수되었습니다">
        <p>협회에서 신청 내용을 확인한 뒤 입력하신 연락처로 승인 여부를 안내해 드립니다.</p>
        <p className="mt-1">승인된 팀은 대회 페이지의 참가 확정 팀 목록에 표시됩니다.</p>
        <Link href="/tournament" className="mt-5 inline-flex h-11 items-center rounded-full bg-primary px-6 font-bold text-primary-foreground">
          대회 안내로 돌아가기
        </Link>
      </Done>
    );
  }

  return (
    <form action={action} className="relative space-y-6" noValidate>
      <Honeypot />
      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[15px] font-semibold text-red-700">
          {state.error}
        </p>
      ) : null}
      <Field id="tournamentId" label="대회명" required error={fe.tournamentId}>
        <select
          id="tournamentId"
          name="tournamentId"
          defaultValue={defaultTournamentId ?? (tournaments.length === 1 ? tournaments[0].id : "")}
          required
          aria-invalid={!!fe.tournamentId}
          aria-describedby={describedBy("tournamentId", false, fe.tournamentId)}
          className={cn(inputCls, "h-12")}
        >
          <option value="" disabled>
            대회를 선택하세요
          </option>
          {tournaments.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} ({t.period})
            </option>
          ))}
        </select>
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="teamName" label="팀명" required error={fe.teamName}>
          <input id="teamName" name="teamName" required maxLength={100} aria-invalid={!!fe.teamName} aria-describedby={describedBy("teamName", false, fe.teamName)} className={cn(inputCls, "h-12")} />
        </Field>
        <Field id="affiliation" label="소속" hint="동호회, 학교, 직장 등" error={fe.affiliation}>
          <input id="affiliation" name="affiliation" maxLength={100} aria-describedby={describedBy("affiliation", true, fe.affiliation)} className={cn(inputCls, "h-12")} />
        </Field>
        <Field id="leaderName" label="대표자 이름" required error={fe.leaderName}>
          <input id="leaderName" name="leaderName" required maxLength={50} autoComplete="name" aria-invalid={!!fe.leaderName} aria-describedby={describedBy("leaderName", false, fe.leaderName)} className={cn(inputCls, "h-12")} />
        </Field>
        <Field id="phone" label="연락처" required error={fe.phone}>
          <input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="010-0000-0000" aria-invalid={!!fe.phone} aria-describedby={describedBy("phone", false, fe.phone)} className={cn(inputCls, "h-12")} />
        </Field>
      </div>
      <Field id="players" label="참가 선수 명단" hint="한 줄에 한 명씩 (이름, 등번호 등). 최대 40명" error={fe.players}>
        <textarea id="players" name="players" rows={6} aria-describedby={describedBy("players", true, fe.players)} className={cn(inputCls, "py-3")} />
      </Field>
      <Field id="notes" label="기타 요청사항" error={fe.notes}>
        <textarea id="notes" name="notes" rows={3} maxLength={2000} className={cn(inputCls, "py-3")} />
      </Field>
      <PrivacyConsent items="팀명, 소속, 대표자 이름, 연락처, 참가 선수 명단" error={fe.privacy} />
      <button
        type="submit"
        disabled={pending}
        className="flex h-14 w-full items-center justify-center rounded-full bg-[var(--dba-orange)] text-lg font-extrabold text-[var(--dba-navy)] transition hover:brightness-105 disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {pending ? "접수 중…" : "참가 신청하기"}
      </button>
    </form>
  );
}

export function InquiryForm({
  types,
  defaultType,
  defaultTitle,
}: {
  types: { key: string; label: string; description: string }[];
  defaultType?: string;
  defaultTitle?: string;
}) {
  const [state, action, pending] = useActionState(submitInquiry, initial);
  const [type, setType] = useState(types.some((t) => t.key === defaultType) ? defaultType! : types[0].key);
  const fe = state.fieldErrors ?? {};

  if (state.ok) {
    return (
      <Done title="문의가 접수되었습니다">
        <p>담당자가 확인한 뒤 남겨주신 연락처로 답변드리겠습니다.</p>
        <p className="mt-1 text-sm text-muted-foreground">문의 내용은 공개되지 않으며 관리자만 볼 수 있습니다.</p>
      </Done>
    );
  }

  return (
    <form action={action} className="relative space-y-6" noValidate>
      <Honeypot />
      {state.error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-[15px] font-semibold text-red-700">
          {state.error}
        </p>
      ) : null}
      <fieldset>
        <legend className="mb-2 text-[15px] font-bold text-primary">문의 유형</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {types.map((t) => (
            <label
              key={t.key}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                type === t.key ? "border-[var(--dba-blue)] bg-[var(--dba-soft)] ring-1 ring-[var(--dba-blue)]" : "border-border hover:border-[var(--dba-blue)]/50"
              )}
            >
              <input
                type="radio"
                name="inquiryType"
                value={t.key}
                checked={type === t.key}
                onChange={() => setType(t.key)}
                className="mt-1 size-4 accent-[var(--dba-blue)]"
              />
              <span>
                <span className="block font-bold text-primary">{t.label}</span>
                <span className="block text-sm text-muted-foreground">{t.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="authorName" label="이름" required error={fe.authorName}>
          <input id="authorName" name="authorName" required maxLength={50} autoComplete="name" aria-invalid={!!fe.authorName} aria-describedby={describedBy("authorName", false, fe.authorName)} className={cn(inputCls, "h-12")} />
        </Field>
        <Field id="authorContact" label="연락처 (전화 또는 이메일)" required error={fe.authorContact}>
          <input id="authorContact" name="authorContact" required maxLength={100} aria-invalid={!!fe.authorContact} aria-describedby={describedBy("authorContact", false, fe.authorContact)} className={cn(inputCls, "h-12")} />
        </Field>
      </div>
      <Field id="title" label="제목" required error={fe.title}>
        <input id="title" name="title" required maxLength={180} defaultValue={defaultTitle} aria-invalid={!!fe.title} aria-describedby={describedBy("title", false, fe.title)} className={cn(inputCls, "h-12")} />
      </Field>
      <Field id="content" label="문의 내용" required error={fe.content}>
        <textarea id="content" name="content" rows={7} required maxLength={5000} aria-invalid={!!fe.content} aria-describedby={describedBy("content", false, fe.content)} className={cn(inputCls, "py-3")} />
      </Field>
      <PrivacyConsent items="이름, 연락처(전화 또는 이메일), 문의 내용" error={fe.privacy} />
      <button
        type="submit"
        disabled={pending}
        className="flex h-14 w-full items-center justify-center rounded-full bg-primary text-lg font-extrabold text-primary-foreground transition hover:bg-[var(--dba-blue)] disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {pending ? "보내는 중…" : "문의 보내기"}
      </button>
    </form>
  );
}
