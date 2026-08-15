import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import type { CardBlockProps } from "@/lib/blocks/types";

export function CardBlockForm({
  value,
  onChange,
}: {
  value: CardBlockProps;
  onChange: (next: CardBlockProps) => void;
}) {
  const items = value.items ?? [];

  function updateItem(index: number, patch: Partial<(typeof items)[number]>) {
    const next = items.slice();
    next[index] = { ...next[index], ...patch };
    onChange({ ...value, items: next });
  }

  function removeItem(index: number) {
    onChange({ ...value, items: items.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>제목</Label>
        <Input
          value={value.title ?? ""}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </div>

      {value.source === "site_posts" ? (
        <div className="space-y-1.5">
          <Label>표시 개수</Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={value.limit ?? 3}
            onChange={(e) =>
              onChange({ ...value, limit: Number(e.target.value) || 1 })
            }
          />
          <p className="text-xs text-muted-foreground">
            활동내역(site_posts)에서 최신순으로 자동으로 불러옵니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="space-y-2 rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <Label>카드 {i + 1}</Label>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Input
                value={item.title}
                placeholder="제목"
                onChange={(e) => updateItem(i, { title: e.target.value })}
              />
              <Textarea
                rows={2}
                value={item.description ?? ""}
                placeholder="설명"
                onChange={(e) => updateItem(i, { description: e.target.value })}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              onChange({ ...value, items: [...items, { title: "", description: "" }] })
            }
          >
            <Plus className="size-4" /> 카드 추가
          </Button>
        </div>
      )}
    </div>
  );
}
