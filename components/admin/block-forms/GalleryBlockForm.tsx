import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import type { GalleryBlockProps } from "@/lib/blocks/types";

export function GalleryBlockForm({
  value,
  onChange,
}: {
  value: GalleryBlockProps;
  onChange: (next: GalleryBlockProps) => void;
}) {
  const images = value.images ?? [];

  function updateImage(index: number, url: string, caption: string) {
    const next = images.slice();
    next[index] = { url, caption: caption || undefined };
    onChange({ ...value, images: next });
  }

  function removeImage(index: number) {
    onChange({ ...value, images: images.filter((_, i) => i !== index) });
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

      <div className="space-y-2">
        <Label>이미지 목록</Label>
        {images.map((img, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={img.url}
              placeholder="이미지 URL"
              onChange={(e) => updateImage(i, e.target.value, img.caption ?? "")}
            />
            <Input
              value={img.caption ?? ""}
              placeholder="캡션(선택)"
              onChange={(e) => updateImage(i, img.url, e.target.value)}
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(i)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange({ ...value, images: [...images, { url: "" }] })}
        >
          <Plus className="size-4" /> 이미지 추가
        </Button>
      </div>
    </div>
  );
}
