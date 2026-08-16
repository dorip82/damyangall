import type { DirectoryCategory } from "@/types/database";

export const DIRECTORY_CATEGORIES: { value: DirectoryCategory; label: string }[] = [
  { value: "CAFE", label: "카페" },
  { value: "RESTAURANT", label: "음식점" },
  { value: "GAS_STATION", label: "주유소" },
  { value: "PHARMACY", label: "약국" },
  { value: "PARKING", label: "주차장" },
  { value: "PENSION", label: "펜션" },
  { value: "MART", label: "마트" },
  { value: "BANK", label: "은행" },
];

const LABEL_BY_VALUE = new Map(DIRECTORY_CATEGORIES.map((c) => [c.value, c.label]));

export function getCategoryLabel(category: DirectoryCategory): string {
  return LABEL_BY_VALUE.get(category) ?? category;
}
