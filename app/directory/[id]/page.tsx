import Link from "next/link";
import { notFound } from "next/navigation";
import { Phone, MapPin, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCategoryLabel } from "@/lib/directory/categories";
import { PortalHeader } from "@/components/main/PortalHeader";
import { PortalFooter } from "@/components/main/PortalFooter";
import { InstagramIcon } from "@/components/site/InstagramIcon";
import { FavoriteButton } from "@/components/site/FavoriteButton";
import { getFavoritedIds } from "@/lib/favorites/get-favorited-ids";
import type { DirectoryListing } from "@/types/directory";

export const dynamic = "force-dynamic";

export default async function DirectoryListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("directory_listings")
    .select("*")
    .eq("id", id)
    .eq("status", "PUBLISHED")
    .maybeSingle<DirectoryListing>();

  if (!listing) notFound();

  const [favoritedIds, { data: userData }] = await Promise.all([
    getFavoritedIds("DIRECTORY_LISTING"),
    supabase.auth.getUser(),
  ]);

  return (
    <div className="site-theme flex min-h-screen flex-col bg-background text-foreground">
      <PortalHeader />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16">
          <Link
            href="/directory"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            목록으로
          </Link>

          <div className="relative mb-6 aspect-video w-full">
            {listing.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.image_url}
                alt=""
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-muted text-sm text-muted-foreground">
                사진 준비중
              </div>
            )}
            <FavoriteButton
              targetType="DIRECTORY_LISTING"
              targetId={listing.id}
              initialFavorited={favoritedIds.has(listing.id)}
              isLoggedIn={Boolean(userData.user)}
              className="absolute top-3 right-3 size-10"
            />
          </div>

          <span className="mb-2 inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
            {getCategoryLabel(listing.category)}
          </span>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            {listing.name}
          </h1>

          {listing.description ? (
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-foreground/80">
              {listing.description}
            </p>
          ) : null}

          <div className="mt-4">
            {listing.instagram_url ? (
              <a
                href={listing.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="인스타그램"
                className="inline-flex size-9 items-center justify-center rounded-full border border-border text-foreground/70 transition-colors hover:border-accent hover:text-accent"
              >
                <InstagramIcon className="size-5" />
              </a>
            ) : (
              <span
                aria-hidden
                className="inline-flex size-9 cursor-not-allowed items-center justify-center rounded-full border border-border text-foreground/25"
              >
                <InstagramIcon className="size-5" />
              </span>
            )}
          </div>

          {listing.phone || listing.address ? (
            <ul className="mt-6 space-y-2 border-t border-border pt-6 text-sm text-foreground/80">
              {listing.phone ? (
                <li className="flex items-center gap-2">
                  <Phone className="size-4 text-accent" aria-hidden />
                  <a href={`tel:${listing.phone}`}>{listing.phone}</a>
                </li>
              ) : null}
              {listing.address ? (
                <li className="flex items-center gap-2">
                  <MapPin className="size-4 text-accent" aria-hidden />
                  {listing.address}
                </li>
              ) : null}
            </ul>
          ) : null}
        </article>
      </main>
      <PortalFooter />
    </div>
  );
}
