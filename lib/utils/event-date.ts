const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "long",
  day: "numeric",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
};

/** "8월 20일 (목) 14:00" 형태로, end_at이 있으면 "~ 17:00"을 덧붙인다. */
export function formatEventDateRange(startAt: string, endAt: string | null): string {
  const start = new Date(startAt);
  const startLabel = start.toLocaleString("ko-KR", DATE_FORMAT);
  if (!endAt) return startLabel;

  const end = new Date(endAt);
  const sameDay = start.toDateString() === end.toDateString();
  const endLabel = sameDay
    ? end.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })
    : end.toLocaleString("ko-KR", DATE_FORMAT);
  return `${startLabel} ~ ${endLabel}`;
}
