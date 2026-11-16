"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { TimelineBlockProps } from "@/lib/blocks/types";

type Item = TimelineBlockProps["items"][number];

export function TimelineBlockForm({
  value,
  onChange,
}: {
  value: TimelineBlockProps;
  onChange: (next: TimelineBlockProps) => void;
}) {
  const items = value.items ?? [];
  const set = (next: Item[]) => onChange({ ...value, items: next });
  const update = (i: number, patch: Partial<Item>) => set(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  const move = (i: number, d: -1 | 1) => {
    const t = i + d;
    if (t < 0 || t >= items.length) return;
    const next = items.slice();
    [next[i], next[t]] = [next[t], next[i]];
    set(next);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        날짜(연도·월)와 있었던 일을 한 줄씩 입력합니다. 위에 있는 항목부터 순서대로 표시됩니다.
      </p>
      <div className="space-y-1.5">
        <Label>섹션 제목 (선택)</Label>
        <Input
          value={value.title ?? ""}
          placeholder="협회 연혁"
          onChange={(e) => onChange({ ...value, title: e.target.value || undefined })}
        />
      </div>
      {items.map((it, i) => (
        <div key={i} className="space-y-2 rounded-md border border-dashed border-border p-3">
          <div className="flex gap-2">
            <Input
              className="w-36"
              value={it.date}
              placeholder="예: 2026.03"
              onChange={(e) => update(i, { date: e.target.value })}
            />
            <Input value={it.title} placeholder="있었던 일" onChange={(e) => update(i, { title: e.target.value })} />
            <Button type="button" variant="ghost" size="icon" aria-label="위로" disabled={i === 0} onClick={() => move(i, -1)}>
              <ArrowUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="아래로"
              disabled={i === items.length - 1}
              onClick={() => move(i, 1)}
            >
              <ArrowDown className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" aria-label="삭제" onClick={() => set(items.filter((_, j) => j !== i))}>
              <Trash2 className="size-4" />
            </Button>
          </div>
          <Textarea
            rows={2}
            value={it.description ?? ""}
            placeholder="자세한 설명 (선택)"
            onChange={(e) => update(i, { description: e.target.value || undefined })}
          />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => set([...items, { date: "", title: "" }])}>
        <Plus className="size-4" /> 항목 추가
      </Button>
    </div>
  );
}
