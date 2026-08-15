import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ImageBlockProps } from "@/lib/blocks/types";

export function ImageBlockForm({
  value,
  onChange,
}: {
  value: ImageBlockProps;
  onChange: (next: ImageBlockProps) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>이미지 URL</Label>
        <Input
          value={value.image}
          onChange={(e) => onChange({ ...value, image: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>캡션</Label>
        <Input
          value={value.caption ?? ""}
          onChange={(e) => onChange({ ...value, caption: e.target.value })}
        />
      </div>
    </div>
  );
}
