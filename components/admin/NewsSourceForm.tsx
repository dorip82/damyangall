"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye } from "lucide-react";
import {
  previewNewsSourceAction,
  type NewsSourceFormState,
} from "@/app/directory/admin/(protected)/news/sources/actions";
import type { CheckedStatus, SourcePreview } from "@/lib/news-scraper/run";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NewsSourceRow } from "@/types/news";
import type { NewsSourceKind } from "@/types/database";

const initialState: NewsSourceFormState = { ok: false };

const KIND_LABELS: Record<NewsSourceKind, string> = {
  HTML: "웹페이지 (홈/목록 페이지)",
  RSS: "RSS 피드",
};

const STATUS_LABELS: Record<CheckedStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  new: { label: "수집 대상", variant: "default" },
  known: { label: "이미 수집됨", variant: "secondary" },
  old: { label: "지난 기사", variant: "outline" },
  "no-keyword": { label: "키워드 없음", variant: "outline" },
  "no-title": { label: "제목 없음", variant: "outline" },
  "fetch-failed": { label: "열기 실패", variant: "outline" },
};

export function NewsSourceForm({
  source,
  action,
  submitLabel,
}: {
  source?: NewsSourceRow;
  action: (prevState: NewsSourceFormState, formData: FormData) => Promise<NewsSourceFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [kind, setKind] = useState<NewsSourceKind>(source?.kind ?? "HTML");
  const [preview, setPreview] = useState<SourcePreview | null>(null);
  const [previewing, startPreview] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === initialState) return;
    if (state.error) toast.error(state.error);
  }, [state]);

  function handlePreview() {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    startPreview(async () => {
      setPreview(await previewNewsSourceAction(formData));
    });
  }

  return (
    <div className="max-w-3xl space-y-8">
      <form ref={formRef} action={formAction} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">이름</Label>
          <Input
            id="name"
            name="name"
            defaultValue={source?.name ?? ""}
            placeholder="예: 담양신문"
            required
          />
          <p className="text-xs text-muted-foreground">담양소식 목록에 출처로 표시됩니다.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="kind">수집 방식</Label>
          <Select
            name="kind"
            value={kind}
            onValueChange={(v) => setKind((v as NewsSourceKind) ?? "HTML")}
          >
            <SelectTrigger id="kind" className="w-64">
              <SelectValue>{(value: NewsSourceKind) => KIND_LABELS[value]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HTML">{KIND_LABELS.HTML}</SelectItem>
              <SelectItem value="RSS">{KIND_LABELS.RSS}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="listUrl">{kind === "RSS" ? "RSS 주소" : "목록 페이지 주소"}</Label>
          <Input
            id="listUrl"
            name="listUrl"
            type="url"
            defaultValue={source?.list_url ?? ""}
            placeholder={
              kind === "RSS" ? "https://www.example.co.kr/rss/allArticle.xml" : "https://www.example.co.kr/"
            }
            required
          />
          <p className="text-xs text-muted-foreground">
            {kind === "RSS"
              ? "RSS가 있는 언론사라면 이 방식이 가장 정확합니다. (많은 지역신문이 /rss/allArticle.xml 주소를 제공합니다)"
              : "최신 기사 링크가 보이는 페이지 — 보통 언론사 홈 주소면 됩니다."}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keyword">필수 키워드</Label>
          <Input
            id="keyword"
            name="keyword"
            defaultValue={source?.keyword ?? "담양"}
            placeholder="담양"
          />
          <p className="text-xs text-muted-foreground">
            제목이나 요약에 이 단어가 있는 기사만 가져옵니다. 여러 개는 쉼표로 구분(하나라도
            포함되면 수집), 비워두면 모든 기사를 가져옵니다.
          </p>
        </div>

        <details className="rounded-md border border-border p-4" open={Boolean(source?.link_pattern || source?.date_pattern)}>
          <summary className="cursor-pointer text-sm font-medium">고급 설정</summary>
          <div className="mt-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="charset">문자 인코딩</Label>
              <Select name="charset" defaultValue={source?.charset ?? "utf-8"}>
                <SelectTrigger id="charset" className="w-48">
                  <SelectValue>
                    {(value: string) => (value === "euc-kr" ? "EUC-KR 강제" : "자동 감지")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utf-8">자동 감지</SelectItem>
                  <SelectItem value="euc-kr">EUC-KR 강제</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">미리보기에서 제목이 깨져 보일 때만 바꾸세요.</p>
            </div>

            {kind === "HTML" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="linkPattern">기사 링크 정규식</Label>
                  <Input
                    id="linkPattern"
                    name="linkPattern"
                    defaultValue={source?.link_pattern ?? ""}
                    placeholder="비워두면 자동 감지"
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    비워두면 articleView.html?idxno=, wr_id=, /숫자 형태의 기사 링크를 자동으로
                    찾습니다. 직접 지정할 때는 첫 번째 괄호 ( ) 안이 기사 주소가 되게 작성하세요.
                    예: <code>href=&quot;(/news/articleView\.html\?idxno=\d+)&quot;</code>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="datePattern">작성일 정규식</Label>
                  <Input
                    id="datePattern"
                    name="datePattern"
                    defaultValue={source?.date_pattern ?? ""}
                    placeholder="비워두면 자동 감지"
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    비워두면 기사 페이지의 발행시각 메타 정보를 사용합니다. 날짜를 못 찾으면 날짜
                    필터 없이 최신 기사 순으로 가져옵니다.
                  </p>
                </div>
              </>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="sortOrder">표시 순서</Label>
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                defaultValue={source?.sort_order ?? 0}
                className="w-24"
              />
            </div>
          </div>
        </details>

        <div className="flex items-center gap-3">
          <Switch id="enabled" name="enabled" defaultChecked={source?.enabled ?? true} />
          <Label htmlFor="enabled">자동 수집 사용</Label>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handlePreview} disabled={previewing}>
            <Eye className="size-4" aria-hidden />
            {previewing ? "확인 중..." : "미리보기"}
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "저장 중..." : submitLabel}
          </Button>
        </div>
      </form>

      {preview ? <PreviewResult preview={preview} /> : null}
    </div>
  );
}

function PreviewResult({ preview }: { preview: SourcePreview }) {
  const newCount = preview.articles.filter((a) => a.status === "new").length;

  return (
    <section className="space-y-3 rounded-md border border-border p-4">
      <div>
        <h2 className="font-semibold text-foreground">미리보기 결과</h2>
        {preview.error ? (
          <p className="mt-1 text-sm text-destructive">{preview.error}</p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">
            기사 링크 {preview.linksFound}개 발견 · 최신 {preview.articles.length}개 확인 · 지금
            수집하면 {newCount}건이 추가됩니다. (실제로 저장되지는 않았습니다)
          </p>
        )}
      </div>

      {preview.articles.length ? (
        <ul className="divide-y divide-border text-sm">
          {preview.articles.map((article) => {
            const status = STATUS_LABELS[article.status];
            return (
              <li key={article.url} className="flex items-start gap-3 py-2">
                <Badge variant={status.variant} className="mt-0.5 shrink-0">
                  {status.label}
                </Badge>
                <div className="min-w-0 flex-1">
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate font-medium text-foreground hover:underline"
                  >
                    {article.title ?? article.url}
                  </a>
                  <p className="truncate text-xs text-muted-foreground">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })
                      : "작성일 모름"}{" "}
                    · {article.url}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
