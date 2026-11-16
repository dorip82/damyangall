import type { Metadata } from "next";
import { getAssocContext, loadPageBlocks } from "@/lib/assoc/data";
import { INFO_SECTION } from "@/lib/assoc/config";
import { AssocBlocks } from "@/components/assoc/AssocBlocks";
import { AssocContainer, AssocPageHeader } from "@/components/assoc/ui";

export interface ContentPageDef {
  section: string;
  title: string;
  pageSlug: string;
  current: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function contentMetadata(def: ContentPageDef): Metadata {
  return { title: def.title, description: def.description, alternates: { canonical: def.current } };
}

/** 관리자 "페이지"에서 내용을 채우는 서브페이지 (인사말, 소개, 조직도, 연혁 …) */
export async function ContentPage({ def, children }: { def: ContentPageDef; children?: React.ReactNode }) {
  const { site, config } = await getAssocContext();
  const section = def.section === INFO_SECTION.href ? INFO_SECTION : (config.nav.find((n) => n.href === def.section) ?? config.nav[0]);
  const blocks = await loadPageBlocks(site.id, def.pageSlug);
  return (
    <>
      <AssocPageHeader section={section} title={def.title} description={def.description} current={def.current} />
      <AssocContainer className="max-w-5xl">
        <AssocBlocks
          blocks={blocks}
          siteId={site.id}
          emptyTitle={def.emptyTitle}
          emptyDescription={def.emptyDescription}
        />
        {children}
      </AssocContainer>
    </>
  );
}
