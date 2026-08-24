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
  websiteUrl: z.string().optional(),
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
    websiteUrl: formData.get("websiteUrl"),
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
      website_url: values.websiteUrl || null,
      status: values.status,
    })
    .select("id")
    .single();

  if (error || !listing) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/directory");
  revalidatePath("/directory/admin/listings");
  redirect("/directory/admin/listings");
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
    websiteUrl: formData.get("websiteUrl"),
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
      website_url: values.websiteUrl || null,
      status: values.status,
    })
    .eq("id", listingId);

  if (error) return { ok: false, error: "저장 중 오류가 발생했습니다." };

  revalidatePath("/directory");
  revalidatePath(`/directory/${listingId}`);
  revalidatePath("/directory/admin/listings");
  revalidatePath(`/directory/admin/listings/${listingId}`);
  redirect("/directory/admin/listings");
}

export async function deleteListing(listingId: string) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("directory_listings").delete().eq("id", listingId);

  revalidatePath("/directory");
  revalidatePath("/directory/admin/listings");
  redirect("/directory/admin/listings");
}

export async function toggleListingStatus(
  listingId: string,
  nextStatus: "PUBLISHED" | "HIDDEN"
) {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("directory_listings").update({ status: nextStatus }).eq("id", listingId);

  revalidatePath("/directory");
  revalidatePath(`/directory/${listingId}`);
  revalidatePath("/directory/admin/listings");
}

const CATEGORY_BY_LABEL = new Map(DIRECTORY_CATEGORIES.map((c) => [c.label, c.value]));
const CATEGORY_VALUE_SET = new Set(CATEGORY_VALUES);
const MAX_BULK_ROWS = 300;

function normalizeCategory(raw: string): string | null {
  const trimmed = raw.trim();
  const upper = trimmed.toUpperCase();
  if (CATEGORY_VALUE_SET.has(upper)) return upper;
  return CATEGORY_BY_LABEL.get(trimmed) ?? null;
}

function normalizeStatus(raw: string): "PUBLISHED" | "HIDDEN" | null {
  const trimmed = raw.trim();
  if (trimmed === "") return "PUBLISHED";
  if (trimmed === "게시" || trimmed === "공개" || trimmed.toUpperCase() === "PUBLISHED") {
    return "PUBLISHED";
  }
  if (trimmed === "숨김" || trimmed === "비공개" || trimmed.toUpperCase() === "HIDDEN") {
    return "HIDDEN";
  }
  return null;
}

export interface BulkListingFormState {
  ok: boolean;
  error?: string;
  insertedCount?: number;
  skipped?: { line: number; reason: string }[];
}

// 엑셀/구글 시트에서 표를 복사해 붙여넣으면 탭으로 열이 구분되므로, 주소에
// 흔한 쉼표 이스케이프 문제 없이 탭 구분으로 파싱한다.
export async function bulkCreateListings(
  _prevState: BulkListingFormState,
  formData: FormData
): Promise<BulkListingFormState> {
  await requireSuperAdmin();

  const raw = String(formData.get("rows") ?? "");
  const lines = raw
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter((line) => line.trim() !== "");

  if (!lines.length) {
    return { ok: false, error: "붙여넣을 내용이 없습니다." };
  }
  if (lines.length > MAX_BULK_ROWS) {
    return { ok: false, error: `한 번에 최대 ${MAX_BULK_ROWS}행까지 등록할 수 있습니다.` };
  }

  const startIndex =
    lines[0]?.split("\t")[0]?.trim() === "카테고리" ? 1 : 0;

  const toInsert: {
    category: string;
    name: string;
    description: string | null;
    phone: string | null;
    address: string | null;
    instagram_url: string | null;
    website_url: string | null;
    status: "PUBLISHED" | "HIDDEN";
  }[] = [];
  const skipped: { line: number; reason: string }[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const lineNumber = i + 1;
    const cells = lines[i]!.split("\t").map((c) => c.trim());
    const [categoryRaw, name, description, phone, address, instagramUrl, websiteUrl, statusRaw] =
      cells;

    if (!name) {
      skipped.push({ line: lineNumber, reason: "업체명이 없습니다." });
      continue;
    }
    const category = normalizeCategory(categoryRaw ?? "");
    if (!category) {
      skipped.push({ line: lineNumber, reason: `알 수 없는 카테고리: "${categoryRaw ?? ""}"` });
      continue;
    }
    const status = normalizeStatus(statusRaw ?? "");
    if (status === null) {
      skipped.push({ line: lineNumber, reason: `알 수 없는 상태: "${statusRaw ?? ""}"` });
      continue;
    }

    toInsert.push({
      category,
      name,
      description: description || null,
      phone: phone || null,
      address: address || null,
      instagram_url: instagramUrl || null,
      website_url: websiteUrl || null,
      status,
    });
  }

  if (!toInsert.length) {
    return { ok: false, error: "등록 가능한 행이 없습니다.", skipped };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("directory_listings")
    .insert(toInsert as never)
    .select("id");

  if (error) {
    return { ok: false, error: "저장 중 오류가 발생했습니다.", skipped };
  }

  revalidatePath("/directory");
  revalidatePath("/directory/admin/listings");

  return { ok: true, insertedCount: data?.length ?? 0, skipped };
}
