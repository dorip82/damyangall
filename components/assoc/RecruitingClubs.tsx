import { getAssocContext, loadClubs } from "@/lib/assoc/data";
import { ClubCard } from "@/components/assoc/ClubCard";
import { SectionTitle } from "@/components/assoc/ui";

/** 회원 모집 안내 페이지 하단 — "회원 모집중"으로 표시된 동호회 */
export async function RecruitingClubs() {
  const { site } = await getAssocContext();
  const clubs = (await loadClubs(site.id)).filter((c) => c.is_recruiting);
  if (!clubs.length) return null;
  return (
    <section className="mt-14" aria-labelledby="recruiting-clubs">
      <SectionTitle id="recruiting-clubs" title="회원 모집중인 동호회" moreHref="/life/clubs" moreLabel="전체 동호회" />
      <div className="grid gap-5 sm:grid-cols-2">
        {clubs.map((c) => (
          <ClubCard key={c.id} club={c} />
        ))}
      </div>
    </section>
  );
}
