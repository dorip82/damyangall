import { ListingForm } from "@/components/admin/ListingForm";
import { createListing } from "@/app/directory/admin/(protected)/actions";

export default function NewListingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">새 업체 등록</h1>
      <ListingForm action={createListing} submitLabel="등록" />
    </div>
  );
}
