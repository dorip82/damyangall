"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AssetUploadButton } from "@/components/admin/AssetUpload";
import { saveBannerSettings, type BannerSettingsInput } from "@/app/admin/(protected)/banners/actions";

export function BannerSettingsForm({ siteId, initial }: { siteId: string; initial: BannerSettingsInput }) {
  const [v, setV] = useState(initial);
  const [pending, start] = useTransition();
  const setPopup = (patch: Partial<BannerSettingsInput["popup"]>) => setV((s) => ({ ...s, popup: { ...s.popup, ...patch } }));
  const setPromo = (i: number, patch: Partial<BannerSettingsInput["promos"][number]>) =>
    setV((s) => ({ ...s, promos: s.promos.map((p, j) => (j === i ? { ...p, ...patch } : p)) }));

  return (
    <form
      className="max-w-3xl space-y-10"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await saveBannerSettings(siteId, v);
          if (r.ok) toast.success("저장되었습니다.");
          else toast.error(r.error ?? "저장하지 못했습니다.");
        });
      }}
    >
      <section className="space-y-4">
        <h2 className="text-lg font-bold">공지 팝업</h2>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" className="size-4" checked={v.popup.enabled} onChange={(e) => setPopup({ enabled: e.target.checked })} />
          팝업 사용
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="p-title">제목</Label>
            <Input id="p-title" value={v.popup.title} onChange={(e) => setPopup({ title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-link">누르면 이동할 링크 (선택)</Label>
            <Input id="p-link" placeholder="/tournament/apply" value={v.popup.link} onChange={(e) => setPopup({ link: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-start">게시 시작일 (선택)</Label>
            <Input id="p-start" type="date" value={v.popup.startDate} onChange={(e) => setPopup({ startDate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="p-end">게시 종료일 (선택)</Label>
            <Input id="p-end" type="date" value={v.popup.endDate} onChange={(e) => setPopup({ endDate: e.target.value })} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-content">내용</Label>
          <Textarea id="p-content" rows={3} value={v.popup.content} onChange={(e) => setPopup({ content: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="p-image">이미지 (선택)</Label>
          <div className="flex gap-2">
            <Input id="p-image" value={v.popup.image} onChange={(e) => setPopup({ image: e.target.value })} />
            <AssetUploadButton siteId={siteId} folder="popup" onUploaded={(a) => setPopup({ image: a.url })} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold">메인 홍보 배너 (최대 3개)</h2>
          <p className="text-sm text-muted-foreground">
            비워 두면 기본 안내(생활농구 참여 안내 · 대회 참가 신청 · 농구 동호회 가입 안내)가 표시됩니다. 메인 슬라이드는 &quot;페이지 · 메인배너 → 메인 (슬라이드 배너)&quot;에서 편집합니다.
          </p>
        </div>
        {v.promos.map((p, i) => (
          <div key={i} className="grid gap-3 rounded-md border border-dashed border-border p-3 sm:grid-cols-2">
            <Input aria-label="배너 제목" placeholder="제목" value={p.title} onChange={(e) => setPromo(i, { title: e.target.value })} />
            <Input aria-label="배너 링크" placeholder="링크 (예: /life)" value={p.href} onChange={(e) => setPromo(i, { href: e.target.value })} />
            <Input aria-label="배너 설명" placeholder="짧은 설명 (선택)" value={p.description} onChange={(e) => setPromo(i, { description: e.target.value })} />
            <div className="flex gap-2">
              <Input aria-label="배너 배경 이미지" placeholder="배경 이미지 (선택)" value={p.image} onChange={(e) => setPromo(i, { image: e.target.value })} />
              <AssetUploadButton siteId={siteId} folder="banners" label="올리기" onUploaded={(a) => setPromo(i, { image: a.url })} />
              <Button type="button" variant="ghost" size="icon" aria-label="배너 삭제" onClick={() => setV((s) => ({ ...s, promos: s.promos.filter((_, j) => j !== i) }))}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        {v.promos.length < 3 ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setV((s) => ({ ...s, promos: [...s.promos, { title: "", description: "", href: "", image: "" }] }))}
          >
            <Plus className="size-4" /> 배너 추가
          </Button>
        ) : null}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">추가 SNS</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="yt">유튜브 채널 URL</Label>
            <Input id="yt" value={v.youtubeUrl} onChange={(e) => setV((s) => ({ ...s, youtubeUrl: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blog">블로그 URL</Label>
            <Input id="blog" value={v.blogUrl} onChange={(e) => setV((s) => ({ ...s, blogUrl: e.target.value }))} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">인스타그램·페이스북·연락처·주소는 &quot;기본 정보&quot;에서 입력합니다.</p>
      </section>

      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
