import type { Metadata } from "next";
import Link from "next/link";
import { formatPeriod, getAssocContext, loadTournaments } from "@/lib/assoc/data";
import { PhotoLightbox } from "@/components/club/PhotoLightbox";
import { AssocContainer, AssocPageHeader, EmptyState } from "@/components/assoc/ui";

export const metadata: Metadata = {
  title: "대회 사진",
  description: "담양군농구협회 대회 사진입니다.",
  alternates: { canonical: "/tournament/photos" },
};

export default async function TournamentPhotosPage() {
  const { site, config } = await getAssocContext();
  const section = config.nav.find((n) => n.href === "/tournament")!;
  const tournaments = (await loadTournaments(site.id)).filter((t) => t.photo_urls.length);

  return (
    <>
      <AssocPageHeader section={section} title="대회 사진" description="대회 현장의 모습을 사진으로 만나보세요." current="/tournament/photos" />
      <AssocContainer className="space-y-14">
        {tournaments.length ? (
          tournaments.map((t) => (
            <section key={t.id} aria-labelledby={`ph-${t.id}`}>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={`ph-${t.id}`} className="text-xl font-extrabold text-primary">
                  <Link href={`/tournament/${t.id}`} className="hover:underline">
                    {t.title}
                  </Link>
                </h2>
                <p className="text-sm text-muted-foreground">{formatPeriod(t.start_date, t.end_date)}</p>
              </div>
              <PhotoLightbox photos={t.photo_urls.map((url) => ({ url, caption: t.title }))} />
            </section>
          ))
        ) : (
          <EmptyState
            title="등록된 대회 사진이 없습니다"
            description="대회가 끝난 뒤 사진이 등록되면 이곳에 표시됩니다. 협회 행사 사진은 사진 갤러리에서 볼 수 있습니다."
          />
        )}
      </AssocContainer>
    </>
  );
}
