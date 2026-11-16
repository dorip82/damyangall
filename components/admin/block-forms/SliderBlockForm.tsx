import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { SliderBlockProps, SliderSlide } from "@/lib/blocks/types";

export function SliderBlockForm({
  value,
  onChange,
}: {
  value: SliderBlockProps;
  onChange: (next: SliderBlockProps) => void;
}) {
  const slides = value.slides ?? [];

  function update(index: number, patch: Partial<SliderSlide>) {
    const next = slides.slice();
    next[index] = { ...next[index], ...patch };
    onChange({ ...value, slides: next });
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    const next = slides.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...value, slides: next });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        홈 첫 화면의 가로형 배너입니다. 제목은 줄바꿈한 대로 표시되고, 첫 줄은 노란색으로 강조됩니다.
        권장 이미지 크기: 가로 1600px 이상, 가로:세로 약 3:1.
      </p>

      <div className="space-y-1.5">
        <Label>자동 넘김 간격 (초, 0이면 자동 넘김 없음)</Label>
        <Input
          type="number"
          min={0}
          max={60}
          className="w-32"
          value={value.interval ?? 6}
          onChange={(e) => onChange({ ...value, interval: Number(e.target.value) })}
        />
      </div>

      {slides.map((slide, i) => (
        <div key={i} className="space-y-3 rounded-md border border-dashed border-border p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">슬라이드 {i + 1}</p>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="icon" aria-label="위로" onClick={() => move(i, -1)}>
                <ArrowUp className="size-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="아래로" onClick={() => move(i, 1)}>
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="슬라이드 삭제"
                onClick={() => onChange({ ...value, slides: slides.filter((_, j) => j !== i) })}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>이미지 URL</Label>
            <Input value={slide.image} placeholder="https://… 또는 /images/…" onChange={(e) => update(i, { image: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>이미지 설명 (시각장애인용 대체 텍스트)</Label>
            <Input value={slide.alt ?? ""} placeholder="예: 원목 테이블 위에 놓인 오카리나" onChange={(e) => update(i, { alt: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>메인 문구</Label>
            <Textarea rows={3} value={slide.title ?? ""} onChange={(e) => update(i, { title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>보조 문구</Label>
            <Textarea rows={2} value={slide.subtitle ?? ""} onChange={(e) => update(i, { subtitle: e.target.value })} />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange({ ...value, slides: [...slides, { image: "" }] })}
      >
        <Plus className="size-4" /> 슬라이드 추가
      </Button>
    </div>
  );
}
