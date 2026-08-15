import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { HeroBlockProps } from "@/lib/blocks/types";

export function HeroBlockForm({
  value,
  onChange,
}: {
  value: HeroBlockProps;
  onChange: (next: HeroBlockProps) => void;
}) {
  const showText = value.showText ?? true;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>제목</Label>
        <Input
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>부제목</Label>
        <Input
          value={value.subtitle ?? ""}
          onChange={(e) => onChange({ ...value, subtitle: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>이미지 URL</Label>
        <Input
          value={value.image ?? ""}
          onChange={(e) => onChange({ ...value, image: e.target.value })}
          placeholder="/images/... 또는 https://..."
        />
      </div>
      <div className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
        <div>
          <p className="text-sm font-medium">이미지에 제목/부제목이 이미 포함되어 있음</p>
          <p className="text-xs text-muted-foreground">
            켜면 이미지를 자르지 않고 그대로 보여주고, 위 제목/부제목은 화면에 다시 표시하지 않습니다.
          </p>
        </div>
        <Switch
          checked={!showText}
          onCheckedChange={(checked) => onChange({ ...value, showText: !checked })}
        />
      </div>
    </div>
  );
}
