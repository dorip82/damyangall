import type { Site, SiteSettings } from "@/types/site";

export function SiteFooter({
  site,
  settings,
}: {
  site: Site;
  settings: SiteSettings | null;
}) {
  return (
    <footer className="mt-auto border-t border-border bg-deep-forest text-ivory">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-lg font-bold">{site.name}</p>
        {site.description ? (
          <p className="mt-2 max-w-xl text-sm text-ivory/70">
            {site.description}
          </p>
        ) : null}

        <dl className="mt-6 space-y-1 text-sm text-ivory/70">
          {settings?.show_phone && site.phone ? (
            <div className="flex gap-2">
              <dt className="text-wood">전화</dt>
              <dd>{site.phone}</dd>
            </div>
          ) : null}
          {site.email ? (
            <div className="flex gap-2">
              <dt className="text-wood">이메일</dt>
              <dd>{site.email}</dd>
            </div>
          ) : null}
          {settings?.show_address && site.address ? (
            <div className="flex gap-2">
              <dt className="text-wood">주소</dt>
              <dd>{site.address}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-8 text-xs text-ivory/40">
          © {new Date().getFullYear()} {site.name}. Powered by 올담.
        </p>
      </div>
    </footer>
  );
}
