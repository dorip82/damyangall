import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SnsBlockProps } from "@/lib/blocks/types";

export function SnsBlockForm({
  value,
  onChange,
}: {
  value: SnsBlockProps;
  onChange: (next: SnsBlockProps) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Instagram URL</Label>
        <Input
          value={value.instagram ?? ""}
          onChange={(e) => onChange({ ...value, instagram: e.target.value || null })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Facebook URL</Label>
        <Input
          value={value.facebook ?? ""}
          onChange={(e) => onChange({ ...value, facebook: e.target.value || null })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>YouTube URL</Label>
        <Input
          value={value.youtube ?? ""}
          onChange={(e) => onChange({ ...value, youtube: e.target.value || null })}
        />
      </div>
    </div>
  );
}
