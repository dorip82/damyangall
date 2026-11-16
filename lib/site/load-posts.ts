import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId } from "@/lib/utils/youtube";
import { getPostPhotos } from "@/lib/site/posts";
import type { PageContent } from "@/lib/blocks/types";

export interface ClubPost {
  id: string;
  title: string;
  category: string | null;
  thumbnail_url: string | null;
  video_url: string | null;
  published_at: string | null;
  youtubeId: string | null;
  photos: { url: string; caption?: string }[];
  hasPhotos: boolean;
}

/** 게시된 활동소식을 최신순으로. 사진/영상 정보를 미리 풀어 둔다. */
export async function loadClubPosts(siteId: string, limit = 200): Promise<ClubPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_posts")
    .select("id, title, category, thumbnail_url, video_url, published_at, content")
    .eq("site_id", siteId)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []).map((p) => {
    const youtubeId = extractYouTubeId(p.video_url);
    // 썸네일은 유튜브 영상 게시물이면 영상 표지일 뿐이므로 "사진"으로 치지 않는다.
    const photos = getPostPhotos({
      content: p.content as unknown as PageContent | null,
      thumbnail_url: youtubeId ? null : p.thumbnail_url,
    });
    return {
      id: p.id,
      title: p.title,
      category: p.category,
      thumbnail_url: p.thumbnail_url,
      video_url: p.video_url,
      published_at: p.published_at,
      youtubeId,
      photos,
      hasPhotos: photos.length > 0,
    };
  });
}

export function formatPostDate(iso: string | null): string | null {
  return iso ? new Date(iso).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" }) : null;
}
