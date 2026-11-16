import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Site } from "@/types/site";

/** 7일 전 시각 (요청마다 새로 계산되는 서버 컴포넌트라 괜찮다) */
function sevenDaysAgo() {
  return new Date(Date.now() - 7 * 86400 * 1000).toISOString();
}

const APP_LABEL = { PENDING: "대기", APPROVED: "승인", REJECTED: "반려" } as const;

/** 협회형 사이트 관리자 대시보드 */
export async function AssocDashboard({ site }: { site: Site }) {
  const supabase = await createClient();
  const weekAgo = sevenDaysAgo();
  const head = { count: "exact" as const, head: true };
  const [posts, newInquiries, unanswered, pendingApps, totalApps, recentPosts, recentApps, tournaments] = await Promise.all([
    supabase.from("site_posts").select("*", head).eq("site_id", site.id),
    supabase.from("site_inquiries").select("*", head).eq("site_id", site.id).gte("created_at", weekAgo),
    supabase.from("site_inquiries").select("*", head).eq("site_id", site.id).is("reply_content", null),
    supabase.from("site_tournament_applications").select("*", head).eq("site_id", site.id).eq("status", "PENDING"),
    supabase.from("site_tournament_applications").select("*", head).eq("site_id", site.id),
    supabase.from("site_posts").select("id, title, category, status, created_at").eq("site_id", site.id).order("created_at", { ascending: false }).limit(5),
    supabase
      .from("site_tournament_applications")
      .select("id, team_name, status, created_at, tournament_id")
      .eq("site_id", site.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("site_tournaments").select("id, title").eq("site_id", site.id),
  ]);
  const tTitle = new Map((tournaments.data ?? []).map((t) => [t.id, t.title]));

  const stats = [
    { label: "전체 게시글", value: posts.count ?? 0, href: "/admin/posts" },
    { label: "신규 문의 (7일)", value: newInquiries.count ?? 0, href: "/admin/inquiries", sub: `미답변 ${unanswered.count ?? 0}건` },
    { label: "참가 신청 대기", value: pendingApps.count ?? 0, href: "/admin/tournaments", sub: `전체 ${totalApps.count ?? 0}건` },
    { label: "등록 대회", value: tournaments.data?.length ?? 0, href: "/admin/tournaments" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-foreground">대시보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">상태: {site.status === "ACTIVE" ? "게시됨" : site.status}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                {s.sub ? <p className="mt-1 text-xs text-muted-foreground">{s.sub}</p> : null}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">최근 등록 게시글</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPosts.data?.length ? (
              <ul className="divide-y divide-border text-sm">
                {recentPosts.data.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/posts/${p.id}`} className="flex items-center gap-2 py-2 hover:underline">
                      <Badge variant="secondary">{p.category}</Badge>
                      <span className="min-w-0 flex-1 truncate">{p.title}</span>
                      {p.status !== "PUBLISHED" ? <Badge variant="outline">임시</Badge> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">아직 게시글이 없습니다.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">최근 참가 신청</CardTitle>
          </CardHeader>
          <CardContent>
            {recentApps.data?.length ? (
              <ul className="divide-y divide-border text-sm">
                {recentApps.data.map((a) => (
                  <li key={a.id}>
                    <Link href={`/admin/tournaments/${a.tournament_id}`} className="flex items-center gap-2 py-2 hover:underline">
                      <Badge variant={a.status === "PENDING" ? "outline" : "secondary"}>{APP_LABEL[a.status]}</Badge>
                      <span className="font-medium">{a.team_name}</span>
                      <span className="min-w-0 flex-1 truncate text-muted-foreground">{tTitle.get(a.tournament_id)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">아직 참가 신청이 없습니다.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        {[
          ["/admin/posts/new", "공지 · 소식 등록"],
          ["/admin/tournaments/new", "대회 등록"],
          ["/admin/clubs/new", "동호회 등록"],
          ["/admin/files", "자료 올리기"],
          ["/admin/pages", "인사말 · 연혁 · 임원 편집"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="font-medium text-primary underline">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
