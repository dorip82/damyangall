import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { COMMUNITY_CATEGORIES, getCommunityCategoryLabel } from "@/lib/community/categories";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { FilterPills } from "@/components/admin/FilterPills";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { StatusToggleBadge } from "@/components/admin/StatusToggleBadge";
import { toggleCommunityPostVisibility } from "@/app/directory/admin/(protected)/community/actions";
import type { CommunityCategory } from "@/types/database";

const PAGE_SIZE = 20;
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
  return qs ? `/directory/admin/community?${qs}` : "/directory/admin/community";
}

export default async function AdminCommunityListPage({
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
    .from("community_posts")
    .select("id, category, title, author_name, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (status === "PUBLISHED" || status === "HIDDEN") query = query.eq("status", status);
  if (category) query = query.eq("category", category as CommunityCategory);
  if (safeQuery) query = query.ilike("title", `%${safeQuery}%`);

  const { data: posts, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const currentParams = { q, status, category };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">커뮤니티</h1>
        <p className="mt-1 text-sm text-muted-foreground">전체 {count ?? 0}건</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills
          options={STATUS_OPTIONS}
          active={status}
          buildHref={(v) => buildHref({ ...currentParams, status: v, page: undefined })}
        />
        <AdminSearchInput
          action="/directory/admin/community"
          defaultValue={q}
          placeholder="제목 검색"
          hiddenParams={{ status, category }}
        />
      </div>

      <FilterPills
        options={[{ value: "", label: "전체 게시판" }, ...COMMUNITY_CATEGORIES]}
        active={category}
        buildHref={(v) => buildHref({ ...currentParams, category: v, page: undefined })}
      />

      {!posts?.length ? (
        <p className="text-sm text-muted-foreground">조건에 맞는 글이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted"
            >
              <Link href={`/directory/admin/community/${post.id}`} className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{post.title}</p>
                <p className="text-sm text-muted-foreground">
                  {getCommunityCategoryLabel(post.category)} · {post.author_name} ·{" "}
                  {new Date(post.created_at).toLocaleDateString("ko-KR")}
                </p>
              </Link>
              <StatusToggleBadge
                status={post.status}
                onToggle={toggleCommunityPostVisibility.bind(null, post.id)}
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
