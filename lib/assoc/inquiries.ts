import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export interface PublicInquiryRow {
  id: string;
  inquiry_type: string | null;
  masked_name: string;
  created_at: string;
  answered: boolean;
  can_view: boolean;
}

/**
 * 공개 문의 목록 (최신순). 제목 · 내용 · 연락처는 오지 않는다 — DB 함수가 번호용 정보만 돌려준다.
 */
export const loadPublicInquiries = cache(async (siteId: string): Promise<PublicInquiryRow[]> => {
  const supabase = await createClient();
  const { data } = await supabase.rpc("list_site_inquiries_public", { target_site_id: siteId });
  return data ?? [];
});
