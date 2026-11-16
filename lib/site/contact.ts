import type { AnyBlock } from "@/lib/blocks/types";
import type { Site, SiteSettings } from "@/types/site";

export interface ClubContact {
  phone: string | null;
  /** 전화번호 앞에 붙일 설명 (예: "동아리 회장") */
  phoneLabel: string | null;
  email: string | null;
  address: string | null;
}

const PHONE_PATTERN = /0\d{1,2}-?\d{3,4}-?\d{4}/;

/**
 * 실제 등록된 연락처만 모은다 (없는 값은 null — 화면에서 숨긴다).
 * 우선순위: 사이트 기본 정보(전화는 "전화번호 표시"가 켜진 경우) → 페이지의
 * "문의" 블록 값 → 문의 블록 안내 문구에 적힌 번호 (예: "동아리 회장 : 010-…").
 */
export function resolveClubContact(
  site: Site,
  settings: Pick<SiteSettings, "show_phone" | "show_address"> | null,
  blocks: AnyBlock[]
): ClubContact {
  const contactBlock = blocks.find((b) => b.type === "contact");
  const props = contactBlock?.type === "contact" ? contactBlock.props : null;

  let phone = (settings?.show_phone ? site.phone : null) || props?.phone || null;
  let phoneLabel: string | null = null;
  if (!phone && props?.note) {
    const match = props.note.match(PHONE_PATTERN);
    if (match) {
      phone = match[0];
      const label = props.note.slice(0, match.index).replace(/[:：\s]+$/, "").trim();
      phoneLabel = label || null;
    }
  }

  return {
    phone,
    phoneLabel,
    email: site.email || props?.email || null,
    address: (settings?.show_address ? site.address : null) || props?.address || null,
  };
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
