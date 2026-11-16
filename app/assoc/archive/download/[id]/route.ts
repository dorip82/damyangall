import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSiteSlug } from "@/lib/site/current-site";
import { getSiteBySlug } from "@/lib/site/get-site-by-slug";

/** 다운로드 수를 하나 올리고 실제 파일 주소(Supabase Storage)로 보낸다. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const slug = await getCurrentSiteSlug();
  const site = slug ? await getSiteBySlug(slug) : null;
  if (!site || !/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse("Not found", { status: 404 });

  const supabase = await createClient();
  const { data: file } = await supabase
    .from("site_files")
    .select("id, file_url, file_name")
    .eq("id", id)
    .eq("site_id", site.id)
    .maybeSingle();
  if (!file || !/^https?:\/\//.test(file.file_url)) return new NextResponse("Not found", { status: 404 });

  await supabase.rpc("increment_site_file_download", { target_file_id: file.id });

  const target = new URL(file.file_url);
  // Supabase Storage 공개 URL 은 ?download=파일명 을 붙이면 원래 이름으로 저장된다.
  if (target.pathname.includes("/storage/v1/object/public/")) target.searchParams.set("download", file.file_name);
  return NextResponse.redirect(target, 302);
}
