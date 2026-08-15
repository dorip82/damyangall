/**
 * Hand-written to match supabase/migrations/0001_init_core.sql exactly.
 * Once the Supabase project exists, regenerate with:
 *   npx supabase gen types typescript --project-id <id> > types/database.ts
 * and re-apply this file's structure if any manual adjustments were made.
 */

export type UserRole = "SUPER_ADMIN" | "SITE_ADMIN" | "EDITOR" | "USER";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING" | "DELETED";
export type SiteStatus =
  | "DRAFT"
  | "PENDING"
  | "ACTIVE"
  | "REJECTED"
  | "SUSPENDED"
  | "ARCHIVED";
export type SiteMemberRole = "SITE_ADMIN" | "EDITOR" | "MEMBER";
export type SiteMemberStatus = "ACTIVE" | "PENDING" | "SUSPENDED";
export type SiteTemplateCategory =
  | "BUSINESS"
  | "RESTAURANT"
  | "CAFE"
  | "ACCOMMODATION"
  | "ACADEMY"
  | "WORKSHOP"
  | "SPORTS"
  | "ORGANIZATION"
  | "CLUB"
  | "COMMUNITY"
  | "INSTITUTION";
export type PostStatus =
  | "DRAFT"
  | "PENDING"
  | "PUBLISHED"
  | "REJECTED"
  | "HIDDEN"
  | "ARCHIVED";
export type MenuType = "PAGE" | "POSTS" | "EXTERNAL_LINK";
export type InquiryStatus = "PUBLISHED" | "HIDDEN";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          nickname: string | null;
          phone: string | null;
          profile_image_url: string | null;
          role: UserRole;
          status: UserStatus;
          created_at: string;
          updated_at: string;
          last_login_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
        Relationships: [];
      };
      site_templates: {
        Row: {
          id: string;
          name: string;
          category: SiteTemplateCategory;
          description: string | null;
          preview_image: string | null;
          schema: Record<string, unknown>;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["site_templates"]["Row"]
        > & {
          name: string;
          category: SiteTemplateCategory;
        };
        Update: Partial<Database["public"]["Tables"]["site_templates"]["Row"]>;
        Relationships: [];
      };
      sites: {
        Row: {
          id: string;
          owner_id: string | null;
          name: string;
          slug: string;
          category: string;
          subcategory: string | null;
          description: string | null;
          logo_url: string | null;
          thumbnail_url: string | null;
          cover_url: string | null;
          phone: string | null;
          email: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          business_hours: Record<string, unknown> | null;
          website_url: string | null;
          instagram_url: string | null;
          facebook_url: string | null;
          status: SiteStatus;
          template_id: string | null;
          created_at: string;
          updated_at: string;
          published_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["sites"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["sites"]["Row"]>;
        Relationships: [];
      };
      site_members: {
        Row: {
          id: string;
          site_id: string;
          user_id: string;
          role: SiteMemberRole;
          status: SiteMemberStatus;
          joined_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["site_members"]["Row"]
        > & {
          site_id: string;
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_members"]["Row"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          site_id: string;
          primary_color: string | null;
          secondary_color: string | null;
          accent_color: string | null;
          font_family: string | null;
          header_style: string | null;
          footer_style: string | null;
          show_logo: boolean;
          show_phone: boolean;
          show_address: boolean;
          show_map: boolean;
          seo_title: string | null;
          seo_description: string | null;
          og_image: string | null;
          settings: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["site_settings"]["Row"]
        > & {
          site_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
        Relationships: [];
      };
      site_pages: {
        Row: {
          id: string;
          site_id: string;
          title: string;
          slug: string;
          page_type: string;
          content: { version: 1; blocks: unknown[] };
          sort_order: number;
          is_home: boolean;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["site_pages"]["Row"]> & {
          site_id: string;
          title: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_pages"]["Row"]>;
        Relationships: [];
      };
      site_menus: {
        Row: {
          id: string;
          site_id: string;
          title: string;
          url: string;
          menu_type: MenuType;
          parent_id: string | null;
          sort_order: number;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["site_menus"]["Row"]> & {
          site_id: string;
          title: string;
          url: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_menus"]["Row"]>;
        Relationships: [];
      };
      site_posts: {
        Row: {
          id: string;
          site_id: string;
          author_id: string | null;
          category: string | null;
          title: string;
          content: { version: 1; blocks: unknown[] };
          thumbnail_url: string | null;
          video_url: string | null;
          view_count: number;
          like_count: number;
          status: PostStatus;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["site_posts"]["Row"]> & {
          site_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_posts"]["Row"]>;
        Relationships: [];
      };
      site_inquiries: {
        Row: {
          id: string;
          site_id: string;
          author_name: string;
          author_contact: string | null;
          title: string;
          content: string;
          status: InquiryStatus;
          reply_content: string | null;
          replied_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["site_inquiries"]["Row"]
        > & {
          site_id: string;
          author_name: string;
          title: string;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_inquiries"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_site_post_view: {
        Args: { target_post_id: string };
        Returns: void;
      };
    };
    Enums: {
      user_role: UserRole;
      user_status: UserStatus;
      site_status: SiteStatus;
      site_member_role: SiteMemberRole;
      site_member_status: SiteMemberStatus;
      site_template_category: SiteTemplateCategory;
      post_status: PostStatus;
      menu_type: MenuType;
      inquiry_status: InquiryStatus;
    };
  };
}
