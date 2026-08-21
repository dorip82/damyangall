import type { NewsCategory } from "@/types/database";

export const NEWS_CATEGORIES: { value: NewsCategory; label: string }[] = [
  { value: "LOCAL", label: "지역소식" },
  { value: "LIFE", label: "생활정보" },
  { value: "REPORT", label: "군민제보" },
];

const LABEL_BY_VALUE = new Map(NEWS_CATEGORIES.map((c) => [c.value, c.label]));

export function getNewsCategoryLabel(category: NewsCategory): string {
  return LABEL_BY_VALUE.get(category) ?? category;
}
