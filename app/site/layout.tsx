import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nanum_Brush_Script, Nanum_Pen_Script } from "next/font/google";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { createClient } from "@/lib/supabase/server";
import { ClubHeader, type ClubNavItem } from "@/components/club/ClubHeader";
import { ClubFooter } from "@/components/club/ClubFooter";
import { getClubPreset } from "@/lib/site/club-preset";
import { resolveClubContact } from "@/lib/site/contact";
import type { SiteSettings, SiteMenu, SitePage } from "@/types/site";

// 한글 손글씨 폰트는 파일이 커서 미리 불러오지 않고(preload: false),
// 글자가 보일 때 필요한 조각만 내려받는다 (Google Fonts unicode-range).
const handFont = Nanum_Pen_Script({
  weight: "400",
  variable: "--font-hand",
  display: "swap",
  preload: false,
});
const brushFont = Nanum_Brush_Script({
  weight: "400",
  variable: "--font-brush",
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const slug = await getCurrentSiteSlug();
  if (!slug) return {};
  const site = await getSiteBySlug(slug);
  if (!site) return {};

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("seo_title, seo_description, og_image")
    .eq("site_id", site.id)
    .maybeSingle();

  const preset = getClubPreset(slug);
  const title = settings?.seo_title ?? `${site.name} | 올담`;
  const description = settings?.seo_description ?? site.description ?? undefined;
  const ogImage = settings?.og_image ?? preset.defaultSlides?.[0]?.image;

  return {
    title: { default: title, template: `%s | ${site.name}` },
    description,
    openGraph: {
      title,
      description,
      siteName: site.name,
      locale: "ko_KR",
      type: "website",
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const slug = await getCurrentSiteSlug();
  if (!slug) notFound();

  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const [{ data: settings }, { data: menus }, { data: homePage }] = await Promise.all([
    supabase
      .from("site_settings")
      .select("*")
      .eq("site_id", site.id)
      .maybeSingle<SiteSettings>(),
    supabase
      .from("site_menus")
      .select("*")
      .eq("site_id", site.id)
      .order("sort_order")
      .returns<SiteMenu[]>(),
    supabase
      .from("site_pages")
      .select("content")
      .eq("site_id", site.id)
      .eq("is_home", true)
      .maybeSingle<Pick<SitePage, "content">>(),
  ]);

  const preset = getClubPreset(slug);
  const contact = resolveClubContact(site, settings ?? null, homePage?.content?.blocks ?? []);

  // 메뉴 순서·노출 여부·주소는 관리자에서 관리하는 site_menus 를 따르고,
  // 이름 바꾸기와 드롭다운 하위 메뉴만 프리셋에서 덧붙인다.
  const nav: ClubNavItem[] = (menus ?? [])
    .filter((m) => m.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => ({
      label: preset.nav?.[m.url]?.label ?? m.title,
      href: m.url,
      children: preset.nav?.[m.url]?.children,
    }));

  return (
    <div
      className={`site-theme club-theme ${handFont.variable} ${brushFont.variable} flex min-h-screen flex-col bg-background text-foreground`}
    >
      <ClubHeader
        name={site.name}
        tagline={preset.tagline}
        englishName={preset.englishName}
        slogan={preset.headerSlogan}
        nav={nav}
      />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <ClubFooter
        name={site.name}
        tagline={preset.tagline}
        englishName={preset.englishName}
        slogan={preset.footerSlogan}
        region={preset.region}
        contact={contact}
      />
    </div>
  );
}
