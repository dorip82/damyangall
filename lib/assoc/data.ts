import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";
import { getAssocConfig, type AssocConfig } from "@/lib/assoc/config";
import { getPostPhotos } from "@/lib/site/posts";
import { extractYouTubeId } from "@/lib/utils/youtube";
import type { AnyBlock, PageContent } from "@/lib/blocks/types";
import type {
  Site,
  SiteSettings,
  SiteClub,
  SiteFile,
  SiteTournament,
  SiteTournamentMatch,
} from "@/types/site";

/** 관리자 "팝업 · 배너 관리"에서 저장하는 값 (site_settings.settings jsonb) */
export interface AssocExtraSettings {
  popup?: {
    enabled?: boolean;
    title?: string;
    content?: string;
    image?: string;
    link?: string;
    startDate?: string;
    endDate?: string;
  };
  promos?: { title: string; description?: string; href: string; image?: string }[];
  youtubeUrl?: string;
  blogUrl?: string;
}

export interface AssocContext {
  site: Site;
  settings: SiteSettings | null;
  extra: AssocExtraSettings;
  config: AssocConfig;
}

export const getAssocContext = cache(async (): Promise<AssocContext> => {
  const slug = await getCurrentSiteSlug();
  const config = getAssocConfig(slug);
  if (!slug || !config) notFound();
  const site = await getSiteBySlug(slug);
  if (!site) notFound();

  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("site_id", site.id)
    .maybeSingle<SiteSettings>();
  const extra = ((settings?.settings ?? {}) as AssocExtraSettings) || {};
  return { site, settings: settings ?? null, extra, config };
});

/** 관리자 "페이지"에서 편집하는 블록 내용. 비어 있으면 빈 배열. */
export const loadPageBlocks = cache(async (siteId: string, slug: string): Promise<AnyBlock[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_pages")
    .select("content")
    .eq("site_id", siteId)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  const content = data?.content as unknown as PageContent | null;
  return content?.blocks ?? [];
});

export interface AssocPost {
  id: string;
  title: string;
  category: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  view_count: number;
  youtubeId: string | null;
  photos: { url: string; caption?: string }[];
}

export async function loadPosts(
  siteId: string,
  opts: { categories?: string[]; onlyVideo?: boolean; onlyPhotos?: boolean; limit?: number; query?: string } = {}
): Promise<AssocPost[]> {
  const supabase = await createClient();
  let q = supabase
    .from("site_posts")
    .select("id, title, category, thumbnail_url, video_url, published_at, view_count, content")
    .eq("site_id", siteId)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false })
    .limit(opts.limit ?? 300);
  if (opts.categories?.length) q = q.in("category", opts.categories);
  if (opts.onlyVideo) q = q.not("video_url", "is", null);
  if (opts.query) q = q.ilike("title", `%${escapeLike(opts.query)}%`);
  const { data } = await q;

  const posts = (data ?? []).map((p) => {
    const youtubeId = extractYouTubeId(p.video_url);
    const photos = getPostPhotos({
      content: p.content as unknown as PageContent | null,
      thumbnail_url: youtubeId ? null : p.thumbnail_url,
    });
    return {
      id: p.id,
      title: p.title,
      category: p.category,
      thumbnail_url: p.thumbnail_url,
      published_at: p.published_at,
      view_count: p.view_count ?? 0,
      youtubeId,
      photos,
    };
  });
  return opts.onlyPhotos ? posts.filter((p) => p.photos.length) : posts;
}

export async function loadTournaments(siteId: string, opts: { query?: string } = {}): Promise<SiteTournament[]> {
  const supabase = await createClient();
  let q = supabase
    .from("site_tournaments")
    .select("*")
    .eq("site_id", siteId)
    .eq("is_published", true)
    .order("start_date", { ascending: false, nullsFirst: true });
  if (opts.query) q = q.ilike("title", `%${escapeLike(opts.query)}%`);
  const { data } = await q;
  return data ?? [];
}

export async function loadTournament(siteId: string, id: string): Promise<SiteTournament | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_tournaments")
    .select("*")
    .eq("site_id", siteId)
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();
  return data;
}

export async function loadMatches(siteId: string, tournamentIds?: string[]): Promise<SiteTournamentMatch[]> {
  const supabase = await createClient();
  let q = supabase
    .from("site_tournament_matches")
    .select("*")
    .eq("site_id", siteId)
    .order("sort_order")
    .order("scheduled_at", { ascending: true, nullsFirst: false });
  if (tournamentIds) {
    if (!tournamentIds.length) return [];
    q = q.in("tournament_id", tournamentIds);
  }
  const { data } = await q;
  return data ?? [];
}

export async function loadTeams(tournamentId: string) {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_tournament_teams", { target_tournament_id: tournamentId });
  return data ?? [];
}

export async function loadClubs(siteId: string, opts: { query?: string } = {}): Promise<SiteClub[]> {
  const supabase = await createClient();
  let q = supabase
    .from("site_clubs")
    .select("*")
    .eq("site_id", siteId)
    .eq("is_published", true)
    .order("sort_order")
    .order("name");
  if (opts.query) q = q.ilike("name", `%${escapeLike(opts.query)}%`);
  const { data } = await q;
  return data ?? [];
}

export async function loadFiles(siteId: string, opts: { category?: string; query?: string } = {}): Promise<SiteFile[]> {
  const supabase = await createClient();
  let q = supabase
    .from("site_files")
    .select("*")
    .eq("site_id", siteId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (opts.category) q = q.eq("category", opts.category);
  if (opts.query) q = q.ilike("title", `%${escapeLike(opts.query)}%`);
  const { data } = await q;
  return data ?? [];
}

function escapeLike(v: string) {
  return v.replace(/[%_\\]/g, (m) => `\\${m}`).slice(0, 60);
}

/** 오늘 날짜(한국 시간) YYYY-MM-DD */
export function todayKST(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = iso.length <= 10 ? new Date(`${iso}T00:00:00+09:00`) : new Date(iso);
  return d.toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\.$/, "");
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatPeriod(start: string | null, end: string | null): string {
  if (!start && !end) return "일정 미정";
  if (start && end && start !== end) return `${formatDate(start)} ~ ${formatDate(end)}`;
  return formatDate(start ?? end);
}

/** 접수 상태를 날짜와 함께 판단 (관리자가 OPEN 으로 둬도 기간이 지나면 마감으로 보인다) */
export function applicationState(t: SiteTournament): "OPEN" | "BEFORE" | "CLOSED" | "NONE" {
  if (t.status !== "OPEN") return t.status === "PREPARING" ? "NONE" : "CLOSED";
  const today = todayKST();
  if (t.apply_start && today < t.apply_start) return "BEFORE";
  if (t.apply_end && today > t.apply_end) return "CLOSED";
  return "OPEN";
}
