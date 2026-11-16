"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const KEY = "dba-popup-hidden";
const noop = () => () => {};

function readHiddenUntil(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

/** 관리자 "팝업 · 배너 관리"에서 켠 공지 팝업. "오늘 하루 보지 않기"는 이 브라우저에만 기억한다. */
export function AssocPopup({
  id,
  title,
  content,
  image,
  link,
}: {
  id: string;
  title?: string;
  content?: string;
  image?: string;
  link?: string;
}) {
  const hiddenUntil = useSyncExternalStore(noop, readHiddenUntil, () => "server");
  const [closed, setClosed] = useState(false);
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
  if (closed || hiddenUntil === "server" || hiddenUntil === `${id}:${today}`) return null;

  const hideToday = () => {
    try {
      window.localStorage.setItem(KEY, `${id}:${today}`);
    } catch {
      /* 저장할 수 없는 환경이면 이번만 닫는다 */
    }
    setClosed(true);
  };

  const body = (
    <>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={title ?? "공지 이미지"} className="max-h-[60vh] w-full object-contain bg-[var(--dba-soft)]" />
      ) : null}
      {title || content ? (
        <div className="p-5">
          {title ? <p className="text-lg font-extrabold text-primary">{title}</p> : null}
          {content ? <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line text-foreground/85">{content}</p> : null}
        </div>
      ) : null}
    </>
  );

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={title ?? "알림"}
      className="fixed bottom-4 left-4 z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-white shadow-[0_20px_50px_rgba(16,38,79,0.28)] sm:top-28 sm:bottom-auto sm:left-8"
    >
      {link ? (
        <Link href={link} className="block hover:opacity-95">
          {body}
        </Link>
      ) : (
        body
      )}
      <div className="flex border-t border-border text-sm">
        <button type="button" onClick={hideToday} className="flex-1 px-4 py-3 text-muted-foreground hover:bg-muted">
          오늘 하루 보지 않기
        </button>
        <button
          type="button"
          onClick={() => setClosed(true)}
          className="flex items-center gap-1 border-l border-border px-5 py-3 font-bold text-primary hover:bg-muted"
        >
          <X className="size-4" aria-hidden />
          닫기
        </button>
      </div>
    </div>
  );
}
