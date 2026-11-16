import type { Metadata } from "next";
import { getAssocContext, todayKST } from "@/lib/assoc/data";
import { getSiteUrl } from "@/lib/site/get-site-url";
import { AssocHeader } from "@/components/assoc/AssocHeader";
import { AssocFooter } from "@/components/assoc/AssocFooter";
import { AssocPopup } from "@/components/assoc/AssocPopup";

export async function generateMetadata(): Promise<Metadata> {
  const { site, settings, config } = await getAssocContext();
  const title = settings?.seo_title ?? `${site.name} | ${config.englishName}`;
  const description = settings?.seo_description ?? site.description ?? undefined;
  const url = await getSiteUrl(site.slug);
  const ogImage = settings?.og_image ?? config.defaultSlides[0]?.image;
  return {
    metadataBase: new URL(url),
    title: { default: title, template: `%s | ${site.name}` },
    description,
    openGraph: {
      title,
      description,
      siteName: site.name,
      locale: "ko_KR",
      type: "website",
      url,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function AssocLayout({ children }: { children: React.ReactNode }) {
  const { site, extra, config } = await getAssocContext();
  const popup = extra.popup;
  const today = todayKST();
  const showPopup =
    popup?.enabled &&
    (popup.title || popup.content || popup.image) &&
    (!popup.startDate || popup.startDate <= today) &&
    (!popup.endDate || popup.endDate >= today);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: site.name,
    alternateName: config.englishName,
    sport: "Basketball",
    url: await getSiteUrl(site.slug),
    ...(site.phone ? { telephone: site.phone } : {}),
    ...(site.email ? { email: site.email } : {}),
    ...(site.address ? { address: site.address } : {}),
  };

  return (
    <div className="assoc-theme flex min-h-screen flex-col bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AssocHeader name={site.name} englishName={config.englishName} logoUrl={site.logo_url} nav={config.nav} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <AssocFooter
        info={{
          name: site.name,
          englishName: config.englishName,
          slogan: config.slogan,
          logoUrl: site.logo_url,
          address: site.address,
          phone: site.phone,
          email: site.email,
          instagram: site.instagram_url,
          facebook: site.facebook_url,
          youtube: extra.youtubeUrl,
          blog: extra.blogUrl ?? site.website_url,
        }}
      />
      {showPopup ? (
        <AssocPopup
          id={`${popup.title ?? ""}${popup.startDate ?? ""}`}
          title={popup.title}
          content={popup.content}
          image={popup.image}
          link={popup.link}
        />
      ) : null}
    </div>
  );
}
