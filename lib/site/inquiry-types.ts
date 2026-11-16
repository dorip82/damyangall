/**
 * 문의 유형. DB 컬럼을 늘리지 않고 제목 앞에 "[유형]"으로 붙여 저장한다
 * (관리자 문의 목록에서도 바로 구분된다).
 */
export const INQUIRY_TYPES = [
  { value: "join", label: "동아리 가입 문의", short: "가입 문의", description: "오카리나를 처음 시작하는 분도 환영합니다." },
  { value: "performance", label: "공연 요청 및 섭외 문의", short: "공연 섭외", description: "지역 행사·기관 공연 요청을 받습니다." },
  { value: "event", label: "행사 초청 문의", short: "행사 초청", description: "축제·모임에 소리향기를 초대해주세요." },
  { value: "etc", label: "기타 문의", short: "기타", description: "그 밖에 궁금한 점을 남겨주세요." },
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number]["value"];

export function getInquiryType(value: string | null | undefined) {
  return INQUIRY_TYPES.find((t) => t.value === value);
}
