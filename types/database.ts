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
export type DirectoryCategory =
  | "CAFE"
  | "RESTAURANT"
  | "GAS_STATION"
  | "PHARMACY"
  | "PARKING"
  | "PENSION"
  | "MART"
  | "BANK";
export type DirectoryListingStatus = "PUBLISHED" | "HIDDEN";
export type FavoriteTargetType = "DIRECTORY_LISTING" | "SITE";
export type CommunityCategory =
  | "FREE"
  | "LOCAL_INFO"
  | "FOOD"
  | "TRAVEL"
  | "JOBS"
  | "MARKET"
  | "CLUB_RECRUIT"
  | "EVENT_INFO"
  | "REPORT";
export type CommunityPostStatus = "PUBLISHED" | "HIDDEN";
export type EventStatus = "PUBLISHED" | "HIDDEN";

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
      directory_listings: {
        Row: {
          id: string;
          category: DirectoryCategory;
          name: string;
          description: string | null;
          phone: string | null;
          address: string | null;
          image_url: string | null;
          instagram_url: string | null;
          status: DirectoryListingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["directory_listings"]["Row"]
        > & {
          category: DirectoryCategory;
          name: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["directory_listings"]["Row"]
        >;
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          target_type: FavoriteTargetType;
          target_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["favorites"]["Row"]> & {
          user_id: string;
          target_type: FavoriteTargetType;
          target_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["favorites"]["Row"]>;
        Relationships: [];
      };
      community_posts: {
        Row: {
          id: string;
          category: CommunityCategory;
          author_name: string;
          title: string;
          content: string;
          status: CommunityPostStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["community_posts"]["Row"]
        > & {
          author_name: string;
          title: string;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["community_posts"]["Row"]>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          location: string | null;
          start_at: string;
          end_at: string | null;
          image_url: string | null;
          status: EventStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["events"]["Row"]> & {
          title: string;
          start_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Row"]>;
        Relationships: [];
      };
      main_page_settings: {
        Row: {
          id: number;
          hero_title: string;
          hero_subtitle: string;
          news_banner_visible: boolean;
          news_banner_title: string;
          news_banner_description: string;
          today_banner_visible: boolean;
          today_banner_title: string;
          today_banner_description: string;
          ad_banner_visible: boolean;
          ad_banner_title: string;
          ad_banner_description: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["main_page_settings"]["Row"]
        > & {
          id: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["main_page_settings"]["Row"]
        >;
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
      directory_category: DirectoryCategory;
      directory_listing_status: DirectoryListingStatus;
      community_category: CommunityCategory;
      community_post_status: CommunityPostStatus;
      event_status: EventStatus;
    };
  };
}
