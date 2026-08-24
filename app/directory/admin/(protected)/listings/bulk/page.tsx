import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BulkListingForm } from "@/components/admin/BulkListingForm";

export default function BulkListingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/directory/admin/listings"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          업체 목록으로
        </Link>
        <h1 className="text-xl font-bold text-foreground">업체 일괄등록</h1>
      </div>
      <BulkListingForm />
    </div>
  );
}
