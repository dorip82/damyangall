import { notFound } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { HeroSlider } from "@/components/club/HeroSlider";
import { AboutCard, ActivityCard, ContactCard, HomeCardsSection } from "@/components/club/HomeCards";
import { getClubPreset } from "@/lib/site/club-preset";
import { resolveClubContact } from "@/lib/site/contact";
import { loadClubPosts } from "@/lib/site/load-posts";
import type { AnyBlock, SliderSlide } from "@/lib/blocks/types";
import type { SitePage, SiteSettings } from "@/types/site";

/**
 * 동아리 홈: 메인 슬라이드 → 3단 카드(동아리 소개 / 활동소식 / 문의) → 그 밖의 홈 블록.
 *
 * 슬라이드는 홈 페이지의 "메인 슬라이드" 블록 → 프리셋 기본 슬라이드 → 기존 히어로
 * 블록 순으로 정한다. 히어로·문의·활동소식 카드 블록은 위 카드가 같은 내용을
 * 보여주므로 아래에서 다시 그리지 않고, 나머지(소개 글, SNS 등)는 그대로 이어 붙인다.
 */
export default async function SiteHomePage() {
  const slug = await getCurrentSiteSlug();
  if (!slug) notFound();

  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const [{ data: page }, { data: settings }, posts] = await Promise.all([
    supabase
      .from("site_pages")
      .select("*")
      .eq("site_id", site.id)
      .eq("is_home", true)
      .maybeSingle<SitePage>(),
    supabase
      .from("site_settings")
      .select("show_phone, show_address")
      .eq("site_id", site.id)
      .maybeSingle<Pick<SiteSettings, "show_phone" | "show_address">>(),
    loadClubPosts(site.id, 20),
  ]);

  if (!page) notFound();

  const blocks = page.content.blocks;
  const preset = getClubPreset(slug);
  const contact = resolveClubContact(site, settings ?? null, blocks);

  const sliderBlock = blocks.find((b) => b.type === "slider");
  const heroBlock = blocks.find((b) => b.type === "hero");
  const slides: SliderSlide[] =
    sliderBlock?.type === "slider" && sliderBlock.props.slides?.length
      ? sliderBlock.props.slides
      : preset.defaultSlides?.length
        ? preset.defaultSlides
        : heroBlock?.type === "hero" && heroBlock.props.image
          ? [
              {
                image: heroBlock.props.image,
                title: heroBlock.props.title,
                subtitle: heroBlock.props.subtitle,
              },
            ]
          : [];
  const interval = sliderBlock?.type === "slider" ? sliderBlock.props.interval : undefined;

  const aboutChildren = preset.nav?.["/about"]?.children ?? [{ label: "동호회 소개", href: "/about" }];
  const aboutDescriptions: Record<string, string> = {
    "/about": "오카리나 동호회에 대해 알아보세요",
    "/about#officers": "함께해 온 역대 임원진을 만나보세요",
  };

  const restBlocks = blocks.filter(
    (b: AnyBlock) =>
      b.type !== "hero" &&
      b.type !== "slider" &&
      b.type !== "contact" &&
      !(b.type === "card" && b.props.source === "site_posts")
  );

  return (
    <>
      <h1 className="sr-only">
        {site.name}
        {preset.tagline ? ` - ${preset.tagline}` : ""}
      </h1>
      <HeroSlider slides={slides} interval={interval} />
      <HomeCardsSection>
        {[
          <AboutCard
            key="about"
            image={preset.aboutImage}
            links={aboutChildren.map((c) => ({
              ...c,
              description: aboutDescriptions[c.href] ?? "",
            }))}
          />,
          <ActivityCard key="activity" posts={posts} />,
          <ContactCard key="contact" contact={contact} />,
        ]}
      </HomeCardsSection>
      {restBlocks.length ? (
        <div className="bg-[var(--club-beige)] pb-6">
          <BlockRenderer blocks={restBlocks} siteId={site.id} />
        </div>
      ) : null}
    </>
  );
}
