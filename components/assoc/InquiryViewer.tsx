"use client";

import { useActionState } from "react";
import { Lock, MessageSquareReply } from "lucide-react";
import { viewInquiry, type InquiryViewState } from "@/app/assoc/actions";

const initial: InquiryViewState = { status: "idle" };

const MESSAGE: Partial<Record<InquiryViewState["status"], string>> = {
  WRONG: "비밀번호가 맞지 않습니다. 5번 틀리면 10분 동안 조회할 수 없습니다.",
  LOCKED: "비밀번호를 여러 번 틀려 잠시 조회할 수 없습니다. 10분 뒤에 다시 시도해주세요.",
  NOT_FOUND: "문의를 찾을 수 없습니다.",
  ERROR: "조회하지 못했습니다. 잠시 후 다시 시도해주세요.",
};

function fmt(iso: string | null) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" }).format(new Date(iso));
}

/** 조회 비밀번호를 받아 문의 내용과 답변을 보여준다. 비밀번호는 서버 함수로만 확인한다. */
export function InquiryViewer({ inquiryId }: { inquiryId: string }) {
  const [state, action, pending] = useActionState(viewInquiry, initial);

  if (state.status === "OK" && state.data) {
    const d = state.data;
    return (
      <div className="space-y-6">
        <article className="rounded-2xl border border-border bg-white p-6">
          <p className="text-sm font-bold text-[var(--dba-blue)]">{d.typeLabel}</p>
          <h2 className="mt-1 text-xl font-extrabold break-words text-primary">{d.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {d.authorName} · {fmt(d.createdAt)}
          </p>
          <p className="mt-5 text-[16px] leading-[1.9] break-words whitespace-pre-line text-foreground/85">{d.content}</p>
        </article>
        <section
          aria-labelledby="reply-title"
          className={d.replyContent ? "rounded-2xl border border-[var(--dba-green)]/40 bg-[#ecf8f3] p-6" : "rounded-2xl border border-dashed border-border bg-[var(--dba-soft)] p-6"}
        >
          <h3 id="reply-title" className="flex items-center gap-2 font-extrabold text-primary">
            <MessageSquareReply className="size-5 text-[var(--dba-green)]" aria-hidden />
            협회 답변
          </h3>
          {d.replyContent ? (
            <>
              <p className="mt-3 text-[16px] leading-[1.9] break-words whitespace-pre-line text-foreground/90">{d.replyContent}</p>
              {d.repliedAt ? <p className="mt-3 text-sm text-muted-foreground">{fmt(d.repliedAt)}</p> : null}
            </>
          ) : (
            <p className="mt-3 text-[15px] text-muted-foreground">아직 답변이 등록되지 않았습니다. 담당자가 확인 후 답변드리겠습니다.</p>
          )}
        </section>
      </div>
    );
  }

  const msg = MESSAGE[state.status];
  return (
    <form action={action} className="rounded-2xl border border-border bg-white p-6">
      <input type="hidden" name="inquiryId" value={inquiryId} />
      <p className="flex items-center gap-2 font-extrabold text-primary">
        <Lock className="size-5" aria-hidden />
        비공개 문의입니다
      </p>
      <p className="mt-1 text-[15px] text-muted-foreground">문의를 남길 때 정한 조회 비밀번호를 입력해주세요.</p>
      <label htmlFor="inq-pw" className="mt-5 block text-[15px] font-bold text-primary">
        조회 비밀번호
      </label>
      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
        <input
          id="inq-pw"
          name="password"
          type="password"
          required
          maxLength={30}
          autoComplete="current-password"
          aria-invalid={state.status === "WRONG" || undefined}
          aria-describedby={msg ? "inq-pw-error" : undefined}
          className="h-12 w-full rounded-xl border border-input px-4 text-[16px] outline-none focus:border-[var(--dba-blue)] focus:ring-2 focus:ring-[var(--dba-blue)]/20 sm:max-w-xs"
        />
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-full bg-primary px-8 font-extrabold text-primary-foreground hover:bg-[var(--dba-blue)] disabled:opacity-60"
        >
          {pending ? "확인 중…" : "확인"}
        </button>
      </div>
      {msg ? (
        <p id="inq-pw-error" role="alert" className="mt-3 text-sm font-semibold text-red-600">
          {msg}
        </p>
      ) : null}
      <p className="mt-4 text-sm text-muted-foreground">
        비밀번호가 기억나지 않으면 관리자도 알려드릴 수 없습니다. 같은 내용으로 다시 문의해주세요.
      </p>
    </form>
  );
}
