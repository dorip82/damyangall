/**
 * Every 지역정보 listing photo is stored at this exact size (16:9, matching
 * the aspect-video cards on the main page and /directory), so cards line up
 * no matter what was uploaded. Used by the admin upload field and by
 * scripts/normalize-listing-images.ts for photos added before this existed.
 */
export const LISTING_IMAGE_SIZE = { width: 1200, height: 675 } as const;
