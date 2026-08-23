import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TextBlockProps } from "@/lib/blocks/types";

const VARIANT_LABELS = {
  default: "기본 (본문)",
  lead: "리드 (가운데 정렬, 큰 제목)",
  quote: "강조 인용구 (색상 배경)",
} as const;

export function TextBlockForm({
  value,
  onChange,
}: {
  value: TextBlockProps;
  onChange: (next: TextBlockProps) => void;
}) {
  const variant = value.variant ?? "default";

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>스타일</Label>
        <Select
          value={variant}
          onValueChange={(v) =>
            onChange({ ...value, variant: v as TextBlockProps["variant"] })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {(value: keyof typeof VARIANT_LABELS) => VARIANT_LABELS[value] ?? value}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(VARIANT_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>소제목</Label>
        <Input
          value={value.title ?? ""}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>내용</Label>
        <Textarea
          rows={5}
          value={value.content}
          onChange={(e) => onChange({ ...value, content: e.target.value })}
        />
      </div>
    </div>
  );
}
