import type { Database } from "@/types/database";

export type NewsRow = Database["public"]["Tables"]["news"]["Row"];
export type NewsSourceRow = Database["public"]["Tables"]["news_sources"]["Row"];
