import type { Database } from "@/types/database";
import type { PageContent } from "@/lib/blocks/types";

export type Site = Database["public"]["Tables"]["sites"]["Row"];
export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
export type SiteMember = Database["public"]["Tables"]["site_members"]["Row"];
export type SiteMenu = Database["public"]["Tables"]["site_menus"]["Row"];
export type SiteTemplate = Database["public"]["Tables"]["site_templates"]["Row"];
export type SiteInquiry = Database["public"]["Tables"]["site_inquiries"]["Row"];

export type SitePage = Omit<
  Database["public"]["Tables"]["site_pages"]["Row"],
  "content"
> & { content: PageContent };

export type SitePost = Omit<
  Database["public"]["Tables"]["site_posts"]["Row"],
  "content"
> & { content: PageContent };
