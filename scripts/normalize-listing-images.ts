/**
 * 이미 등록된 지역정보 사진을 모두 LISTING_IMAGE_SIZE(1200×675, 가운데 기준
 * 잘라내기) JPEG로 맞춘다. 관리자 업로드는 이제 브라우저에서 같은 크기로
 * 잘라 올리지만, 그 전에 올라간 사진은 크기가 제각각이라 한 번 정리하는 용도.
 *
 *   npx tsx scripts/normalize-listing-images.ts          # 미리보기
 *   npx tsx scripts/normalize-listing-images.ts --apply  # 변환 + DB 반영
 *
 * 원본 파일은 지우지 않고 normalized/ 경로에 새로 저장한 뒤 image_url만
 * 바꾸므로, 결과가 마음에 들지 않으면 되돌릴 수 있다.
 */
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import type { Database } from "../types/database";
import { LISTING_IMAGE_SIZE } from "../lib/directory/image";

loadEnv({ path: ".env.local", quiet: true });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 .env.local 에 필요합니다.");
  process.exit(1);
}
const APPLY = process.argv.includes("--apply");
const BUCKET = "directory-images";
const { width, height } = LISTING_IMAGE_SIZE;

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data: listings, error } = await supabase
    .from("directory_listings")
    .select("id, name, image_url")
    .not("image_url", "is", null)
    .range(0, 5000);
  if (error) throw error;

  let converted = 0;
  let skipped = 0;
  let failed = 0;

  for (const listing of listings) {
    const url = listing.image_url!;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const input = Buffer.from(await res.arrayBuffer());
      const meta = await sharp(input).metadata();

      if (meta.width === width && meta.height === height && meta.format === "jpeg") {
        skipped++;
        continue;
      }

      const output = await sharp(input)
        .rotate() // honor EXIF orientation from phone photos
        .resize(width, height, { fit: "cover", position: "centre" })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();

      console.log(`● ${listing.name}: ${meta.width}×${meta.height} → ${width}×${height}`);
      converted++;
      if (!APPLY) continue;

      const path = `normalized/${listing.id}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, output, { contentType: "image/jpeg", cacheControl: "86400" });
      if (uploadError) throw uploadError;
      const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
      const { error: updateError } = await supabase
        .from("directory_listings")
        .update({ image_url: publicUrl })
        .eq("id", listing.id);
      if (updateError) throw updateError;
    } catch (e) {
      failed++;
      console.log(`✗ ${listing.name}: ${e instanceof Error ? e.message : e} (${url})`);
    }
  }

  console.log(`\n변환 ${converted} · 이미 맞음 ${skipped} · 실패 ${failed}${APPLY ? " — 반영 완료" : " — 미리보기 (--apply 로 반영)"}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
