import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { PageHeader } from "@/components/club/PageHeader";
import { OfficersSection } from "@/components/club/OfficersSection";
import { PhotoLightbox } from "@/components/club/PhotoLightbox";
import { getClubPreset } from "@/lib/site/club-preset";
import { loadClubPosts } from "@/lib/site/load-posts";
import type { SitePage } from "@/types/site";

async function loadPage(pageSlug: string) {
  const slug = await getCurrentSiteSlug();
  if (!slug) return null;
  const site = await getSiteBySlug(slug);
  if (!site) return null;

  const supabase = await createClient();
  const { data: page } = await supabase
    .from("site_pages")
    .select("*")
    .eq("site_id", site.id)
    .eq("slug", pageSlug)
    .eq("is_published", true)
    .maybeSingle<SitePage>();

  return page ? { slug, site, page } : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pageSlug: string }>;
}): Promise<Metadata> {
  const { pageSlug } = await params;
  const loaded = await loadPage(pageSlug);
  if (!loaded) return {};
  const label = getClubPreset(loaded.slug).nav?.[`/${pageSlug}`]?.label ?? loaded.page.title;
  return { title: label };
}

export default async function SiteSubPage({
  params,
}: {
  params: Promise<{ pageSlug: string }>;
}) {
  const { pageSlug } = await params;
  const loaded = await loadPage(pageSlug);
  if (!loaded) notFound();
  const { slug, site, page } = loaded;

  const preset = getClubPreset(slug);
  const navEntry = preset.nav?.[`/${pageSlug}`];
  const blocks = page.content.blocks;
  const isAbout = pageSlug === "about";

  // 동아리 소개 페이지: 활동 게시물에 올라온 사진을 모아 보여주고,
  // 역대 임원진 블록이 없으면 "준비 중" 영역을 덧붙여 #officers 링크가 늘 이어지게 한다.
  const photos = isAbout
    ? (await loadClubPosts(site.id)).flatMap((p) =>
        p.photos.map((ph) => ({ ...ph, caption: ph.caption ?? p.title }))
      )
    : [];
  const hasOfficers = blocks.some((b) => b.type === "officers");

  const tabs = isAbout
    ? [
        { label: "동호회 소개", href: "/about" },
        ...(photos.length ? [{ label: "활동 사진", href: "/about#photos" }] : []),
        { label: "역대 임원진", href: "/about#officers" },
      ]
    : undefined;

  return (
    <>
      <PageHeader
        eyebrow={preset.englishName ? `About ${site.name}` : undefined}
        title={navEntry?.label ?? page.title}
        description={isAbout ? site.description ?? undefined : undefined}
        tabs={tabs}
        activeHref={isAbout ? "/about" : undefined}
      />
      <div className="club-prose">
        <BlockRenderer blocks={blocks} siteId={site.id} />
      </div>

      {photos.length ? (
        <section id="photos" aria-labelledby="photos-title" className="scroll-mt-28 border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 id="photos-title" className="mb-8 text-3xl font-extrabold tracking-tight text-primary">
              동아리 활동 사진
            </h2>
            <PhotoLightbox photos={photos} limit={12} />
          </div>
        </section>
      ) : null}

      {isAbout && !hasOfficers ? <OfficersSection /> : null}
    </>
  );
}
