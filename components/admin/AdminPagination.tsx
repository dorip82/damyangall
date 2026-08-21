import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Prev/next pager for admin list pages. `buildHref` should carry over the current search/filter params. */
export function AdminPagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav className="mt-6 flex items-center justify-center gap-4 text-sm">
      {hasPrev ? (
        <Link
          href={buildHref(page - 1)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          이전
        </Link>
      ) : (
        <span className="flex items-center gap-1 text-muted-foreground/30">
          <ChevronLeft className="size-4" aria-hidden />
          이전
        </span>
      )}
      <span className="text-muted-foreground">
        {page} / {totalPages}
      </span>
      {hasNext ? (
        <Link
          href={buildHref(page + 1)}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          다음
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span className="flex items-center gap-1 text-muted-foreground/30">
          다음
          <ChevronRight className="size-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}
