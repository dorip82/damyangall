"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { FileText, X } from "lucide-react";
import { AssetUploadButton } from "@/components/admin/AssetUpload";
import { BODY_IMAGE_RE } from "@/lib/site/post-body";
import { toast } from "sonner";
import type { PostFormState } from "@/app/admin/(protected)/posts/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SitePost } from "@/types/site";
import { STANDARD_POST_CATEGORIES } from "@/lib/site/posts";

const POST_STATUS_LABELS = { DRAFT: "임시저장", PUBLISHED: "게시" } as const;
function getPostStatusLabel(status: string): string {
  return POST_STATUS_LABELS[status as keyof typeof POST_STATUS_LABELS] ?? status;
}

const initialState: PostFormState = { ok: false };

export function PostForm({
  siteId,
  post,
  action,
  submitLabel,
  categories = STANDARD_POST_CATEGORIES,
  defaultCategory = "활동내역",
  board = false,
}: {
  /** 협회형 게시판: 상단 고정 · 첨부파일 · 본문 사진 넣기 사용 */
  board?: boolean;
  categories?: readonly string[];
  defaultCategory?: string;
  siteId: string;
  post?: SitePost;
  action: (prevState: PostFormState, formData: FormData) => Promise<PostFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (state === initialState) return;
    if (state.ok) toast.success("저장되었습니다.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  const initialContent =
    post?.content.blocks.find((b) => b.type === "text")?.props.content ?? "";
  const galleryBlock = post?.content.blocks.find((b) => b.type === "gallery");
  const initialPhotos =
    galleryBlock?.type === "gallery" ? galleryBlock.props.images.map((img) => img.url).join("\n") : "";

  const [photos, setPhotos] = useState(initialPhotos);
  const [thumb, setThumb] = useState(post?.thumbnail_url ?? "");
  const [body, setBody] = useState(initialContent);
  const [files, setFiles] = useState<{ url: string; name: string; size?: number }[]>(post?.attachments ?? []);
  /** 사진 버튼을 누르면 입력창 포커스가 빠지므로 마지막 커서 위치를 기억해 둔다 */
  const caretRef = useRef<number | null>(null);
  const bodyImages = board ? [...body.matchAll(new RegExp(BODY_IMAGE_RE.source, "gm"))].map((m) => m[2]) : [];

  /** 커서 위치(없으면 끝)에 사진 줄을 끼워 넣는다 */
  function insertImage(url: string) {
    setBody((cur) => {
      const at = Math.min(caretRef.current ?? cur.length, cur.length);
      const before = cur.slice(0, at);
      const rest = cur.slice(at).replace(/^\n/, "");
      const head = `${before}${before && !before.endsWith("\n") ? "\n" : ""}![사진](${url})\n`;
      caretRef.current = head.length;
      return head + rest;
    });
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <input type="hidden" name="siteId" value={siteId} />

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" name="title" defaultValue={post?.title ?? ""} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">분류</Label>
        <Input
          id="category"
          name="category"
          list="post-category-options"
          defaultValue={post?.category ?? defaultCategory}
        />
        <datalist id="post-category-options">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <p className="text-xs text-muted-foreground">
          {categories.join(" · ")} 중에서 고르면 홈페이지의 같은 이름 메뉴에 정확히 분류됩니다.
        </p>
      </div>

      {board ? (
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="isPinned" defaultChecked={post?.is_pinned ?? false} className="size-4" />
          게시판 맨 위에 고정 (공지)
        </label>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <Textarea
          id="content"
          name="content"
          rows={board ? 14 : 8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onSelect={(e) => (caretRef.current = e.currentTarget.selectionStart)}
          required
        />
        {board ? (
          <div className="space-y-2">
            <AssetUploadButton
              siteId={siteId}
              folder="posts/body"
              label="본문에 사진 넣기"
              onUploaded={(a) => insertImage(a.url)}
            />
            <p className="text-xs text-muted-foreground">
              커서가 있는 자리에 <code>![사진](주소)</code> 줄이 들어가고, 홈페이지 본문에서는 그 자리에 사진이 나옵니다. 괄호 앞
              [ ] 안의 글은 사진 설명(대체 텍스트)이니 알맞게 바꿔주세요. 줄을 지우면 사진도 빠집니다.
            </p>
            {bodyImages.length ? (
              <ul className="flex flex-wrap gap-2" aria-label="본문에 들어간 사진">
                {bodyImages.map((u, i) => (
                  <li key={u + i}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="h-16 w-auto rounded border border-border object-cover" />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>

      {board ? (
        <div className="space-y-2">
          <Label>첨부파일</Label>
          <input type="hidden" name="attachments" value={JSON.stringify(files)} />
          {files.length ? (
            <ul className="divide-y divide-border rounded-md border border-border text-sm">
              {files.map((a, i) => (
                <li key={a.url} className="flex items-center gap-2 px-3 py-2">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <a href={a.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate hover:underline">
                    {a.name}
                  </a>
                  {a.size ? <span className="text-xs text-muted-foreground">{Math.max(1, Math.round(a.size / 1024))}KB</span> : null}
                  <button
                    type="button"
                    aria-label={`${a.name} 첨부 빼기`}
                    onClick={() => setFiles((v) => v.filter((_, j) => j !== i))}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <AssetUploadButton
              siteId={siteId}
              folder="posts/files"
              kind="file"
              label="첨부파일 올리기"
              onUploaded={(a) => setFiles((v) => (v.length >= 20 ? v : [...v, { url: a.url, name: a.name, size: a.size }]))}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            PDF · HWP · 워드 · 엑셀 · 이미지 파일 등 (한 파일 30MB, 최대 20개). 첨부한 이미지는 본문에 나오지 않고 첨부파일 목록에 정리됩니다.
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="videoUrl">유튜브 URL</Label>
        <Input
          id="videoUrl"
          name="videoUrl"
          placeholder="https://youtu.be/..."
          defaultValue={post?.video_url ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          입력하면 목록에는 유튜브 썸네일이, 상세 페이지에는 재생 가능한 영상이 표시됩니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="photoUrls">{board ? "사진 갤러리용 사진 (선택, 한 줄에 하나)" : "활동 사진 URL (선택, 한 줄에 하나)"}</Label>
        <Textarea
          id="photoUrls"
          name="photoUrls"
          rows={4}
          placeholder={"https://…/photo1.jpg\nhttps://…/photo2.jpg"}
          value={photos}
          onChange={(e) => setPhotos(e.target.value)}
        />
        <AssetUploadButton
          siteId={siteId}
          folder="posts"
          label={board ? "갤러리 사진 올리기" : "사진 올리기 (여러 번 가능)"}
          onUploaded={(asset) => setPhotos((v) => (v.trim() ? v.trim() + String.fromCharCode(10) + asset.url : asset.url))}
        />
        <p className="text-xs text-muted-foreground">
          입력한 사진은 게시물 아래 갤러리와 &quot;활동 사진&quot; 모음에 표시되고, 누르면 크게 볼 수 있습니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="thumbnailUrl">썸네일 이미지 URL (선택)</Label>
        <Input
          id="thumbnailUrl"
          name="thumbnailUrl"
          placeholder="비워두면 유튜브 썸네일을 자동으로 사용합니다"
          value={thumb}
          onChange={(e) => setThumb(e.target.value)}
        />
        <AssetUploadButton siteId={siteId} folder="posts" label="썸네일 올리기" onUploaded={(a) => setThumb(a.url)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">상태</Label>
        <Select name="status" defaultValue={post?.status ?? "DRAFT"}>
          <SelectTrigger id="status" className="w-40">
            <SelectValue>{(value: string) => getPostStatusLabel(value)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DRAFT">임시저장</SelectItem>
            <SelectItem value="PUBLISHED">게시</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "저장 중..." : submitLabel}
      </Button>
    </form>
  );
}
