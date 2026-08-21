"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ListingImageField({
  defaultValue,
  name = "imageUrl",
  label = "사진",
}: {
  defaultValue?: string | null;
  name?: string;
  label?: string;
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
    if (file.size > MAX_FILE_SIZE) {
      toast.error("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

    const { error } = await supabase.storage
      .from("directory-images")
      .upload(path, file, { cacheControl: "3600" });

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
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="aspect-video w-full max-w-xs rounded-md border border-border object-cover"
        />
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
        URL을 직접 입력하거나, 파일을 업로드하면 자동으로 채워집니다. (최대 5MB)
      </p>
    </div>
  );
}
