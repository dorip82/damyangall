import type { Metadata } from "next";
import { getAssocContext, loadClubs } from "@/lib/assoc/data";
import { ClubCard } from "@/components/assoc/ClubCard";
import { AssocContainer, AssocPageHeader, EmptyState } from "@/components/assoc/ui";

export const metadata: Metadata = {
  title: "농구 동호회 안내",
  description: "담양군에서 활동하는 농구 동호회의 활동 장소, 정기 일정, 가입 문의 안내입니다.",
  alternates: { canonical: "/life/clubs" },
};

export default async function ClubsPage() {
  const { site, config } = await getAssocContext();
  const section = config.nav.find((n) => n.href === "/life")!;
  const clubs = await loadClubs(site.id);

  return (
    <>
      <AssocPageHeader
        section={section}
        title="농구 동호회 안내"
        description="담양군에서 활동하는 농구 동호회를 소개합니다. 가까운 동호회에 가입해 함께 농구를 즐겨보세요."
        current="/life/clubs"
      />
      <AssocContainer>
        {clubs.length ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              등록된 동호회 <strong className="text-primary">{clubs.length}</strong>곳
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {clubs.map((c) => (
                <ClubCard key={c.id} club={c} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            title="등록된 동호회가 없습니다"
            description="동호회 정보가 등록되면 이곳에 표시됩니다. 동호회 등록을 원하시면 협회에 문의해 주세요."
          />
        )}
      </AssocContainer>
    </>
  );
}
