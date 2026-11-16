import type { Metadata } from "next";
import Link from "next/link";
import { getAssocContext } from "@/lib/assoc/data";
import { INFO_SECTION } from "@/lib/assoc/config";
import { AssocContainer, AssocPageHeader } from "@/components/assoc/ui";

export const metadata: Metadata = { title: "사이트맵", alternates: { canonical: "/sitemap" } };

export default async function SitemapPage() {
  const { config } = await getAssocContext();
  return (
    <>
      <AssocPageHeader section={INFO_SECTION} title="사이트맵" current="/sitemap" />
      <AssocContainer>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...config.nav, INFO_SECTION].map((item) => (
            <li key={item.href + item.label} className="rounded-2xl border border-border bg-white p-6">
              <h2 className="border-b-2 border-primary pb-3 text-xl font-extrabold text-primary">
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </h2>
              <ul className="mt-4 space-y-2">
                {item.children.map((c) => (
                  <li key={c.href}>
                    <Link href={c.href} className="text-[15px] text-foreground/80 hover:text-[var(--dba-blue)] hover:underline">
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </AssocContainer>
    </>
  );
}
