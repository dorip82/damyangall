"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { X, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload-only (no manual URL text box) unlike the admin ListingImageField —
 * this form is public/anonymous, so letting visitors type an arbitrary
 * "image URL" would be an easy spot to slip in something other than an
 * image. Uploading restricts the value to whatever our own Storage bucket
 * returns.
 */
export function CommunityImageField({ defaultValue }: { defaultValue?: string | null }) {
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
      toast.error("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `images/${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

    const { error } = await supabase.storage
      .from("community-uploads")
      .upload(path, file, { cacheControl: "3600" });

    if (error) {
      toast.error("업로드 중 오류가 발생했습니다.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("community-uploads").getPublicUrl(path);
    setUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      <Label>사진 (선택)</Label>
      <input type="hidden" name="imageUrl" value={url} />

      {url ? (
        <div className="relative w-full max-w-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="aspect-video w-full rounded-md border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => setUrl("")}
            aria-label="사진 제거"
            className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" />
          {uploading ? "업로드 중..." : "사진 첨부"}
        </Button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="text-xs text-muted-foreground">최대 5MB, 이미지 파일만 가능합니다.</p>
    </div>
  );
}
