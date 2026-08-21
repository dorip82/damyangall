"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { X, Upload, Paperclip } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
// Excludes executable/script-bearing types (.html, .svg, .js, .exe, ...) —
// an uploaded file gets served back from our own domain's public bucket, so
// anything a browser would execute inline is off the table.
const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "hwp",
  "zip",
  "txt",
  "png",
  "jpg",
  "jpeg",
  "gif",
];

export function CommunityAttachmentField({
  defaultValue,
  defaultFileName,
}: {
  defaultValue?: string | null;
  defaultFileName?: string | null;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [fileName, setFileName] = useState(defaultFileName ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast.error(
        `첨부할 수 없는 파일 형식입니다. (${ALLOWED_EXTENSIONS.join(", ")}만 가능)`
      );
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const path = `attachments/${crypto.randomUUID()}.${ext}`;

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
    setFileName(file.name);
    setUploading(false);
  }

  return (
    <div className="space-y-2">
      <Label>첨부파일 (선택)</Label>
      <input type="hidden" name="attachmentUrl" value={url} />
      <input type="hidden" name="attachmentName" value={fileName} />

      {url ? (
        <div className="flex w-fit items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
          <Paperclip className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <span className="max-w-56 truncate">{fileName}</span>
          <button
            type="button"
            onClick={() => {
              setUrl("");
              setFileName("");
            }}
            aria-label="첨부파일 제거"
            className="text-muted-foreground hover:text-foreground"
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
          {uploading ? "업로드 중..." : "파일 첨부"}
        </Button>
      )}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      <p className="text-xs text-muted-foreground">
        최대 10MB ({ALLOWED_EXTENSIONS.join(", ")})
      </p>
    </div>
  );
}
