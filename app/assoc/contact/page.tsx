import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { getAssocContext } from "@/lib/assoc/data";
import { InquiryForm } from "@/components/assoc/forms";
import { AssocContainer, AssocPageHeader } from "@/components/assoc/ui";

export const metadata: Metadata = {
  title: "문의하기",
  description: "담양군농구협회에 일반 문의, 대회 문의, 동호회 가입 문의, 제휴·협력 문의를 남겨주세요.",
  alternates: { canonical: "/contact" },
};

const TYPE_HREF: Record<string, string> = {
  general: "/contact?type=general",
  tournament: "/contact?type=tournament",
  club: "/contact?type=club",
  partner: "/contact?type=partner",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string; club?: string }> }) {
  const { type, club } = await searchParams;
  const { site, config } = await getAssocContext();
  const section = config.nav.find((n) => n.href === "/contact")!;
  const current = (type && TYPE_HREF[type]) || "/contact?type=general";

  return (
    <>
      <AssocPageHeader
        section={section}
        title="문의하기"
        description="궁금한 점을 남겨주시면 담당자가 확인 후 연락드립니다. 문의 내용은 공개되지 않습니다."
        current={current}
      />
      <AssocContainer className="grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <InquiryForm
          types={config.inquiryTypes}
          defaultType={type}
          defaultTitle={club ? `${club.slice(0, 60)} 가입 문의` : undefined}
        />
        <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
          <div className="on-dark rounded-2xl bg-[var(--dba-navy)] p-6 text-white">
            <p className="text-lg font-extrabold">{site.name}</p>
            {site.phone || site.email ? (
              <ul className="mt-4 space-y-3 text-[15px]">
                {site.phone ? (
                  <li>
                    <a href={`tel:${site.phone.replace(/[^\d+]/g, "")}`} className="flex items-center gap-2.5 hover:underline">
                      <Phone className="size-4 text-[var(--dba-orange)]" aria-hidden />
                      {site.phone}
                    </a>
                  </li>
                ) : null}
                {site.email ? (
                  <li>
                    <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 break-all hover:underline">
                      <Mail className="size-4 text-[var(--dba-orange)]" aria-hidden />
                      {site.email}
                    </a>
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-white/75">대표 연락처는 등록 준비 중입니다. 이 양식으로 문의를 남겨주세요.</p>
            )}
            {site.address ? <p className="mt-4 text-sm text-white/75">{site.address}</p> : null}
          </div>
          <p className="rounded-2xl bg-[var(--dba-soft)] p-5 text-sm leading-relaxed text-muted-foreground">
            대회 참가는 문의 대신{" "}
            <a href="/tournament/apply" className="font-bold text-primary underline">
              참가 신청
            </a>{" "}
            페이지에서 바로 접수할 수 있습니다.
          </p>
        </aside>
      </AssocContainer>
    </>
  );
}
