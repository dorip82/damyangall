"use client";

import { createContext, use, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

/** 블록 편집 폼처럼 siteId 를 직접 받지 않는 곳에서 업로드 경로를 정하기 위한 컨텍스트 */
export const AdminSiteIdContext = createContext<string | null>(null);

const IMAGE_MAX = 10 * 1024 * 1024;
const FILE_MAX = 30 * 1024 * 1024;

export const ALLOWED_DOC_EXT = ["pdf", "hwp", "hwpx", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "zip", "txt", "jpg", "jpeg", "png"];

export interface UploadedAsset {
  url: string;
  name: string;
  size: number;
}

/**
 * Supabase Storage "site-assets" 버킷에 {siteId}/{폴더}/ 아래로 올린다.
 * 저장소 정책상 그 사이트의 편집자만 올릴 수 있다 (0021 마이그레이션).
 */
export async function uploadSiteAsset(siteId: string, folder: string, file: File): Promise<UploadedAsset> {
  const supabase = createClient();
  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${siteId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from("site-assets")
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
  return { url: data.publicUrl, name: file.name, size: file.size };
}

/** 이미지 하나를 올리고 URL 을 돌려주는 버튼 */
export function AssetUploadButton({
  siteId: siteIdProp,
  folder = "images",
  kind = "image",
  label,
  onUploaded,
  size = "sm",
}: {
  siteId?: string;
  folder?: string;
  kind?: "image" | "file";
  label?: string;
  onUploaded: (asset: UploadedAsset) => void;
  size?: "sm" | "default";
}) {
  const ctxSiteId = use(AdminSiteIdContext);
  const siteId = siteIdProp ?? ctxSiteId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  if (!siteId) return null;

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !siteId) return;
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (kind === "image" && !file.type.startsWith("image/")) {
      toast.error("이미지 파일만 올릴 수 있습니다.");
      return;
    }
    if (kind === "file" && !ALLOWED_DOC_EXT.includes(ext)) {
      toast.error(`올릴 수 있는 파일: ${ALLOWED_DOC_EXT.join(", ")}`);
      return;
    }
    const max = kind === "image" ? IMAGE_MAX : FILE_MAX;
    if (file.size > max) {
      toast.error(`파일 크기는 ${max / 1024 / 1024}MB 이하여야 합니다.`);
      return;
    }
    setBusy(true);
    try {
      onUploaded(await uploadSiteAsset(siteId, folder, file));
      toast.success("업로드했습니다.");
    } catch (err) {
      console.error(err);
      toast.error("업로드하지 못했습니다. 권한 또는 저장소 설정을 확인해주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={kind === "image" ? "image/*" : ALLOWED_DOC_EXT.map((e) => `.${e}`).join(",")}
        onChange={onChange}
      />
      <Button type="button" variant="outline" size={size} disabled={busy} onClick={() => inputRef.current?.click()}>
        <Upload className="size-4" />
        {busy ? "올리는 중…" : (label ?? (kind === "image" ? "사진 올리기" : "파일 올리기"))}
      </Button>
    </>
  );
}

/** 폼 안에서 쓰는 이미지 URL 입력 + 업로드 + 미리보기 (name 으로 제출) */
export function ImageUrlField({
  siteId,
  name,
  defaultValue,
  folder = "images",
}: {
  siteId: string;
  name: string;
  defaultValue?: string | null;
  folder?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://… 또는 사진 올리기"
          className="h-9 min-w-0 flex-1 rounded-md border border-input bg-transparent px-3 text-sm"
        />
        <AssetUploadButton siteId={siteId} folder={folder} onUploaded={(a) => setUrl(a.url)} />
      </div>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-28 w-auto rounded-md border border-border object-cover" />
      ) : null}
    </div>
  );
}
