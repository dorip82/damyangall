import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Fire-and-forget visit logging for the admin "접속통계" page. Records only
 * the path and a timestamp — no IP/User-Agent — so RLS lets literally anyone
 * insert (see page_views_insert_anyone), and only SUPER_ADMIN can read it back.
 */
export async function POST(request: Request) {
  let path: unknown;
  try {
    ({ path } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (typeof path !== "string" || !path.startsWith("/") || path.length > 300) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("page_views").insert({ path });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
