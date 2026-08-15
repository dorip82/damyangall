import type { AnyBlock } from "@/lib/blocks/types";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { TextBlock } from "@/components/blocks/TextBlock";
import { ImageBlock } from "@/components/blocks/ImageBlock";
import { GalleryBlock } from "@/components/blocks/GalleryBlock";
import { CardBlock } from "@/components/blocks/CardBlock";
import { MapBlock } from "@/components/blocks/MapBlock";
import { ContactBlock } from "@/components/blocks/ContactBlock";
import { SnsBlock } from "@/components/blocks/SnsBlock";
import { DividerBlock } from "@/components/blocks/DividerBlock";
import { SpacerBlock } from "@/components/blocks/SpacerBlock";

/**
 * Renders one block. `content` is untrusted JSONB from the database, so an
 * unrecognized `type` is skipped rather than crashing the page.
 */
function renderBlock(block: AnyBlock, siteId: string) {
  switch (block.type) {
    case "hero":
      return <HeroBlock {...block.props} />;
    case "text":
      return <TextBlock {...block.props} />;
    case "image":
      return <ImageBlock {...block.props} />;
    case "gallery":
      return <GalleryBlock {...block.props} />;
    case "card":
      return <CardBlock props={block.props} siteId={siteId} />;
    case "map":
      return <MapBlock {...block.props} />;
    case "contact":
      return <ContactBlock {...block.props} />;
    case "sns":
      return <SnsBlock {...block.props} />;
    case "divider":
      return <DividerBlock {...block.props} />;
    case "spacer":
      return <SpacerBlock {...block.props} />;
    default:
      if (process.env.NODE_ENV !== "production") {
        console.warn("BlockRenderer: unknown block type", block);
      }
      return null;
  }
}

export function BlockRenderer({
  blocks,
  siteId,
}: {
  blocks: AnyBlock[];
  siteId: string;
}) {
  return (
    <>
      {blocks.map((block) => (
        <div key={block.id}>{renderBlock(block, siteId)}</div>
      ))}
    </>
  );
}
