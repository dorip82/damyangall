import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { DirectoryAdminSidebar } from "@/components/admin/DirectoryAdminSidebar";
import { DirectoryAdminHeader } from "@/components/admin/DirectoryAdminHeader";

export default async function DirectoryAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect-based gate for UX; every write action under here re-verifies
  // independently via requireSuperAdmin (see components/admin/LoginForm.tsx
  // usage note in lib/auth/require-site-role.ts for why).
  await requireSuperAdmin();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <DirectoryAdminSidebar />
      <div className="flex flex-1 flex-col">
        <DirectoryAdminHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
