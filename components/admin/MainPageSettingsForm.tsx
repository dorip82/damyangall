"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import type { MainSettingsFormState } from "@/app/directory/admin/(protected)/main/actions";
import { updateMainPageSettings } from "@/app/directory/admin/(protected)/main/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { MainPageSettings } from "@/types/main-settings";

const initialState: MainSettingsFormState = { ok: false };

export function MainPageSettingsForm({ settings }: { settings: MainPageSettings }) {
  const [state, formAction, pending] = useActionState(updateMainPageSettings, initialState);

  useEffect(() => {
    if (state === initialState) return;
    if (state.ok) toast.success("저장되었습니다.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <fieldset className="space-y-3 rounded-2xl border border-border p-4">
        <legend className="text-sm font-semibold text-foreground">Hero</legend>
        <div className="space-y-2">
          <Label htmlFor="heroTitle">제목</Label>
          <Input
            id="heroTitle"
            name="heroTitle"
            defaultValue={settings.hero_title}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="heroSubtitle">부제목</Label>
          <Textarea
            id="heroSubtitle"
            name="heroSubtitle"
            rows={2}
            defaultValue={settings.hero_subtitle}
            required
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3 rounded-2xl border border-border p-4">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-semibold text-foreground">광고 배너</legend>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              name="adBannerVisible"
              defaultChecked={settings.ad_banner_visible}
              className="size-4 rounded border-border accent-accent"
            />
            메인에 노출
          </label>
        </div>
        <div className="space-y-2">
          <Label htmlFor="adBannerTitle">제목</Label>
          <Input
            id="adBannerTitle"
            name="adBannerTitle"
            defaultValue={settings.ad_banner_title}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="adBannerDescription">설명</Label>
          <Textarea
            id="adBannerDescription"
            name="adBannerDescription"
            rows={2}
            defaultValue={settings.ad_banner_description}
            required
          />
        </div>
      </fieldset>

      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
