export const PUBLISH_STATUS_LABELS = {
  PUBLISHED: "게시",
  HIDDEN: "숨김",
} as const;

export function getPublishStatusLabel(status: string): string {
  return PUBLISH_STATUS_LABELS[status as keyof typeof PUBLISH_STATUS_LABELS] ?? status;
}
