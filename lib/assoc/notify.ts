import "server-only";

/**
 * 새 문의·참가 신청이 들어왔을 때 관리자에게 알리는 확장 지점.
 * ADMIN_NOTIFY_WEBHOOK_URL 환경변수가 있으면 그 주소로 JSON 을 POST 한다
 * (Slack·Discord·카카오워크·자체 메일 발송 서버 등 웹훅을 받는 곳이면 연결 가능).
 * 없으면 아무 일도 하지 않는다. 개인정보(연락처 등)는 알림에 넣지 않고
 * 관리자 화면에서만 보도록 링크만 보낸다.
 */
export async function notifyAdmins(event: {
  kind: "inquiry" | "tournament_application";
  siteSlug: string;
  title: string;
  adminPath: string;
}) {
  const url = process.env.ADMIN_NOTIFY_WEBHOOK_URL;
  if (!url) return;
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "damyangall.kr";
  const link = `https://${event.siteSlug}.${root.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}${event.adminPath}`;
  const label = event.kind === "inquiry" ? "새 문의" : "새 대회 참가 신청";
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: `[${label}] ${event.title}\n${link}`, ...event, link }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error("notifyAdmins failed", err);
  }
}
