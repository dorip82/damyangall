import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NEWS_CATEGORIES, getNewsCategoryLabel } from "@/lib/news/categories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { FilterPills } from "@/components/admin/FilterPills";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { StatusToggleBadge } from "@/components/admin/StatusToggleBadge";
import { FetchNewsButton } from "@/components/admin/FetchNewsButton";
import { toggleNewsStatus } from "@/app/directory/admin/(protected)/news/actions";
import type { NewsCategory } from "@/types/database";

const PAGE_SIZE = 20;
// The "지금 수집하기" Server Action ends up calling the same
// runNewsFetch() as the cron route, which needs to run out of Seoul —
// see app/api/cron/fetch-news/route.ts for why.
export const preferredRegion = "icn1";
const STATUS_OPTIONS = [
  { value: "", label: "전체" },
  { value: "PUBLISHED", label: "게시됨" },
  { value: "HIDDEN", label: "숨김" },
];

function buildHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `/directory/admin/news?${qs}` : "/directory/admin/news";
}

export default async function AdminNewsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>;
}) {
  const { q, status, category, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1) || 1);
  const safeQuery = (q ?? "").replace(/[,()%*]/g, "").trim();
  const from = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  let query = supabase
    .from("news")
    .select("id, category, title, status, created_at, source_type, source_name", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (status === "PUBLISHED" || status === "HIDDEN") query = query.eq("status", status);
  if (category) query = query.eq("category", category as NewsCategory);
  if (safeQuery) query = query.ilike("title", `%${safeQuery}%`);

  const { data: newsList, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const currentParams = { q, status, category };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">담양소식</h1>
          <p className="mt-1 text-sm text-muted-foreground">전체 {count ?? 0}건</p>
        </div>
        <div className="flex gap-2">
          <FetchNewsButton />
          <Button render={<Link href="/directory/admin/news/new" />}>
            <Plus className="size-4" /> 새 소식 등록
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills
          options={STATUS_OPTIONS}
          active={status}
          buildHref={(v) => buildHref({ ...currentParams, status: v, page: undefined })}
        />
        <AdminSearchInput
          action="/directory/admin/news"
          defaultValue={q}
          placeholder="제목 검색"
          hiddenParams={{ status, category }}
        />
      </div>

      <FilterPills
        options={[{ value: "", label: "전체 카테고리" }, ...NEWS_CATEGORIES]}
        active={category}
        buildHref={(v) => buildHref({ ...currentParams, category: v, page: undefined })}
      />

      {!newsList?.length ? (
        <p className="text-sm text-muted-foreground">조건에 맞는 소식이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {newsList.map((news) => (
            <li
              key={news.id}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted"
            >
              <Link href={`/directory/admin/news/${news.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-foreground">{news.title}</p>
                  {news.source_type === "EXTERNAL" ? (
                    <Badge variant="secondary" className="shrink-0">
                      {news.source_name ?? "자동수집"}
                    </Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {getNewsCategoryLabel(news.category)} ·{" "}
                  {new Date(news.created_at).toLocaleDateString("ko-KR")}
                </p>
              </Link>
              <StatusToggleBadge
                status={news.status}
                onToggle={toggleNewsStatus.bind(null, news.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        buildHref={(p) => buildHref({ ...currentParams, page: String(p) })}
      />
    </div>
  );
}
