"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { updatePageContent } from "@/app/admin/(protected)/pages/[pageId]/actions";
import { Button } from "@/components/ui/button";
import { HeroBlockForm } from "@/components/admin/block-forms/HeroBlockForm";
import { TextBlockForm } from "@/components/admin/block-forms/TextBlockForm";
import { ImageBlockForm } from "@/components/admin/block-forms/ImageBlockForm";
import { GalleryBlockForm } from "@/components/admin/block-forms/GalleryBlockForm";
import { CardBlockForm } from "@/components/admin/block-forms/CardBlockForm";
import { MapBlockForm } from "@/components/admin/block-forms/MapBlockForm";
import { ContactBlockForm } from "@/components/admin/block-forms/ContactBlockForm";
import { SnsBlockForm } from "@/components/admin/block-forms/SnsBlockForm";
import { SliderBlockForm } from "@/components/admin/block-forms/SliderBlockForm";
import { OfficersBlockForm } from "@/components/admin/block-forms/OfficersBlockForm";
import type { AnyBlock, BlockPropsMap, BlockType } from "@/lib/blocks/types";

const BLOCK_LABELS: Record<AnyBlock["type"], string> = {
  hero: "히어로",
  text: "텍스트",
  image: "이미지",
  gallery: "갤러리",
  card: "카드 목록",
  map: "지도",
  contact: "문의",
  sns: "SNS",
  divider: "구분선",
  spacer: "여백",
  slider: "메인 슬라이드",
  officers: "역대 임원진",
};

/** "블록 추가"로 새로 만들 때의 기본값 */
const NEW_BLOCK_PROPS: { [K in BlockType]: BlockPropsMap[K] } = {
  hero: { title: "제목" },
  text: { content: "내용을 입력해주세요." },
  image: { image: "" },
  gallery: { images: [] },
  card: { source: "static", items: [] },
  map: { latitude: null, longitude: null },
  contact: {},
  sns: {},
  divider: { spacing: "md" },
  spacer: { height: "md" },
  slider: { slides: [{ image: "" }], interval: 6 },
  officers: { terms: [] },
};

const ADDABLE_TYPES: BlockType[] = [
  "text",
  "gallery",
  "image",
  "officers",
  "slider",
  "card",
  "contact",
  "sns",
  "hero",
  "divider",
];

function BlockFormFor({
  block,
  onChange,
}: {
  block: AnyBlock;
  onChange: (props: AnyBlock["props"]) => void;
}) {
  switch (block.type) {
    case "hero":
      return <HeroBlockForm value={block.props} onChange={onChange} />;
    case "text":
      return <TextBlockForm value={block.props} onChange={onChange} />;
    case "image":
      return <ImageBlockForm value={block.props} onChange={onChange} />;
    case "gallery":
      return <GalleryBlockForm value={block.props} onChange={onChange} />;
    case "card":
      return <CardBlockForm value={block.props} onChange={onChange} />;
    case "map":
      return <MapBlockForm value={block.props} onChange={onChange} />;
    case "contact":
      return <ContactBlockForm value={block.props} onChange={onChange} />;
    case "sns":
      return <SnsBlockForm value={block.props} onChange={onChange} />;
    case "slider":
      return <SliderBlockForm value={block.props} onChange={onChange} />;
    case "officers":
      return <OfficersBlockForm value={block.props} onChange={onChange} />;
    case "divider":
    case "spacer":
      return <p className="text-sm text-muted-foreground">설정할 항목이 없습니다.</p>;
    default:
      return (
        <p className="text-sm text-muted-foreground">
          이 블록 유형은 관리자 화면에서 아직 편집할 수 없습니다.
        </p>
      );
  }
}

export function PageBlocksEditor({
  pageId,
  siteId,
  initialBlocks,
}: {
  pageId: string;
  siteId: string;
  initialBlocks: AnyBlock[];
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [newType, setNewType] = useState<BlockType>("text");
  const [pending, startTransition] = useTransition();

  function updateBlockProps(index: number, props: AnyBlock["props"]) {
    setBlocks((prev) =>
      prev.map((b, i) => (i === index ? ({ ...b, props } as AnyBlock) : b))
    );
  }

  function move(index: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.length) return prev;
      const next = prev.slice();
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function remove(index: number) {
    if (!window.confirm(`"${BLOCK_LABELS[blocks[index].type]}" 블록을 삭제할까요? 저장해야 반영됩니다.`)) return;
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function add() {
    const block = {
      id: `block-${newType}-${crypto.randomUUID().slice(0, 8)}`,
      type: newType,
      props: structuredClone(NEW_BLOCK_PROPS[newType]),
    } as AnyBlock;
    // 메인 슬라이드는 맨 위에, 나머지는 맨 아래에 추가한다.
    setBlocks((prev) => (newType === "slider" ? [block, ...prev] : [...prev, block]));
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updatePageContent(pageId, siteId, blocks);
      if (result.ok) toast.success("저장되었습니다.");
      else toast.error(result.error ?? "저장 중 오류가 발생했습니다.");
    });
  }

  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <div key={block.id} className="rounded-md border border-border p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-muted-foreground">{BLOCK_LABELS[block.type]}</p>
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="icon" aria-label="위로 이동" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="아래로 이동"
                disabled={i === blocks.length - 1}
                onClick={() => move(i, 1)}
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="블록 삭제" onClick={() => remove(i)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
          <BlockFormFor block={block} onChange={(props) => updateBlockProps(i, props)} />
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border p-4">
        <label htmlFor="new-block-type" className="text-sm font-medium">
          블록 추가
        </label>
        <select
          id="new-block-type"
          value={newType}
          onChange={(e) => setNewType(e.target.value as BlockType)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {ADDABLE_TYPES.map((t) => (
            <option key={t} value={t}>
              {BLOCK_LABELS[t]}
            </option>
          ))}
        </select>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus className="size-4" /> 추가
        </Button>
      </div>

      <Button onClick={handleSave} disabled={pending}>
        {pending ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}
