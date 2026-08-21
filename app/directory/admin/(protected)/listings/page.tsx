import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DIRECTORY_CATEGORIES, getCategoryLabel } from "@/lib/directory/categories";
import { Button } from "@/components/ui/button";
import { AdminSearchInput } from "@/components/admin/AdminSearchInput";
import { FilterPills } from "@/components/admin/FilterPills";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { StatusToggleBadge } from "@/components/admin/StatusToggleBadge";
import { toggleListingStatus } from "@/app/directory/admin/(protected)/listings/actions";
import type { DirectoryCategory } from "@/types/database";

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
  return qs ? `/directory/admin/listings?${qs}` : "/directory/admin/listings";
}

export default async function DirectoryAdminListingsPage({
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
    .from("directory_listings")
    .select("id, category, name, status, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  if (status === "PUBLISHED" || status === "HIDDEN") query = query.eq("status", status);
  if (category) query = query.eq("category", category as DirectoryCategory);
  if (safeQuery) query = query.ilike("name", `%${safeQuery}%`);

  const { data: listings, count } = await query;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const currentParams = { q, status, category };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">업체 목록</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            전체 {count ?? 0}건
          </p>
        </div>
        <Button render={<Link href="/directory/admin/listings/new" />}>
          <Plus className="size-4" /> 새 업체 등록
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills
          options={STATUS_OPTIONS}
          active={status}
          buildHref={(v) => buildHref({ ...currentParams, status: v, page: undefined })}
        />
        <AdminSearchInput
          action="/directory/admin/listings"
          defaultValue={q}
          placeholder="업체명 검색"
          hiddenParams={{ status, category }}
        />
      </div>

      <FilterPills
        options={[{ value: "", label: "전체 카테고리" }, ...DIRECTORY_CATEGORIES]}
        active={category}
        buildHref={(v) => buildHref({ ...currentParams, category: v, page: undefined })}
      />

      {!listings?.length ? (
        <p className="text-sm text-muted-foreground">조건에 맞는 업체가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {listings.map((listing) => (
            <li
              key={listing.id}
              className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted"
            >
              <Link href={`/directory/admin/listings/${listing.id}`} className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{listing.name}</p>
                <p className="text-sm text-muted-foreground">
                  {getCategoryLabel(listing.category)}
                </p>
              </Link>
              <StatusToggleBadge
                status={listing.status}
                onToggle={toggleListingStatus.bind(null, listing.id)}
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
