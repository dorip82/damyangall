/**
 * 카카오 로컬 API로 담양군 관내 업체(음식점·주유소/LPG충전소·약국·펜션·주차장)를
 * 찾아 지역정보(directory_listings)에 숨김(HIDDEN) 상태로 넣는다. 관리자가
 * 확인 후 게시로 바꾸는 흐름.
 *
 *   npx tsx scripts/import-kakao-places.ts          # 미리보기만 (scripts/kakao-places.json)
 *   npx tsx scripts/import-kakao-places.ts --apply  # 실제 등록
 *
 * .env.local 에 KAKAO_REST_API_KEY (카카오 개발자 콘솔 → 앱 키 → REST API 키)
 * 와 SUPABASE_SERVICE_ROLE_KEY 가 있어야 한다. 이미 같은 이름으로 등록된
 * 업체는 건너뛰므로 여러 번 돌려도 중복되지 않는다.
 *
 * 카카오 로컬 API는 이미지·홈페이지·인스타그램을 주지 않으므로 해당 칸은
 * 비워 둔다.
 */
import { writeFileSync } from "node:fs";
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database, DirectoryCategory } from "../types/database";

loadEnv({ path: ".env.local" });

const KAKAO_KEY = process.env.KAKAO_REST_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!KAKAO_KEY || !SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("KAKAO_REST_API_KEY / NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 .env.local 에 필요합니다.");
  process.exit(1);
}
const APPLY = process.argv.includes("--apply");

interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  place_url: string;
  x: string;
  y: string;
}

interface Target {
  code: string;
  category: DirectoryCategory;
  /** Keep only places whose Kakao category path passes this check. */
  accept: (categoryName: string) => boolean;
}

const TARGETS: Target[] = [
  { code: "FD6", category: "RESTAURANT", accept: () => true },
  {
    code: "OL7",
    category: "GAS_STATION",
    accept: (c) => /주유소|LPG|가스충전소/.test(c) && !/전기/.test(c),
  },
  { code: "PM9", category: "PHARMACY", accept: () => true },
  { code: "AD5", category: "PENSION", accept: (c) => c.includes("펜션") },
  { code: "PK6", category: "PARKING", accept: () => true },
];

// 담양군을 넉넉히 감싸는 사각형 (경도 minX,위도 minY,경도 maxX,위도 maxY).
// 경계 밖 업체는 주소에 "담양군"이 있는지로 한 번 더 거른다.
const DAMYANG_RECT: [number, number, number, number] = [126.82, 35.13, 127.15, 35.47];
const KAKAO_MAX_RESULTS = 45; // 15개 x 3페이지가 한 검색의 한계

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function searchPage(code: string, rect: number[], page: number) {
  const params = new URLSearchParams({
    category_group_code: code,
    rect: rect.join(","),
    page: String(page),
    size: "15",
  });
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`https://dapi.kakao.com/v2/local/search/category.json?${params}`, {
      headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
    });
    if (res.ok) {
      return (await res.json()) as {
        documents: KakaoPlace[];
        meta: { total_count: number; is_end: boolean };
      };
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(`카카오 API 인증 실패 (${res.status}): ${await res.text()}`);
    }
    await sleep(1000 * (attempt + 1));
  }
  throw new Error(`카카오 API 요청 실패: ${code} ${rect.join(",")}`);
}

/**
 * A single query returns at most 45 places, so when an area holds more than
 * that (읍내 음식점), split it into quarters and search each recursively.
 */
async function searchRect(code: string, rect: number[], found: Map<string, KakaoPlace>, depth = 0) {
  const first = await searchPage(code, rect, 1);
  await sleep(80);
  if (first.meta.total_count > KAKAO_MAX_RESULTS && depth < 8) {
    const [x1, y1, x2, y2] = rect;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    for (const quarter of [
      [x1, y1, mx, my],
      [mx, y1, x2, my],
      [x1, my, mx, y2],
      [mx, my, x2, y2],
    ]) {
      await searchRect(code, quarter, found, depth + 1);
    }
    return;
  }

  let result = first;
  for (let page = 1; ; page++) {
    if (page > 1) {
      result = await searchPage(code, rect, page);
      await sleep(80);
    }
    for (const place of result.documents) found.set(place.id, place);
    if (result.meta.is_end || page >= 3) break;
  }
}

/**
 * 음식점은 "음식점 > 한식 > 육류,고기" -> "한식 · 육류,고기" 처럼 종류를
 * 살리고, 나머지는 "자동차 > 주유,가스 > 주유소 > SK주유소" -> "SK주유소"
 * 처럼 마지막 분류만 쓴다 (중간 단계는 의미 없이 길기만 함).
 */
function describe(category: DirectoryCategory, categoryName: string): string | null {
  const parts = categoryName.split(">").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return null;
  if (category === "RESTAURANT") return parts.length > 1 ? parts.slice(1).join(" · ") : parts[0];
  return parts[parts.length - 1];
}

const normalizeName = (name: string) => name.replace(/\s+/g, "").toLowerCase();

async function main() {
  const supabase = createClient<Database>(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing, error } = await supabase.from("directory_listings").select("name");
  if (error) throw error;
  const existingNames = new Set((existing ?? []).map((r) => normalizeName(r.name)));

  const rows: Database["public"]["Tables"]["directory_listings"]["Insert"][] = [];
  const summary: Record<string, { found: number; accepted: number; alreadyListed: number }> = {};

  for (const target of TARGETS) {
    const found = new Map<string, KakaoPlace>();
    await searchRect(target.code, DAMYANG_RECT, found);

    let accepted = 0;
    let alreadyListed = 0;
    for (const place of found.values()) {
      const address = place.road_address_name || place.address_name;
      if (!`${place.address_name} ${place.road_address_name}`.includes("담양군")) continue;
      if (!target.accept(place.category_name)) continue;
      accepted++;
      const key = normalizeName(place.place_name);
      if (existingNames.has(key)) {
        alreadyListed++;
        continue;
      }
      existingNames.add(key);
      rows.push({
        category: target.category,
        name: place.place_name.slice(0, 100),
        description: describe(target.category, place.category_name),
        phone: place.phone || null,
        address,
        image_url: null,
        instagram_url: null,
        website_url: null,
        status: "HIDDEN",
      });
    }
    summary[target.category] = { found: found.size, accepted, alreadyListed };
    console.log(`${target.category}: 검색 ${found.size} · 담양군 ${accepted} · 이미 등록 ${alreadyListed}`);
  }

  writeFileSync("scripts/kakao-places.json", JSON.stringify(rows, null, 2));
  console.log(`\n새로 등록할 업체 ${rows.length}곳 → scripts/kakao-places.json`);

  if (!APPLY) {
    console.log("미리보기만 했습니다. 실제 등록은 --apply 를 붙여 다시 실행하세요.");
    return;
  }

  for (let i = 0; i < rows.length; i += 200) {
    const { error: insertError } = await supabase.from("directory_listings").insert(rows.slice(i, i + 200));
    if (insertError) throw insertError;
  }
  console.log(`${rows.length}곳을 숨김 상태로 등록했습니다.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
