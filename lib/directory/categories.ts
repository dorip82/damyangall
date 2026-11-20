import type { DirectoryCategory } from "@/types/database";

/**
 * 지역정보 카테고리. 순서대로 필터·선택 목록에 나온다.
 * aliases: 엑셀 일괄 등록에서 카테고리 칸에 적어도 알아듣는 다른 이름.
 */
export const DIRECTORY_CATEGORIES: { value: DirectoryCategory; label: string; aliases?: string[] }[] = [
  { value: "CAFE", label: "카페" },
  { value: "RESTAURANT", label: "음식점", aliases: ["식당"] },
  { value: "BEAUTY_SALON", label: "미용실", aliases: ["헤어", "헤어샵", "미용"] },
  { value: "SKIN_CARE", label: "피부·네일관리", aliases: ["피부관리", "피부관리실", "피부관리소", "네일", "네일샵", "에스테틱"] },
  { value: "HOSPITAL", label: "병원·의원", aliases: ["병원", "의원", "한의원", "치과"] },
  { value: "PHARMACY", label: "약국" },
  { value: "FITNESS", label: "헬스·운동", aliases: ["헬스", "헬스장", "운동", "필라테스", "요가"] },
  { value: "ACADEMY", label: "학원·교육", aliases: ["학원", "교육"] },
  { value: "MART", label: "마트", aliases: ["편의점"] },
  { value: "PENSION", label: "펜션", aliases: ["숙박"] },
  { value: "GAS_STATION", label: "주유소·충전소", aliases: ["주유소", "충전소"] },
  { value: "AUTO_SERVICE", label: "자동차 정비·세차", aliases: ["정비", "카센터", "세차", "세차장"] },
  { value: "LIFE_SERVICE", label: "생활서비스", aliases: ["세탁소", "세탁", "수선", "사진관", "열쇠"] },
  { value: "PARKING", label: "주차장" },
  { value: "BANK", label: "은행" },
];

const LABEL_BY_VALUE = new Map(DIRECTORY_CATEGORIES.map((c) => [c.value, c.label]));

export function getCategoryLabel(category: DirectoryCategory): string {
  return LABEL_BY_VALUE.get(category) ?? category;
}
