import { cn } from "@/lib/utils";
import type { DividerBlockProps } from "@/lib/blocks/types";

const SPACING = { sm: "my-6", md: "my-10", lg: "my-16" } as const;

export function DividerBlock({ spacing = "md" }: DividerBlockProps) {
  return (
    <div className={cn("mx-auto max-w-4xl px-6", SPACING[spacing])}>
      <hr className="border-border" />
    </div>
  );
}
