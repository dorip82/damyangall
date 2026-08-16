import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "@/components/admin/ChangePasswordForm";

export default async function DirectoryAdminAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) redirect("/directory/admin/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">계정</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
      </div>
      <ChangePasswordForm email={user.email} />
    </div>
  );
}
