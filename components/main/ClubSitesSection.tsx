import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site/get-site-url";

export async function ClubSitesSection() {
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
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
        동아리·동호회
      </h2>
      <p className="mb-8 text-sm text-muted-foreground">
        담양에서 활동하는 동아리와 동호회의 홈페이지를 만나보세요.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((site) => (
          <a
            key={site.id}
            href={site.url}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            {site.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.logo_url} alt="" className="mb-4 h-12 w-auto object-contain" />
            ) : null}
            {site.subcategory ? (
              <span className="mb-2 w-fit rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                {site.subcategory}
              </span>
            ) : null}
            <p className="flex items-center gap-1 font-semibold text-card-foreground">
              {site.name}
              <ArrowUpRight
                className="size-4 text-muted-foreground transition-colors group-hover:text-accent"
                aria-hidden
              />
            </p>
            {site.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {site.description}
              </p>
            ) : null}
          </a>
        ))}
      </div>
    </section>
  );
}
