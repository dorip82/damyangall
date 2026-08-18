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

function BannerFields({
  prefix,
  legend,
  visible,
  title,
  description,
}: {
  prefix: "news" | "today" | "ad";
  legend: string;
  visible: boolean;
  title: string;
  description: string;
}) {
  return (
    <fieldset className="space-y-3 rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between">
        <legend className="text-sm font-semibold text-foreground">{legend}</legend>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name={`${prefix}BannerVisible`}
            defaultChecked={visible}
            className="size-4 rounded border-border accent-accent"
          />
          메인에 노출
        </label>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}BannerTitle`}>제목</Label>
        <Input
          id={`${prefix}BannerTitle`}
          name={`${prefix}BannerTitle`}
          defaultValue={title}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}BannerDescription`}>설명</Label>
        <Textarea
          id={`${prefix}BannerDescription`}
          name={`${prefix}BannerDescription`}
          rows={2}
          defaultValue={description}
          required
        />
      </div>
    </fieldset>
  );
}

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

      <BannerFields
        prefix="news"
        legend="담양소식 배너"
        visible={settings.news_banner_visible}
        title={settings.news_banner_title}
        description={settings.news_banner_description}
      />
      <BannerFields
        prefix="today"
        legend="오늘의 담양 배너"
        visible={settings.today_banner_visible}
        title={settings.today_banner_title}
        description={settings.today_banner_description}
      />
      <BannerFields
        prefix="ad"
        legend="광고 배너"
        visible={settings.ad_banner_visible}
        title={settings.ad_banner_title}
        description={settings.ad_banner_description}
      />

      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
