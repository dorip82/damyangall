import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListingForm } from "@/components/admin/ListingForm";
import { DeleteListingButton } from "@/components/admin/DeleteListingButton";
import { updateListing } from "@/app/directory/admin/(protected)/listings/actions";
import type { DirectoryListing } from "@/types/directory";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("directory_listings")
    .select("*")
    .eq("id", id)
    .maybeSingle<DirectoryListing>();

  if (!listing) notFound();

  const boundUpdate = updateListing.bind(null, listing.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">업체 정보 수정</h1>
        <DeleteListingButton listingId={listing.id} />
      </div>
      <ListingForm listing={listing} action={boundUpdate} submitLabel="저장" />
    </div>
  );
}
