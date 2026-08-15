import { notFound, redirect } from "next/navigation";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { requireSiteRole } from "@/lib/auth/require-site-role";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const slug = await getCurrentSiteSlug();
  if (!slug) redirect("/");

  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  // Redirect-based gate for UX; every page/action under here re-verifies
  // independently via requireSiteRole (Server Actions can be invoked
  // directly, so this layout having rendered proves nothing on its own).
  await requireSiteRole(site.id, ["SITE_ADMIN", "EDITOR"]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader site={site} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
