import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MapBlockProps } from "@/lib/blocks/types";

export function MapBlockForm({
  value,
  onChange,
}: {
  value: MapBlockProps;
  onChange: (next: MapBlockProps) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>주소</Label>
        <Input
          value={value.address ?? ""}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>위도(latitude)</Label>
          <Input
            type="number"
            step="any"
            value={value.latitude ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                latitude: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label>경도(longitude)</Label>
          <Input
            type="number"
            step="any"
            value={value.longitude ?? ""}
            onChange={(e) =>
              onChange({
                ...value,
                longitude: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        위도/경도를 입력하지 않으면 준비 중 안내가 표시됩니다.
      </p>
    </div>
  );
}
