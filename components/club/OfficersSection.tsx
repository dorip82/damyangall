import { UserRound } from "lucide-react";
import type { OfficersBlockProps } from "@/lib/blocks/types";

/**
 * 역대 임원진 — 기수/연도별 카드. 데이터는 관리자 > 페이지 > 소개 의
 * "역대 임원진" 블록에서 입력한다. 등록된 정보가 없으면 안내 문구만 보인다
 * (임원진 이름을 임의로 채우지 않는다).
 */
export function OfficersSection({ title = "역대 임원진", terms }: Partial<OfficersBlockProps>) {
  const filled = (terms ?? []).filter((t) => t.label && t.members?.some((m) => m.name));

  return (
    <section id="officers" aria-labelledby="officers-title" className="scroll-mt-28 bg-[var(--club-beige)]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <p className="font-hand text-2xl text-[var(--club-green-dark)]">Officers</p>
        <h2 id="officers-title" className="mt-1 text-3xl font-extrabold tracking-tight text-primary">
          {title}
        </h2>
        <p className="mt-2 text-muted-foreground">소리향기를 이끌어 온 임원진을 연도별로 소개합니다.</p>

        {filled.length ? (
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filled.map((term) => (
              <li
                key={term.label}
                className="rounded-2xl border border-border bg-white p-6 shadow-[0_4px_18px_rgba(30,53,92,0.06)]"
              >
                <h3 className="flex items-center gap-2 text-lg font-bold text-primary">
                  <span aria-hidden className="h-5 w-1.5 rounded-full bg-[var(--club-green)]" />
                  {term.label}
                </h3>
                <dl className="mt-4 divide-y divide-border">
                  {term.members
                    .filter((m) => m.name)
                    .map((m, i) => (
                      <div key={m.role + m.name + i} className="flex items-center gap-3 py-2.5">
                        <UserRound className="size-4 shrink-0 text-[var(--club-green-dark)]" aria-hidden />
                        <dt className="w-20 shrink-0 text-sm text-muted-foreground">{m.role || "임원"}</dt>
                        <dd className="font-semibold text-foreground">{m.name}</dd>
                      </div>
                    ))}
                </dl>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-input bg-white px-6 py-10 text-center text-muted-foreground">
            역대 임원진 정보를 준비하고 있습니다.
          </p>
        )}
      </div>
    </section>
  );
}
