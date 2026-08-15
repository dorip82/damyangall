"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
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
import type { AnyBlock } from "@/lib/blocks/types";

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
};

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
  const [pending, startTransition] = useTransition();

  function updateBlockProps(index: number, props: AnyBlock["props"]) {
    setBlocks((prev) =>
      prev.map((b, i) => (i === index ? ({ ...b, props } as AnyBlock) : b))
    );
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
          <p className="mb-3 text-sm font-semibold text-muted-foreground">
            {BLOCK_LABELS[block.type]}
          </p>
          <BlockFormFor block={block} onChange={(props) => updateBlockProps(i, props)} />
        </div>
      ))}

      <Button onClick={handleSave} disabled={pending}>
        {pending ? "저장 중..." : "저장"}
      </Button>
    </div>
  );
}
