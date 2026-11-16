import type { SliderSlide } from "@/lib/blocks/types";

/**
 * 동아리 사이트별 브랜드 설정 (영문명·슬로건·기본 슬라이드·메뉴 하위 항목).
 *
 * 동아리 사이트 템플릿은 여러 동아리가 함께 쓰므로, 특정 동아리에만 해당하는
 * 문구는 여기 slug 별로 둔다. 등록되지 않은 동아리는 GENERIC 값(사이트 이름과
 * 홈 히어로 블록)만으로 화면이 구성된다.
 *
 * 메인 슬라이드는 관리자 > 페이지 > 홈에 "메인 슬라이드" 블록을 추가하면 그 값이
 * 우선한다. 여기 defaultSlides 는 그 블록이 없을 때만 쓰인다.
 */
export interface NavChild {
  label: string;
  href: string;
}

export interface ClubPreset {
  /** 로고 아래 한 줄 소개 (예: "담양 오카리나 동호회") */
  tagline?: string;
  englishName?: string;
  headerSlogan?: string;
  footerSlogan?: string;
  /** 사이트 주소가 없을 때 푸터에 보일 활동 지역 */
  region?: string;
  defaultSlides?: SliderSlide[];
  /** 메인 "동아리 소개" 카드 대표 이미지 */
  aboutImage?: { src: string; alt: string };
  /** site_menus.url 별 메뉴 이름 바꾸기 / 드롭다운 하위 메뉴 */
  nav?: Record<string, { label?: string; children?: NavChild[] }>;
}

const SORIHYANGGI: ClubPreset = {
  tagline: "담양 오카리나 동호회",
  englishName: "Damyang Ocarina Club",
  headerSlogan: "음악으로 하나되는 우리!",
  footerSlogan: "음악이 있는 행복한 담양!",
  region: "전라남도 담양군",
  defaultSlides: [
    {
      image: "/images/sorihyanggi-hero.webp",
      alt: "대나무 잎과 함께 원목 테이블 위에 놓인 오카리나, 뒤로 강과 다리가 보이는 담양 풍경",
      title: "오카리나,\n그 아름다운 선율이\n우리의 일상이 됩니다",
      subtitle: "함께하는 음악, 더 행복한 동행\n소리향기가 만들어갑니다.",
    },
    {
      image: "/images/hero-2.webp",
      alt: "눈 덮인 대나무 숲 사이로 보이는 한옥 누각",
      title: "마음을 울리는 소리,\n향기처럼 퍼지는 선율",
      subtitle: "담양을 기반으로 활동하는 오카리나 동아리, 소리향기입니다.",
    },
    {
      image: "/images/hero-7.webp",
      alt: "양옆으로 키 큰 나무가 늘어선 초록빛 숲길",
      title: "마음이 머무는 선율,\n함께하는 행복",
      subtitle: "담양의 행사와 축제에서 우리의 음악을 함께 나눕니다.",
    },
  ],
  aboutImage: {
    src: "/images/sorihyanggi/about-ocarina.webp",
    alt: "대나무 잎과 함께 원목 테이블 위에 놓인 오카리나",
  },
  nav: {
    "/about": {
      label: "동아리 소개",
      children: [
        { label: "동호회 소개", href: "/about" },
        { label: "역대 임원진", href: "/about#officers" },
      ],
    },
    "/posts": {
      label: "활동소식",
      children: [
        { label: "전체 소식", href: "/posts" },
        { label: "공연 영상", href: "/posts?tab=performance" },
        { label: "활동 사진", href: "/posts?tab=photo" },
        { label: "정기 연습", href: "/posts?tab=practice" },
        { label: "동호회 소식", href: "/posts?tab=news" },
      ],
    },
  },
};

const PRESETS: Record<string, ClubPreset> = {
  sorihyanggi: SORIHYANGGI,
};

export function getClubPreset(slug: string): ClubPreset {
  return PRESETS[slug] ?? {};
}
