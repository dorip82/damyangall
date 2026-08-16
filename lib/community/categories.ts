import type { CommunityCategory } from "@/types/database";

export const COMMUNITY_CATEGORIES: { value: CommunityCategory; label: string }[] = [
  { value: "FREE", label: "자유게시판" },
  { value: "LOCAL_INFO", label: "지역정보" },
  { value: "FOOD", label: "맛집추천" },
  { value: "TRAVEL", label: "여행정보" },
  { value: "JOBS", label: "구인구직" },
  { value: "MARKET", label: "중고거래" },
  { value: "CLUB_RECRUIT", label: "동호회모집" },
  { value: "EVENT_INFO", label: "행사정보" },
  { value: "REPORT", label: "지역제보" },
];

const LABEL_BY_VALUE = new Map(COMMUNITY_CATEGORIES.map((c) => [c.value, c.label]));

export function getCommunityCategoryLabel(category: CommunityCategory): string {
  return LABEL_BY_VALUE.get(category) ?? category;
}
