import { UserRound } from "lucide-react";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { PhotoLightbox } from "@/components/club/PhotoLightbox";
import { TimelineSection } from "@/components/blocks/TimelineSection";
import { EmptyState } from "@/components/assoc/ui";
import type { AnyBlock, OfficersBlockProps } from "@/lib/blocks/types";

/**
 * 협회 서브페이지 본문. 관리자 "페이지"에서 편집한 블록을 협회 디자인으로 그린다.
 * 블록이 없으면 내용을 지어내지 않고 "준비 중" 안내만 보여준다.
 */
export function AssocBlocks({
  blocks,
  siteId,
  emptyTitle = "내용을 준비하고 있습니다",
  emptyDescription = "관리자가 내용을 등록하면 이곳에 표시됩니다.",
}: {
  blocks: AnyBlock[];
  siteId: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (!blocks.length) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="space-y-10">
      {blocks.map((block) => {
        switch (block.type) {
          case "text": {
            const { title, content, variant } = block.props;
            if (variant === "quote") {
              return (
                <blockquote
                  key={block.id}
                  className="rounded-2xl bg-[var(--dba-navy)] px-6 py-10 text-center text-xl leading-relaxed font-bold whitespace-pre-line text-white sm:text-2xl"
                >
                  {content}
                </blockquote>
              );
            }
            return (
              <section key={block.id} className={variant === "lead" ? "text-center" : undefined}>
                {title ? (
                  <h2 className="mb-4 flex items-center gap-2.5 text-2xl font-extrabold text-primary">
                    {variant === "lead" ? null : <span className="h-5 w-1.5 rounded-full bg-[var(--dba-orange)]" aria-hidden />}
                    {title}
                  </h2>
                ) : null}
                <p
                  className={
                    variant === "lead"
                      ? "mx-auto max-w-3xl text-lg leading-[1.9] whitespace-pre-line text-foreground/90"
                      : "text-[16px] leading-[1.9] whitespace-pre-line text-foreground/85"
                  }
                >
                  {content}
                </p>
              </section>
            );
          }
          case "image":
            return block.props.image ? (
              <figure key={block.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.props.image}
                  alt={block.props.caption ?? ""}
                  loading="lazy"
                  className="w-full rounded-2xl border border-border object-contain"
                />
                {block.props.caption ? (
                  <figcaption className="mt-2 text-center text-sm text-muted-foreground">{block.props.caption}</figcaption>
                ) : null}
              </figure>
            ) : null;
          case "gallery":
            return block.props.images?.length ? (
              <section key={block.id}>
                {block.props.title ? <h2 className="mb-4 text-2xl font-extrabold text-primary">{block.props.title}</h2> : null}
                <PhotoLightbox photos={block.props.images} />
              </section>
            ) : null;
          case "officers":
            return <ExecutivesView key={block.id} {...block.props} />;
          case "timeline":
            return <TimelineSection key={block.id} {...block.props} />;
          case "slider":
            return null;
          default:
            return <BlockRenderer key={block.id} blocks={[block]} siteId={siteId} />;
        }
      })}
    </div>
  );
}

/** 임원진: 첫 묶음은 현재 임원진(사진 카드), 나머지는 역대 임원 표 */
export function ExecutivesView({ title, terms }: OfficersBlockProps) {
  const valid = (terms ?? [])
    .map((t) => ({ ...t, members: t.members.filter((m) => m.name.trim()) }))
    .filter((t) => t.label && t.members.length);
  if (!valid.length) return null;
  const [current, ...past] = valid;

  return (
    <div className="space-y-14">
      <section aria-labelledby="exec-current">
        <h2 id="exec-current" className="mb-6 flex flex-wrap items-baseline gap-x-3 text-2xl font-extrabold text-primary">
          {title || "임원진 소개"}
          <span className="text-base font-bold text-[var(--dba-green-text)]">{current.label}</span>
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {current.members.map((m, i) => (
            <li key={i} className="overflow-hidden rounded-2xl border border-border bg-white text-center shadow-sm">
              <div className="aspect-[4/5] bg-[var(--dba-soft)]">
                {m.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.photo} alt={`${m.role} ${m.name}`} loading="lazy" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--dba-blue)]/30">
                    <UserRound className="size-20" aria-hidden />
                  </div>
                )}
              </div>
              <div className="px-3 py-4">
                <p className="text-sm font-bold text-[var(--dba-green-text)]">{m.role}</p>
                <p className="mt-0.5 text-lg font-extrabold text-primary">{m.name}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="past" aria-labelledby="exec-past" className="scroll-mt-40">
        <h2 id="exec-past" className="mb-6 text-2xl font-extrabold text-primary">
          역대 임원
        </h2>
        {past.length ? (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[480px] text-left text-[15px]">
              <thead className="bg-[var(--dba-soft)] text-sm text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">
                    기수 · 연도
                  </th>
                  <th scope="col" className="px-4 py-3 font-bold">
                    임원
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {past.map((t, i) => (
                  <tr key={i}>
                    <th scope="row" className="px-4 py-3.5 align-top font-bold whitespace-nowrap text-primary">
                      {t.label}
                    </th>
                    <td className="px-4 py-3.5">
                      {t.members.map((m, j) => (
                        <span key={j} className="mr-4 inline-block">
                          <span className="text-muted-foreground">{m.role}</span> <strong>{m.name}</strong>
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="등록된 역대 임원 정보가 없습니다" />
        )}
      </section>
    </div>
  );
}
