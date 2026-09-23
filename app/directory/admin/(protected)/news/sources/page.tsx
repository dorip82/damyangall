import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FetchNewsButton } from "@/components/admin/FetchNewsButton";
import { NewsSourceToggle } from "@/components/admin/NewsSourceToggle";
import type { NewsSourceRow } from "@/types/news";

export const preferredRegion = "icn1";
export const maxDuration = 60;

function formatKst(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminNewsSourcesPage() {
  const supabase = await createClient();
  const { data: sources } = await supabase
    .from("news_sources")
    .select("*")
    .order("sort_order")
    .order("created_at")
    .returns<NewsSourceRow[]>();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/directory/admin/news"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden /> 담양소식
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">자동 수집처</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            사용 중인 수집처에서 오늘·어제 올라온 담양 기사를 자동으로 가져옵니다. (매일 오전 7시,
            GitHub 예약 실행을 설정한 경우 낮 시간 3시간마다)
          </p>
        </div>
        <div className="flex gap-2">
          <FetchNewsButton />
          <Button render={<Link href="/directory/admin/news/sources/new" />}>
            <Plus className="size-4" /> 수집처 추가
          </Button>
        </div>
      </div>

      {!sources?.length ? (
        <p className="text-sm text-muted-foreground">
          등록된 수집처가 없습니다. 수집처를 추가해주세요.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {sources.map((source) => (
            <li key={source.id} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted">
              <Link href={`/directory/admin/news/sources/${source.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-foreground">{source.name}</p>
                  <Badge variant="secondary" className="shrink-0">
                    {source.kind === "RSS" ? "RSS" : "웹페이지"}
                  </Badge>
                  {source.keyword ? (
                    <span className="shrink-0 text-xs text-muted-foreground">키워드: {source.keyword}</span>
                  ) : null}
                </div>
                <p className="truncate text-sm text-muted-foreground">{source.list_url}</p>
                <p className="text-xs text-muted-foreground">
                  {source.last_run_at ? (
                    <>
                      마지막 실행 {formatKst(source.last_run_at)} · 확인 {source.last_found ?? 0}건 ·
                      추가 {source.last_inserted ?? 0}건
                      {source.last_error ? (
                        <span className="text-destructive"> · 오류: {source.last_error}</span>
                      ) : null}
                    </>
                  ) : (
                    "아직 실행된 적 없음"
                  )}
                </p>
              </Link>
              <NewsSourceToggle sourceId={source.id} enabled={source.enabled} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
