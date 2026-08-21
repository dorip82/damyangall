import { getMainPageSettings } from "@/lib/main-settings/get-main-page-settings";

export async function PortalFooter() {
  const settings = await getMainPageSettings();

  return (
    <footer className="mt-auto border-t border-border bg-deep-forest text-ivory">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-lg font-bold">{settings.footer_title}</p>
        <p className="mt-2 text-sm text-ivory/70">{settings.footer_description}</p>
        <p className="mt-8 text-xs text-ivory/40">
          © {new Date().getFullYear()} {settings.footer_title}.
        </p>
      </div>
    </footer>
  );
}
