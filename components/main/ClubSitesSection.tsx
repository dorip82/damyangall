import { ArrowUpRight, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site/get-site-url";

/** 업체·단체 찾기 섹션 하단의 동아리·동호회 홈페이지 목록. 운영 중인 사이트가 없으면 숨긴다. */
export async function ClubSitesList() {
  const supabase = await createClient();
  const { data: sites } = await supabase
    .from("sites")
    .select("id, name, slug, category, subcategory, description, logo_url")
    .eq("status", "ACTIVE")
    .order("published_at", { ascending: false });

  if (!sites?.length) return null;

  const cards = await Promise.all(
    sites.map(async (site) => ({ ...site, url: await getSiteUrl(site.slug) }))
  );

  return (
    <div className="mt-12">
      <h3 className="mb-1 text-xl font-bold tracking-tight text-foreground">동아리·동호회</h3>
      <p className="mb-5 text-sm text-muted-foreground">
        담양에서 활동하는 동아리와 동호회의 홈페이지를 방문해보세요.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((site) => (
          <li key={site.id}>
            <a
              href={site.url}
              className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-[0_2px_10px_rgba(27,42,34,0.05)] transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(27,42,34,0.12)]"
            >
              <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-primary">
                {site.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={site.logo_url} alt={`${site.name} 로고`} className="h-full w-full object-contain p-1" />
                ) : (
                  <Users className="size-5" aria-hidden />
                )}
              </span>
              <span className="min-w-0 flex-1">
                {site.subcategory ? (
                  <span className="mb-1 inline-block rounded-full bg-accent/12 px-2.5 py-0.5 text-xs font-semibold text-accent">
                    {site.subcategory}
                  </span>
                ) : null}
                <span className="flex items-center gap-1 font-bold text-card-foreground">
                  {site.name}
                  <ArrowUpRight
                    className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
                    aria-hidden
                  />
                </span>
                {site.description ? (
                  <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">
                    {site.description}
                  </span>
                ) : null}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
