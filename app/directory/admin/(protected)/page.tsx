import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCategoryLabel } from "@/lib/directory/categories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function DirectoryAdminListPage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("directory_listings")
    .select("id, category, name, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">업체 목록</h1>
        <Button render={<Link href="/directory/admin/new" />}>
          <Plus className="size-4" /> 새 업체 등록
        </Button>
      </div>

      {!listings?.length ? (
        <p className="text-sm text-muted-foreground">등록된 업체가 없습니다.</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {listings.map((listing) => (
            <li key={listing.id}>
              <Link
                href={`/directory/admin/${listing.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-muted"
              >
                <div>
                  <p className="font-medium text-foreground">{listing.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getCategoryLabel(listing.category)}
                  </p>
                </div>
                <Badge variant={listing.status === "PUBLISHED" ? "default" : "outline"}>
                  {listing.status === "PUBLISHED" ? "게시됨" : "숨김"}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
