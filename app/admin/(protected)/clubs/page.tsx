import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAssocAdmin } from "@/lib/assoc/admin";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export default async function AdminClubsPage() {
  const { site } = await requireAssocAdmin();
  const supabase = await createClient();
  const { data: clubs } = await supabase.from("site_clubs").select("*").eq("site_id", site.id).order("sort_order").order("name");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">동호회</h1>
          <p className="mt-1 text-sm text-muted-foreground">생활농구 &gt; 농구 동호회 안내에 표시되는 동호회 정보입니다.</p>
        </div>
        <Link href="/admin/clubs/new" className={buttonVariants()}>
          <Plus className="size-4" /> 동호회 등록
        </Link>
      </div>
      {clubs?.length ? (
        <ul className="divide-y divide-border rounded-md border border-border">
          {clubs.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/clubs/${c.id}`} className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-muted">
                <span className="font-medium">{c.name}</span>
                {c.is_recruiting ? <Badge>모집중</Badge> : null}
                {!c.is_published ? <Badge variant="outline">비공개</Badge> : null}
                <span className="ml-auto text-sm text-muted-foreground">{c.location ?? ""}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">등록된 동호회가 없습니다.</p>
      )}
    </div>
  );
}
