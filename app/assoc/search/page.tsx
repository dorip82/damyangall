import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatDate, formatPeriod, getAssocContext, loadClubs, loadFiles, loadPosts, loadTournaments } from "@/lib/assoc/data";
import { INFO_SECTION } from "@/lib/assoc/config";
import { AssocContainer, AssocPageHeader, CategoryBadge, EmptyState, SectionTitle } from "@/components/assoc/ui";

export const metadata: Metadata = { title: "검색", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: raw } = await searchParams;
  const q = (raw ?? "").trim().slice(0, 60);
  const { site } = await getAssocContext();

  const [posts, tournaments, clubs, files] = q
    ? await Promise.all([
        loadPosts(site.id, { query: q, limit: 30 }),
        loadTournaments(site.id, { query: q }),
        loadClubs(site.id, { query: q }),
        loadFiles(site.id, { query: q }),
      ])
    : [[], [], [], []];
  const total = posts.length + tournaments.length + clubs.length + files.length;

  return (
    <>
      <AssocPageHeader section={{ ...INFO_SECTION, label: "검색", href: "/search", children: [] }} title="검색" />
      <AssocContainer className="max-w-4xl space-y-12">
        <form role="search" action="/search" className="flex gap-2">
          <label htmlFor="q" className="sr-only">
            검색어
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="공지, 대회, 동호회, 자료를 검색하세요"
            className="h-12 min-w-0 flex-1 rounded-full border border-input bg-white px-5 text-[16px] outline-none focus:border-[var(--dba-blue)]"
          />
          <button type="submit" className="flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-bold text-primary-foreground">
            <Search className="size-4" aria-hidden />
            검색
          </button>
        </form>

        {q ? (
          <p className="text-[15px]" role="status">
            <strong className="text-primary">&lsquo;{q}&rsquo;</strong> 검색 결과 <strong>{total}</strong>건
          </p>
        ) : null}

        {q && !total ? <EmptyState title="검색 결과가 없습니다" description="다른 검색어로 다시 찾아보세요." /> : null}

        {posts.length ? (
          <section aria-labelledby="sr-posts">
            <SectionTitle id="sr-posts" title="활동소식" />
            <ul className="divide-y divide-border rounded-2xl border border-border bg-white">
              {posts.map((p) => (
                <li key={p.id}>
                  <Link href={`/news/${p.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--dba-soft)]">
                    <CategoryBadge>{p.category ?? "소식"}</CategoryBadge>
                    <span className="min-w-0 flex-1 truncate font-semibold">{p.title}</span>
                    <span className="shrink-0 text-sm text-muted-foreground">{formatDate(p.published_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {tournaments.length ? (
          <section aria-labelledby="sr-t">
            <SectionTitle id="sr-t" title="대회" />
            <ul className="divide-y divide-border rounded-2xl border border-border bg-white">
              {tournaments.map((t) => (
                <li key={t.id}>
                  <Link href={`/tournament/${t.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[var(--dba-soft)]">
                    <span className="font-semibold">{t.title}</span>
                    <span className="shrink-0 text-sm text-muted-foreground">{formatPeriod(t.start_date, t.end_date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {clubs.length ? (
          <section aria-labelledby="sr-c">
            <SectionTitle id="sr-c" title="동호회" />
            <ul className="divide-y divide-border rounded-2xl border border-border bg-white">
              {clubs.map((c) => (
                <li key={c.id}>
                  <Link href={`/life/clubs#club-${c.id}`} className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[var(--dba-soft)]">
                    <span className="font-semibold">{c.name}</span>
                    {c.location ? <span className="shrink-0 text-sm text-muted-foreground">{c.location}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {files.length ? (
          <section aria-labelledby="sr-f">
            <SectionTitle id="sr-f" title="자료실" />
            <ul className="divide-y divide-border rounded-2xl border border-border bg-white">
              {files.map((f) => (
                <li key={f.id}>
                  <a href={`/archive/download/${f.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--dba-soft)]">
                    <CategoryBadge>{f.category}</CategoryBadge>
                    <span className="min-w-0 flex-1 truncate font-semibold">{f.title}</span>
                    <span className="shrink-0 text-sm text-muted-foreground">내려받기</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </AssocContainer>
    </>
  );
}
