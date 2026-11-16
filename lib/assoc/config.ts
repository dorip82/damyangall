/**
 * 협회형 사이트(예: 담양군농구협회 dba.damyangall.kr) 설정.
 * 서브도메인이 여기 등록되어 있으면 middleware 가 /assoc 트리로 보낸다.
 * 화면 구조(메뉴·분류)만 정의하고, 실제 협회 정보(연락처·임원·대회 등)는
 * 전부 DB 에서 읽는다 — 여기에 사실 정보를 넣지 않는다.
 */

export interface AssocNavChild {
  label: string;
  href: string;
}
export interface AssocNavItem {
  label: string;
  href: string;
  description: string;
  children: AssocNavChild[];
}

export interface AssocSlide {
  image: string;
  alt: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonHref?: string;
}

export interface AssocConfig {
  englishName: string;
  shortName: string;
  slogan: string;
  nav: AssocNavItem[];
  defaultSlides: AssocSlide[];
  postCategories: { key: string; label: string; href: string }[];
  fileCategories: string[];
  inquiryTypes: { key: string; label: string; short: string; description: string }[];
}

const DBA: AssocConfig = {
  englishName: "DAMYANG BASKETBALL ASSOCIATION",
  shortName: "DBA",
  slogan: "농구로 하나 되는 담양!",
  nav: [
    {
      label: "협회소개",
      href: "/about",
      description: "담양군농구협회를 소개합니다",
      children: [
        { label: "협회장 인사말", href: "/about/greeting" },
        { label: "협회 소개", href: "/about" },
        { label: "조직도", href: "/about/organization" },
        { label: "임원진 소개", href: "/about/executives" },
        { label: "역대 임원", href: "/about/executives#past" },
        { label: "협회 연혁", href: "/about/history" },
      ],
    },
    {
      label: "생활농구",
      href: "/life",
      description: "군민 누구나 함께하는 생활체육 농구",
      children: [
        { label: "생활농구 소개", href: "/life" },
        { label: "농구 동호회 안내", href: "/life/clubs" },
        { label: "회원 모집 안내", href: "/life/recruit" },
        { label: "생활체육 프로그램", href: "/life/programs" },
      ],
    },
    {
      label: "대회안내",
      href: "/tournament",
      description: "담양군 농구대회 일정과 참가 신청",
      children: [
        { label: "대회 안내", href: "/tournament" },
        { label: "대회 일정", href: "/tournament/schedule" },
        { label: "참가 신청", href: "/tournament/apply" },
        { label: "대진표", href: "/tournament/bracket" },
        { label: "경기 결과", href: "/tournament/results" },
        { label: "대회 사진", href: "/tournament/photos" },
      ],
    },
    {
      label: "활동소식",
      href: "/news",
      description: "협회의 공지와 소식, 사진과 영상",
      children: [
        { label: "공지사항", href: "/news/notice" },
        { label: "협회 소식", href: "/news/association" },
        { label: "보도자료", href: "/news/press" },
        { label: "사진 갤러리", href: "/news/gallery" },
        { label: "동영상 갤러리", href: "/news/video" },
      ],
    },
    {
      label: "자료실",
      href: "/archive",
      description: "규정과 신청서, 각종 서식",
      children: [
        { label: "협회 규정", href: "/archive?cat=협회 규정" },
        { label: "대회 규정", href: "/archive?cat=대회 규정" },
        { label: "각종 신청서", href: "/archive?cat=각종 신청서" },
        { label: "관련 서식", href: "/archive?cat=관련 서식" },
        { label: "기타 자료", href: "/archive?cat=기타 자료" },
      ],
    },
    {
      label: "문의하기",
      href: "/contact",
      description: "협회에 궁금한 점을 남겨주세요",
      children: [
        { label: "일반 문의", href: "/contact?type=general" },
        { label: "대회 문의", href: "/contact?type=tournament" },
        { label: "동호회 가입 문의", href: "/contact?type=club" },
        { label: "제휴 · 협력 문의", href: "/contact?type=partner" },
      ],
    },
  ],
  // 배경: 담양 자연경관 사진(포털과 같은 사진) + 농구 그래픽은 화면에서 SVG 로 그린다.
  // 관리자 "메인 (슬라이드 배너)" 페이지에 슬라이드를 등록하면 그것으로 바뀐다.
  defaultSlides: [
    {
      image: "/images/hero-7.webp",
      alt: "양옆으로 키 큰 나무가 늘어선 초록빛 가로수 길",
      eyebrow: "DAMYANG BASKETBALL ASSOCIATION",
      title: "담양군농구협회",
      subtitle: "농구로 하나 되는 담양!\n군민과 함께하는 농구, 스포츠로 빛나는 담양",
      buttonLabel: "협회 소개 보기",
      buttonHref: "/about",
    },
    {
      image: "/images/hero-5.webp",
      alt: "푸른 하늘 아래 냇가를 따라 이어진 나무 산책길",
      eyebrow: "생활체육 농구",
      title: "누구나 함께하는\n생활농구",
      subtitle: "동호회와 함께 가까운 코트에서 농구를 즐겨보세요.",
      buttonLabel: "생활농구 안내",
      buttonHref: "/life",
    },
    {
      image: "/images/hero-2.webp",
      alt: "눈 덮인 대나무 숲 사이로 보이는 한옥 누각",
      eyebrow: "담양군 농구대회",
      title: "코트 위에서\n함께 빛나는 담양",
      subtitle: "대회 일정과 참가 신청을 확인하세요.",
      buttonLabel: "대회 안내 보기",
      buttonHref: "/tournament",
    },
  ],
  postCategories: [
    { key: "notice", label: "공지사항", href: "/news/notice" },
    { key: "association", label: "협회 소식", href: "/news/association" },
    { key: "press", label: "보도자료", href: "/news/press" },
    { key: "gallery", label: "사진 갤러리", href: "/news/gallery" },
    { key: "video", label: "동영상 갤러리", href: "/news/video" },
  ],
  fileCategories: ["협회 규정", "대회 규정", "각종 신청서", "관련 서식", "기타 자료"],
  inquiryTypes: [
    { key: "general", label: "일반 문의", short: "일반", description: "협회 운영과 관련한 궁금한 점" },
    { key: "tournament", label: "대회 문의", short: "대회", description: "대회 일정, 참가 자격, 신청 방법" },
    { key: "club", label: "동호회 가입 문의", short: "가입", description: "동호회 가입과 활동 안내" },
    { key: "partner", label: "제휴 · 협력 문의", short: "제휴", description: "후원, 제휴, 행사 협력 제안" },
  ],
};

const ASSOC_CONFIGS: Record<string, AssocConfig> = { dba: DBA };

export function getAssocConfig(slug: string | null | undefined): AssocConfig | null {
  return slug ? (ASSOC_CONFIGS[slug] ?? null) : null;
}

export function isAssocSlug(slug: string | null | undefined): boolean {
  return !!slug && slug in ASSOC_CONFIGS;
}

/** 하단 이용안내 페이지용 (메뉴에는 없음) */
export const INFO_SECTION: AssocNavItem = {
  label: "이용안내",
  href: "/sitemap",
  description: "",
  children: [
    { label: "개인정보처리방침", href: "/privacy" },
    { label: "이용약관", href: "/terms" },
    { label: "사이트맵", href: "/sitemap" },
  ],
};

export const TOURNAMENT_STATUS_LABEL = {
  PREPARING: "준비중",
  OPEN: "접수중",
  CLOSED: "접수마감",
  ONGOING: "진행중",
  FINISHED: "종료",
} as const;

export const APPLICATION_STATUS_LABEL = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
} as const;

export const MATCH_STATUS_LABEL = {
  SCHEDULED: "예정",
  LIVE: "진행중",
  FINISHED: "종료",
  CANCELLED: "취소",
} as const;
