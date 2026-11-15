/**
 * 메인 포털 상단·모바일·푸터 메뉴가 함께 쓰는 링크 목록.
 *
 * - "업체·단체 찾기"는 별도 페이지가 아니라 지역정보 업체와 동아리·동호회
 *   사이트를 함께 찾는 통합 검색(/search)으로 연결한다.
 * - "올담 소개"는 별도 페이지가 없어, 모든 포털 페이지 하단 푸터의 소개
 *   영역(#about)으로 이동한다. 소개 문구는 /directory/admin/main 에서 편집한다.
 */
export const PORTAL_NAV_LINKS = [
  { href: "/news", label: "담양소식" },
  { href: "/community", label: "커뮤니티" },
  { href: "/directory", label: "지역정보" },
  { href: "/events", label: "행사" },
  { href: "/search", label: "업체·단체 찾기" },
  { href: "#about", label: "올담 소개" },
] as const;
