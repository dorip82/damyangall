import { cn } from "@/lib/utils";
import type { SpacerBlockProps } from "@/lib/blocks/types";

const HEIGHT = { sm: "h-6", md: "h-12", lg: "h-24" } as const;

export function SpacerBlock({ height = "md" }: SpacerBlockProps) {
  return <div className={cn(HEIGHT[height])} aria-hidden />;
}
