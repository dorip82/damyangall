"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { updateSiteInfo, type SiteInfoFormState } from "@/app/admin/(protected)/site-info/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Site, SiteSettings } from "@/types/site";

const initialState: SiteInfoFormState = { ok: false };

export function SiteInfoForm({
  site,
  settings,
}: {
  site: Site;
  settings: SiteSettings | null;
}) {
  const [state, formAction, pending] = useActionState(updateSiteInfo, initialState);

  useEffect(() => {
    if (state === initialState) return;
    if (state.ok) toast.success("저장되었습니다.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <input type="hidden" name="siteId" value={site.id} />

      <div className="space-y-2">
        <Label htmlFor="name">동아리 이름</Label>
        <Input id="name" name="name" defaultValue={site.name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">짧은 소개 (푸터·검색결과에 표시)</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={site.description ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          이 내용은 하단 푸터와 검색엔진 설명에만 쓰입니다. 메인페이지에 보이는 소개
          문구는{" "}
          <Link href="/admin/pages" className="text-primary underline">
            페이지 관리 → 홈 → 소개 블록
          </Link>
          에서 수정해주세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">전화번호</Label>
          <Input id="phone" name="phone" defaultValue={site.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input id="email" name="email" type="email" defaultValue={site.email ?? ""} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">주소</Label>
        <Input id="address" name="address" defaultValue={site.address ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="instagramUrl">인스타그램 URL</Label>
        <Input
          id="instagramUrl"
          name="instagramUrl"
          defaultValue={site.instagram_url ?? ""}
        />
      </div>

      <div className="space-y-2 border-t border-border pt-6">
        <Label htmlFor="seoTitle">SEO 제목</Label>
        <Input id="seoTitle" name="seoTitle" defaultValue={settings?.seo_title ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seoDescription">SEO 설명</Label>
        <Textarea
          id="seoDescription"
          name="seoDescription"
          rows={2}
          defaultValue={settings?.seo_description ?? ""}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
