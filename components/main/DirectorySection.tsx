import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCategoryLabel } from "@/lib/directory/categories";

export async function DirectorySection() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("directory_listings")
    .select("id, category, name, description, image_url")
    .eq("status", "PUBLISHED")
    .order("created_at", { ascending: false })
    .limit(6);

  if (!listings?.length) return null;

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">지역정보</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            담양의 카페, 음식점, 생활 정보를 만나보세요.
          </p>
        </div>
        <Link
          href="/directory"
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          더보기
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/directory/${listing.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            {listing.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.image_url}
                alt=""
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                사진 준비중
              </div>
            )}
            <div className="p-4">
              <span className="mb-1 inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                {getCategoryLabel(listing.category)}
              </span>
              <p className="font-semibold text-card-foreground">{listing.name}</p>
              {listing.description ? (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {listing.description}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
