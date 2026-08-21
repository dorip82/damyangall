import Link from "next/link";

/** Reusable pill-link filter row (status, category, ...) for admin list pages. */
export function FilterPills({
  options,
  active,
  buildHref,
}: {
  options: { value: string; label: string }[];
  active: string | undefined;
  buildHref: (value: string | undefined) => string;
}) {
  return (
    <nav className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isActive = (opt.value || undefined) === active;
        return (
          <Link
            key={opt.value || "ALL"}
            href={buildHref(opt.value || undefined)}
            className={
              isActive
                ? "rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                : "rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:border-accent hover:text-accent"
            }
          >
            {opt.label}
          </Link>
        );
      })}
    </nav>
  );
}
