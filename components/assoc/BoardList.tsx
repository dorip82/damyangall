import Link from "next/link";
import { Megaphone, Paperclip, Search } from "lucide-react";
import { formatDate, type AssocPost } from "@/lib/assoc/data";
import { cn } from "@/lib/utils";

const NEW_DAYS = 3;

/** 게시판 검색창 (GET ?q=) */
export function BoardSearch({ action, q, total }: { action: string; q?: string; total: number }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[15px] text-muted-foreground">
        {q ? (
          <>
            <strong className="text-primary">&lsquo;{q}&rsquo;</strong> 검색 결과{" "}
          </>
        ) : (
          "전체 "
        )}
        <strong className="text-primary tabular-nums">{total}</strong>건
      </p>
      <form action={action} role="search" className="flex w-full gap-2 sm:w-auto">
        <label htmlFor="board-q" className="sr-only">
          제목 검색
        </label>
        <input
          id="board-q"
          name="q"
          type="search"
          defaultValue={q}
          maxLength={50}
          placeholder="제목으로 검색"
          className="h-11 min-w-0 flex-1 rounded-full border border-border bg-white px-4 text-[15px] outline-none focus:border-[var(--dba-blue)] focus:ring-2 focus:ring-[var(--dba-blue)]/20 sm:w-64"
        />
        <button
          type="submit"
          className="flex h-11 items-center gap-1.5 rounded-full bg-primary px-5 text-[15px] font-bold text-primary-foreground hover:bg-[var(--dba-blue)]"
        >
          <Search className="size-4" aria-hidden />
          검색
        </button>
      </form>
    </div>
  );
}

/**
 * 게시판형 목록: 번호 · (구분) · 제목 · 첨부 · 등록일 · 조회.
 * 상단 고정 글은 번호 대신 "공지"로 맨 위에 둔다.
 */
export function BoardList({
  pinned,
  rows,
  startNumber,
  showCategory,
  now,
}: {
  pinned: AssocPost[];
  rows: AssocPost[];
  /** 첫 행의 번호 (전체 건수 - 앞 페이지 건수) */
  startNumber: number;
  showCategory: boolean;
  now: number;
}) {
  const cols = showCategory
    ? "md:grid-cols-[72px_96px_minmax(0,1fr)_56px_110px_72px]"
    : "md:grid-cols-[72px_minmax(0,1fr)_56px_110px_72px]";

  const row = (p: AssocPost, num: number | null) => {
    const isNew = !!p.published_at && now - new Date(p.published_at).getTime() < NEW_DAYS * 86400000;
    return (
      <li key={p.id} className={cn(num === null && "bg-[var(--dba-soft)]/70")}>
        <Link
          href={`/news/${p.id}`}
          className={cn("group grid grid-cols-[minmax(0,1fr)] gap-y-1 px-4 py-4 hover:bg-[var(--dba-soft)] sm:px-5 md:items-center md:gap-x-2", cols)}
        >
          <span className="hidden text-center text-sm text-muted-foreground tabular-nums md:block">
            {num === null ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--dba-orange)] px-2.5 py-0.5 text-xs font-extrabold text-[var(--dba-navy)]">
                <Megaphone className="size-3" aria-hidden />
                공지
              </span>
            ) : (
              num
            )}
          </span>
          {showCategory ? (
            <span className="hidden text-center text-sm font-semibold text-[var(--dba-blue)] md:block">{p.category ?? "소식"}</span>
          ) : null}
          <span className="flex min-w-0 items-center gap-2">
            {num === null ? (
              <span className="shrink-0 rounded-full bg-[var(--dba-orange)] px-2 py-0.5 text-[11px] font-extrabold text-[var(--dba-navy)] md:hidden">공지</span>
            ) : null}
            <span className={cn("min-w-0 truncate text-[16px] group-hover:text-[var(--dba-blue)] group-hover:underline", num === null ? "font-bold text-primary" : "font-medium")}>
              {p.title}
            </span>
            {p.attachmentCount ? (
              <Paperclip className="size-4 shrink-0 text-muted-foreground md:hidden" aria-label="첨부파일 있음" />
            ) : null}
            {isNew ? (
              <span className="shrink-0 rounded bg-[var(--dba-green)] px-1.5 text-[11px] leading-5 font-extrabold text-white" aria-label="새 글">
                N
              </span>
            ) : null}
          </span>
          <span className="hidden justify-center md:flex">
            {p.attachmentCount ? <Paperclip className="size-4 text-muted-foreground" aria-label={`첨부파일 ${p.attachmentCount}개`} /> : null}
          </span>
          <span className="flex gap-3 text-[13px] text-muted-foreground tabular-nums md:block md:text-center md:text-sm">
            {showCategory ? <span className="md:hidden">{p.category ?? "소식"}</span> : null}
            <span>{formatDate(p.published_at)}</span>
            <span className="md:hidden">조회 {p.view_count}</span>
          </span>
          <span className="hidden text-center text-sm text-muted-foreground tabular-nums md:block">{p.view_count}</span>
        </Link>
      </li>
    );
  };

  return (
    <div className="border-t-2 border-primary bg-white">
      <div className={cn("hidden border-b border-border bg-[var(--dba-soft)] px-5 py-3 text-center text-sm font-bold text-primary md:grid md:gap-x-2", cols)}>
        <span>번호</span>
        {showCategory ? <span>구분</span> : null}
        <span>제목</span>
        <span>첨부</span>
        <span>등록일</span>
        <span>조회</span>
      </div>
      <ul className="divide-y divide-border border-b border-border">
        {pinned.map((p) => row(p, null))}
        {rows.map((p, i) => row(p, startNumber - i))}
      </ul>
    </div>
  );
}
