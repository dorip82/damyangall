"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { proxiedImageSrc } from "@/lib/utils/image-proxy";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
// When resizing, the original never leaves the browser — only the small
// re-encoded JPEG is uploaded — so a phone camera photo can be allowed.
const MAX_RESIZE_SOURCE_SIZE = 20 * 1024 * 1024;

/**
 * Center-crops the image to exactly width x height (cover, like object-fit)
 * and re-encodes it as JPEG, so every listing photo ends up the same size
 * no matter what the admin uploads.
 */
async function cropToSize(file: File, width: number, height: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.max(width / bitmap.width, height / bitmap.height);
  const sw = width / scale;
  const sh = height / scale;
  const sx = (bitmap.width - sw) / 2;
  const sy = (bitmap.height - sh) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // transparent PNGs would otherwise turn black in JPEG
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))), "image/jpeg", 0.85)
  );
}

export function ListingImageField({
  defaultValue,
  name = "imageUrl",
  label = "사진",
  previewClassName = "aspect-video w-full max-w-xs rounded-md border border-border object-cover",
  resizeTo,
}: {
  defaultValue?: string | null;
  name?: string;
  label?: string;
  previewClassName?: string;
  /** Crop + resize uploads to this exact size (JPEG). Omit to upload as-is. */
  resizeTo?: { width: number; height: number };
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }
    const maxSize = resizeTo ? MAX_RESIZE_SOURCE_SIZE : MAX_FILE_SIZE;
    if (file.size > maxSize) {
      toast.error(`파일 크기는 ${maxSize / 1024 / 1024}MB 이하여야 합니다.`);
      return;
    }

    setUploading(true);
    let body: Blob = file;
    let ext = file.name.split(".").pop();
    if (resizeTo) {
      try {
        body = await cropToSize(file, resizeTo.width, resizeTo.height);
        ext = "jpg";
      } catch {
        toast.error("이미지를 처리하지 못했습니다. 다른 파일로 시도해주세요.");
        setUploading(false);
        return;
      }
    }

    const supabase = createClient();
    const path = `${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

    const { error } = await supabase.storage
      .from("directory-images")
      .upload(path, body, { cacheControl: "3600", contentType: body.type || undefined });

    if (error) {
      toast.error("업로드 중 오류가 발생했습니다.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("directory-images").getPublicUrl(path);
    setUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <input type="hidden" name={name} value={url} />

      {url ? (
        // A URL typed/stored here (e.g. a scraped news thumbnail) may be
        // plain http — proxiedImageSrc no-ops on https, so this is safe for
        // every other caller's own https-only uploads too.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={proxiedImageSrc(url)!} alt="" className={previewClassName} />
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          id={name}
          placeholder="https://... 또는 아래에서 파일 업로드"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="max-w-sm"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" />
          {uploading ? "업로드 중..." : "파일 업로드"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        URL을 직접 입력하거나, 파일을 업로드하면 자동으로 채워집니다.{" "}
        {resizeTo
          ? `(최대 20MB, ${resizeTo.width}×${resizeTo.height} 크기로 가운데를 잘라 저장됩니다)`
          : "(최대 5MB)"}
      </p>
    </div>
  );
}
