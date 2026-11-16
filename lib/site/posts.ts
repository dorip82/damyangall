import type { PageContent } from "@/lib/blocks/types";

/**
 * 활동소식 탭. 게시물 "분류"가 아래 표준 분류 중 하나면 그 값을 따르고,
 * 아니면(기존 게시물의 "활동내역" 등) 내용으로 판단한다:
 *  - 제목에 "연습"이 들어가면 정기 연습
 *  - 유튜브 영상이 있으면 공연 영상
 *  - 사진만 있으면 활동 사진
 *  - 그 외는 동호회 소식
 * "활동 사진" 탭은 분류와 관계없이 사진이 있는 모든 게시물을 보여준다.
 */
export const POST_TABS = [
  { value: "all", label: "전체" },
  { value: "performance", label: "공연 영상" },
  { value: "photo", label: "활동 사진" },
  { value: "practice", label: "정기 연습" },
  { value: "news", label: "동호회 소식" },
] as const;

export type PostTab = (typeof POST_TABS)[number]["value"];

/** 관리자 글쓰기 화면에서 고를 수 있는 표준 분류 */
export const STANDARD_POST_CATEGORIES = [
  "공연 영상",
  "공연 및 행사 사진",
  "정기 연습",
  "동호회 소식",
] as const;

const CATEGORY_TO_TAB: Record<string, Exclude<PostTab, "all">> = {
  "공연 영상": "performance",
  "공연 및 행사 사진": "photo",
  "정기 연습": "practice",
  "동호회 소식": "news",
};

export function isPostTab(value: string | undefined): value is PostTab {
  return POST_TABS.some((t) => t.value === value);
}

/** 게시물 본문(gallery/image 블록)과 썸네일에서 사진 URL을 모은다. 유튜브 썸네일은 제외. */
export function getPostPhotos(post: {
  content: PageContent | null;
  thumbnail_url?: string | null;
}): { url: string; caption?: string }[] {
  const photos: { url: string; caption?: string }[] = [];
  for (const block of post.content?.blocks ?? []) {
    if (block.type === "gallery") {
      for (const img of block.props.images ?? []) if (img.url) photos.push(img);
    } else if (block.type === "image" && block.props.image) {
      photos.push({ url: block.props.image, caption: block.props.caption });
    }
  }
  if (!photos.length && post.thumbnail_url) photos.push({ url: post.thumbnail_url });
  return photos;
}

export function classifyPost(post: {
  category: string | null;
  title: string;
  video_url: string | null;
  hasPhotos: boolean;
}): Exclude<PostTab, "all"> {
  const byCategory = post.category ? CATEGORY_TO_TAB[post.category.trim()] : undefined;
  if (byCategory) return byCategory;
  if (post.title.includes("연습")) return "practice";
  if (post.video_url) return "performance";
  if (post.hasPhotos) return "photo";
  return "news";
}

export function postMatchesTab(
  post: Parameters<typeof classifyPost>[0],
  tab: PostTab
): boolean {
  if (tab === "all") return true;
  if (tab === "photo") return post.hasPhotos || classifyPost(post) === "photo";
  return classifyPost(post) === tab;
}
