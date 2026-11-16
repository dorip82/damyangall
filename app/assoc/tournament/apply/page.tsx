import type { Metadata } from "next";
import Link from "next/link";
import { applicationState, formatPeriod, getAssocContext, loadTournaments } from "@/lib/assoc/data";
import { ApplicationForm } from "@/components/assoc/forms";
import { AssocContainer, AssocPageHeader, EmptyState } from "@/components/assoc/ui";

export const metadata: Metadata = {
  title: "참가 신청",
  description: "담양군농구협회 농구대회 온라인 참가 신청입니다.",
  alternates: { canonical: "/tournament/apply" },
};

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const { site, config } = await getAssocContext();
  const section = config.nav.find((n) => n.href === "/tournament")!;
  const open = (await loadTournaments(site.id)).filter((x) => applicationState(x) === "OPEN");

  return (
    <>
      <AssocPageHeader
        section={section}
        title="참가 신청"
        description="접수 중인 대회에 온라인으로 참가를 신청하세요. 협회 확인 후 승인 여부를 연락드립니다."
        current="/tournament/apply"
      />
      <AssocContainer className="max-w-3xl">
        {open.length ? (
          <ApplicationForm
            tournaments={open.map((x) => ({ id: x.id, title: x.title, period: formatPeriod(x.start_date, x.end_date) }))}
            defaultTournamentId={open.some((x) => x.id === t) ? t : undefined}
          />
        ) : (
          <EmptyState title="현재 접수 중인 대회가 없습니다" description="대회 접수가 시작되면 이 페이지에서 신청할 수 있습니다.">
            <Link href="/tournament/schedule" className="inline-flex h-11 items-center rounded-full bg-primary px-6 font-bold text-primary-foreground">
              대회 일정 보기
            </Link>
          </EmptyState>
        )}
      </AssocContainer>
    </>
  );
}
