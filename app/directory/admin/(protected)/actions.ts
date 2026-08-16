"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { DIRECTORY_CATEGORIES } from "@/lib/directory/categories";

const CATEGORY_VALUES = DIRECTORY_CATEGORIES.map((c) => c.value) as [
  string,
  ...string[],
];

const listingSchema = z.object({
  category: z.enum(CATEGORY_VALUES),
  name: z.string().min(1, "업체명을 입력해주세요"),
  description: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  imageUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  status: z.enum(["PUBLISHED", "HIDDEN"]),
});

export interface ListingFormState {
  ok: boolean;
  error?: string;
}

export async function createListing(
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const parsed = listingSchema.safeParse({
    category: formData.get("category"),
    name: formData.get("name"),
    description: formData.get("description"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    imageUrl: formData.get("imageUrl"),
    instagramUrl: formData.get("instagramUrl"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;

  await requireSuperAdmin();
  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("directory_listings")
    .insert({
      category: values.category as never,
      name: values.name,
      description: values.description || null,
      phone: values.phone || null,
      address: values.address || null,
      image_url: values.imageUrl || null,
      instagram_url: values.instagramUrl || null,
      status: values.status,
    })
    .select("id")
    .single();

  if (error || !listing) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/directory");
  revalidatePath("/directory/admin");
  redirect("/directory/admin");
}

export async function updateListing(
  listingId: string,
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const parsed = listingSchema.safeParse({
    category: formData.get("category"),
    name: formData.get("name"),
    description: formData.get("description"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    imageUrl: formData.get("imageUrl"),
    instagramUrl: formData.get("instagramUrl"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." };
  }
  const values = parsed.data;

  await requireSuperAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("directory_listings")
    .update({
      category: values.category as never,
      name: values.name,
      description: values.description || null,
      phone: values.phone || null,
      address: values.address || null,
      image_url: values.imageUrl || null,
      instagram_url: values.instagramUrl || null,
      status: values.status,
    })
    .eq("id", listingId);

  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/directory");
  revalidatePath(`/directory/${listingId}`);
  revalidatePath("/directory/admin");
  revalidatePath(`/directory/admin/${listingId}`);
  redirect("/directory/admin");
}

export async function deleteListing(listingId: string) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("directory_listings").delete().eq("id", listingId);

  revalidatePath("/directory");
  revalidatePath("/directory/admin");
  redirect("/directory/admin");
}
