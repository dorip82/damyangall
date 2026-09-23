/**
 * 지역정보 업체에 홈페이지·인스타그램·대표이미지를 채운다.
 *
 *   npx tsx scripts/enrich-listings.ts <후보파일>          # 검증만
 *   npx tsx scripts/enrich-listings.ts <후보파일> --apply  # DB 반영
 *
 * 후보파일 한 줄: `업체명 | 홈페이지URL | 인스타그램아이디` (빈칸 가능, # 주석).
 * 업체명은 directory_listings.name 과 정확히 같아야 한다.
 *
 * 홈페이지는 실제로 접속해서 페이지 안에 업체 이름(또는 DB의 전화번호)이
 * 있을 때만 채택한다 — 검색으로 찾은 주소가 엉뚱한 곳일 수 있어서. 이미지는
 * 그 홈페이지가 공유용으로 지정한 대표이미지(og:image)만 쓰고, 핫링크 대신
 * directory-images 버킷에 복사해 둔다 (http 이미지는 HTTPS 페이지에서 막히고,
 * 원본 사이트가 바뀌면 깨지므로). 이미 값이 있는 칸은 덮어쓰지 않는다.
 */
import { readFileSync } from "node:fs";
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

loadEnv({ path: ".env.local", quiet: true });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const [candidatesPath] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !candidatesPath) {
  console.error("사용법: npx tsx scripts/enrich-listings.ts <후보파일> [--apply]");
  process.exit(1);
}
const APPLY = process.argv.includes("--apply");
const BUCKET = "directory-images";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36";
const EUC_KR_HINT = /charset\s*=\s*["']?\s*(euc-kr|ks_c_5601-1987|cp949)/i;

async function fetchWithTimeout(url: string, ms = 12_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      headers: { "User-Agent": USER_AGENT, "Accept-Language": "ko" },
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPage(url: string): Promise<{ html: string; finalUrl: string } | null> {
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const head = new TextDecoder("latin1").decode(buffer.slice(0, 4096));
    const eucKr = EUC_KR_HINT.test(res.headers.get("content-type") ?? "") || EUC_KR_HINT.test(head);
    return { html: new TextDecoder(eucKr ? "euc-kr" : "utf-8").decode(buffer), finalUrl: res.url };
  } catch {
    return null;
  }
}

function metaContent(html: string, key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]*(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`, "i"),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1].replace(/&amp;/g, "&").trim();
  }
  return null;
}

/**
 * Old pension sites are often a frameset / meta-refresh shell around the
 * real page, which then has the text and og tags — follow one level of that.
 */
async function loadSite(url: string) {
  const page = await fetchPage(url);
  if (!page) return null;
  const inner =
    page.html.match(/<frame[^>]+src=["']([^"']+)["']/i)?.[1] ??
    page.html.match(/http-equiv=["']refresh["'][^>]*url=([^"'>\s]+)/i)?.[1];
  if (inner && page.html.length < 3000) {
    const innerPage = await fetchPage(new URL(inner, page.finalUrl).toString());
    if (innerPage) return { html: page.html + innerPage.html, finalUrl: innerPage.finalUrl, entry: url };
  }
  return { ...page, entry: url };
}

const squash = (s: string) => s.replace(/\s+/g, "").toLowerCase();

/** "담양까사블랑카펜션 C동" -> "까사블랑카" — the part that actually identifies the business. */
function nameCore(name: string): string {
  return squash(name)
    .replace(/[a-z0-9,]+동$/i, "")
    .replace(/담양점|본점|담양|펜션|펜센|팬션|풀빌라|리조트|스테이|식당|민박/g, "");
}

async function copyImage(imageUrl: string, listingId: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(imageUrl, 15_000);
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.length < 5_000) return null; // favicon / spacer, not a real photo
    const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("gif") ? "gif" : "jpg";
    const path = `imported/${listingId}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: type, upsert: true, cacheControl: "86400" });
    if (error) return null;
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  } catch {
    return null;
  }
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const lines = readFileSync(candidatesPath, "utf-8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  const { data: listings, error } = await supabase
    .from("directory_listings")
    .select("id, name, phone, website_url, instagram_url, image_url")
    .range(0, 5000);
  if (error) throw error;
  const byName = new Map(listings.map((l) => [l.name, l]));

  let websites = 0;
  let instagrams = 0;
  let images = 0;

  for (const line of lines) {
    const [name, website = "", instagram = ""] = line.split("|").map((s) => s.trim());
    const listing = byName.get(name);
    if (!listing) {
      console.log(`✗ ${name}: DB에 같은 이름의 업체 없음`);
      continue;
    }

    const update: Database["public"]["Tables"]["directory_listings"]["Update"] = {};
    const notes: string[] = [];

    if (instagram && !listing.instagram_url) {
      update.instagram_url = `https://www.instagram.com/${instagram.replace(/^@/, "")}/`;
      notes.push(`인스타 @${instagram}`);
    }

    if (website) {
      const site = await loadSite(website);
      const phoneDigits = (listing.phone ?? "").replace(/\D/g, "");
      const text = site ? squash(site.html) : "";
      const core = nameCore(name);
      // Name alone isn't enough for generic names like "별빛펜션" — a site of
      // the same name elsewhere in the country would pass, so also require 담양.
      const matched =
        site &&
        text.includes("담양") &&
        ((core.length >= 2 && text.includes(core)) ||
          (phoneDigits.length >= 9 && text.replace(/\D/g, "").includes(phoneDigits)));
      if (!site) {
        notes.push(`홈페이지 접속 실패(${website})`);
      } else if (!matched) {
        notes.push(`홈페이지에 업체명 없음 → 제외(${website})`);
      } else {
        if (!listing.website_url) update.website_url = website;
        notes.push("홈페이지 ✓");
        const ogRaw = metaContent(site.html, "og:image") ?? metaContent(site.html, "twitter:image");
        // Logos make poor listing photos — only take actual photos.
        const og = ogRaw && !/favicon|logo/i.test(ogRaw) ? ogRaw : null;
        if (og && !listing.image_url) {
          const absolute = new URL(og, site.finalUrl).toString();
          if (APPLY) {
            const stored = await copyImage(absolute, listing.id);
            if (stored) {
              update.image_url = stored;
              notes.push("이미지 ✓");
            } else {
              notes.push(`이미지 가져오기 실패(${absolute})`);
            }
          } else {
            notes.push(`이미지 후보 ${absolute}`);
          }
        } else if (!og) {
          notes.push("대표이미지 없음");
        }
      }
    }

    if (update.website_url) websites++;
    if (update.instagram_url) instagrams++;
    if (update.image_url) images++;
    console.log(`${Object.keys(update).length ? "●" : "○"} ${name}: ${notes.join(" · ") || "변경 없음"}`);

    if (APPLY && Object.keys(update).length) {
      const { error: updateError } = await supabase.from("directory_listings").update(update).eq("id", listing.id);
      if (updateError) console.log(`  ! 저장 실패: ${updateError.message}`);
    }
  }

  console.log(`\n홈페이지 ${websites} · 인스타그램 ${instagrams} · 이미지 ${images}${APPLY ? " 반영 완료" : " (미리보기 — 이미지는 --apply 때 저장)"}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
