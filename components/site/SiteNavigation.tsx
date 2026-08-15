import Link from "next/link";
import type { SiteMenu } from "@/types/site";

export function SiteNavigation({
  menus,
  className,
  onNavigate,
}: {
  menus: SiteMenu[];
  className?: string;
  onNavigate?: () => void;
}) {
  const visible = menus
    .filter((m) => m.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <nav className={className}>
      {visible.map((menu) => (
        <Link
          key={menu.id}
          href={menu.url}
          onClick={onNavigate}
          className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
        >
          {menu.title}
        </Link>
      ))}
    </nav>
  );
}
