import type { LucideIcon } from "lucide-react";

export function ComingSoonBanner({
  label,
  description,
  Icon,
}: {
  label: string;
  description: string;
  Icon: LucideIcon;
}) {
  return (
    <section className="mx-auto max-w-4xl px-6 py-6">
      <div className="flex items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/50 px-5 py-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{label}</p>
          <p className="truncate text-sm text-muted-foreground">{description}</p>
        </div>
        <span className="shrink-0 rounded-full bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          준비중
        </span>
      </div>
    </section>
  );
}
