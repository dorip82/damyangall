export type BlockType =
  | "hero"
  | "text"
  | "image"
  | "gallery"
  | "card"
  | "map"
  | "contact"
  | "sns"
  | "divider"
  | "spacer"
  | "slider"
  | "officers";

export interface HeroBlockProps {
  title: string;
  subtitle?: string;
  image?: string;
  overlay?: number;
  /**
   * false when `image` is a pre-designed graphic that already has the
   * title/subtitle drawn into it (e.g. a poster-style banner) — the image
   * is then shown uncropped at its natural ratio with no dark scrim, and
   * title/subtitle are kept for SEO/accessibility only (visually hidden).
   * Defaults to true (text overlaid on top of a photo background).
   */
  showText?: boolean;
}

export interface TextBlockProps {
  title?: string;
  content: string;
  /**
   * "default": standard left-aligned body copy.
   * "lead": centered, larger type — an opening/closing editorial statement.
   * "quote": centered callout on a full-bleed accent-colored band.
   */
  variant?: "default" | "lead" | "quote";
}

export interface ImageBlockProps {
  image: string;
  caption?: string;
}

export interface GalleryBlockProps {
  title?: string;
  images: { url: string; caption?: string }[];
}

/** Renders either a static card list or a live feed pulled from site_posts. */
export interface CardBlockProps {
  title?: string;
  source?: "static" | "site_posts";
  limit?: number;
  items?: { title: string; description?: string; image?: string; href?: string }[];
}

export interface MapBlockProps {
  latitude: number | null;
  longitude: number | null;
  address?: string;
  note?: string;
}

export interface ContactBlockProps {
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  note?: string;
}

export interface SnsBlockProps {
  instagram?: string | null;
  facebook?: string | null;
  youtube?: string | null;
}

export interface DividerBlockProps {
  spacing?: "sm" | "md" | "lg";
}

export interface SpacerBlockProps {
  height?: "sm" | "md" | "lg";
}

/** 메인 슬라이드 배너. title의 줄바꿈(
)은 그대로 줄바꿈으로 표시된다. */
export interface SliderSlide {
  image: string;
  /** 이미지 대체 텍스트 (사진 내용 묘사) */
  alt?: string;
  title?: string;
  subtitle?: string;
}

export interface SliderBlockProps {
  slides: SliderSlide[];
  /** 자동 넘김 간격(초). 0이면 자동 넘김 없음. 기본 6초 */
  interval?: number;
}

/** 역대 임원진 — 기수/연도별 묶음 */
export interface OfficersBlockProps {
  title?: string;
  terms: {
    /** 예: "2026년", "제3기 (2025~2026)" */
    label: string;
    members: { role: string; name: string }[];
  }[];
}

export type BlockPropsMap = {
  hero: HeroBlockProps;
  text: TextBlockProps;
  image: ImageBlockProps;
  gallery: GalleryBlockProps;
  card: CardBlockProps;
  map: MapBlockProps;
  contact: ContactBlockProps;
  sns: SnsBlockProps;
  divider: DividerBlockProps;
  spacer: SpacerBlockProps;
  slider: SliderBlockProps;
  officers: OfficersBlockProps;
};

export type Block<T extends BlockType = BlockType> = {
  id: string;
  type: T;
  props: BlockPropsMap[T];
};

export type AnyBlock = { [K in BlockType]: Block<K> }[BlockType];

export interface PageContent {
  version: 1;
  blocks: AnyBlock[];
}
