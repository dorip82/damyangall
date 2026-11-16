"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ALLOWED_DOC_EXT, uploadSiteAsset } from "@/components/admin/AssetUpload";
import { addSiteFile, deleteSiteFile, toggleSiteFile } from "@/app/admin/(protected)/files/actions";
import type { SiteFile } from "@/types/site";

const MAX = 30 * 1024 * 1024;

export function FilesManager({ siteId, categories, files }: { siteId: string; categories: string[]; files: SiteFile[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [pending, start] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fileRef.current?.files?.[0];
    const title = String(fd.get("title") ?? "").trim();
    if (!file) return toast.error("올릴 파일을 선택해주세요.");
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED_DOC_EXT.includes(ext)) return toast.error(`올릴 수 있는 형식: ${ALLOWED_DOC_EXT.join(", ")}`);
    if (file.size > MAX) return toast.error("파일은 30MB 이하만 올릴 수 있습니다.");
    setBusy(true);
    try {
      const asset = await uploadSiteAsset(siteId, "files", file);
      const r = await addSiteFile(siteId, {
        category: String(fd.get("category")),
        title: title || file.name.replace(/\.[^.]+$/, ""),
        description: String(fd.get("description") ?? ""),
        fileUrl: asset.url,
        fileName: file.name,
        fileSize: file.size,
      });
      if (r.ok) {
        toast.success("자료를 등록했습니다.");
        form.reset();
        router.refresh();
      } else toast.error(r.error ?? "등록하지 못했습니다.");
    } catch (err) {
      console.error(err);
      toast.error("업로드하지 못했습니다. 권한 또는 저장소 설정을 확인해주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="max-w-2xl space-y-4 rounded-md border border-border p-4">
        <p className="font-semibold">새 자료 올리기</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category">분류</Label>
            <select id="category" name="category" className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">제목 (비우면 파일 이름)</Label>
            <Input id="title" name="title" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">설명 (선택)</Label>
          <Input id="description" name="description" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="file">파일 (PDF, HWP, DOCX, XLSX 등 · 30MB 이하)</Label>
          <input
            id="file"
            ref={fileRef}
            type="file"
            accept={ALLOWED_DOC_EXT.map((e) => `.${e}`).join(",")}
            className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-2"
          />
        </div>
        <Button type="submit" disabled={busy}>
          <Upload className="size-4" />
          {busy ? "올리는 중…" : "올리기"}
        </Button>
      </form>

      {files.length ? (
        <ul className="divide-y divide-border rounded-md border border-border">
          {files.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Badge variant="secondary">{f.category}</Badge>
              <a href={f.file_url} target="_blank" rel="noreferrer" className="font-medium underline-offset-2 hover:underline">
                {f.title}
              </a>
              <span className="text-xs text-muted-foreground">
                {f.file_name} · 다운로드 {f.download_count}
              </span>
              <label className="ml-auto flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  className="size-4"
                  defaultChecked={f.is_published}
                  disabled={pending}
                  onChange={(e) => {
                    const v = e.target.checked;
                    start(async () => {
                      const r = await toggleSiteFile(siteId, f.id, v);
                      if (!r.ok) toast.error("변경하지 못했습니다.");
                    });
                  }}
                />
                공개
              </label>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`${f.title} 삭제`}
                disabled={pending}
                onClick={() => {
                  if (!window.confirm(`"${f.title}" 자료를 삭제할까요? 파일도 함께 삭제됩니다.`)) return;
                  start(async () => {
                    const r = await deleteSiteFile(siteId, f.id);
                    if (r.ok) {
                      toast.success("삭제했습니다.");
                      router.refresh();
                    } else toast.error("삭제하지 못했습니다.");
                  });
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">등록된 자료가 없습니다.</p>
      )}
    </div>
  );
}
