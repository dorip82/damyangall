-- ALLDAM Phase 0 — 소리향기 동아리 사이트
-- Minimal subset of the ALLDAM_MASTER_SPEC.md data model (sections 9, 11.1)
-- needed for one club "site": users, site_templates, sites, site_members,
-- site_settings, site_pages, site_menus, site_posts.

-- === Enums ===
create type user_role as enum ('SUPER_ADMIN','SITE_ADMIN','EDITOR','USER');
create type user_status as enum ('ACTIVE','SUSPENDED','PENDING','DELETED');
create type site_status as enum ('DRAFT','PENDING','ACTIVE','REJECTED','SUSPENDED','ARCHIVED');
create type site_member_role as enum ('SITE_ADMIN','EDITOR','MEMBER');
create type site_member_status as enum ('ACTIVE','PENDING','SUSPENDED');
create type site_template_category as enum (
  'BUSINESS','RESTAURANT','CAFE','ACCOMMODATION','ACADEMY','WORKSHOP',
  'SPORTS','ORGANIZATION','CLUB','COMMUNITY','INSTITUTION'
);
create type post_status as enum ('DRAFT','PENDING','PUBLISHED','REJECTED','HIDDEN','ARCHIVED');
create type menu_type as enum ('PAGE','POSTS','EXTERNAL_LINK');

-- === users (mirrors auth.users) ===
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  nickname text,
  phone text,
  profile_image_url text,
  role user_role not null default 'USER',
  status user_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- === site_templates ===
create table public.site_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category site_template_category not null,
  description text,
  preview_image text,
  schema jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- === sites ===
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id) on delete set null,
  name text not null,
  slug text not null unique,
  category text not null default '동아리',
  subcategory text,
  description text,
  logo_url text,
  thumbnail_url text,
  cover_url text,
  phone text,
  email text,
  address text,
  latitude numeric,
  longitude numeric,
  business_hours jsonb,
  website_url text,
  instagram_url text,
  facebook_url text,
  status site_status not null default 'DRAFT',
  template_id uuid references public.site_templates(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- === site_members ===
create table public.site_members (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role site_member_role not null default 'MEMBER',
  status site_member_status not null default 'ACTIVE',
  joined_at timestamptz not null default now(),
  unique (site_id, user_id)
);

-- === site_settings ===
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.sites(id) on delete cascade,
  primary_color text default '#24483A',
  secondary_color text default '#3F6650',
  accent_color text default '#B99B5F',
  font_family text default 'Pretendard',
  header_style text default 'default',
  footer_style text default 'default',
  show_logo boolean not null default true,
  show_phone boolean not null default true,
  show_address boolean not null default true,
  show_map boolean not null default true,
  seo_title text,
  seo_description text,
  og_image text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- === site_pages ===
create table public.site_pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  title text not null,
  slug text not null,
  page_type text not null default 'CUSTOM',
  content jsonb not null default '{"version":1,"blocks":[]}'::jsonb,
  sort_order integer not null default 0,
  is_home boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, slug)
);

-- Only one home page per site.
create unique index site_pages_one_home_per_site
  on public.site_pages (site_id) where (is_home);

-- === site_menus ===
create table public.site_menus (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  title text not null,
  url text not null,
  menu_type menu_type not null default 'PAGE',
  parent_id uuid references public.site_menus(id) on delete cascade,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- === site_posts (활동내역) ===
create table public.site_posts (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  author_id uuid references public.users(id) on delete set null,
  category text default '활동내역',
  title text not null,
  content jsonb not null default '{"version":1,"blocks":[]}'::jsonb,
  thumbnail_url text,
  view_count integer not null default 0,
  like_count integer not null default 0,
  status post_status not null default 'DRAFT',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- === keep updated_at fresh ===
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated before update on public.users
  for each row execute function public.set_updated_at();
create trigger trg_sites_updated before update on public.sites
  for each row execute function public.set_updated_at();
create trigger trg_site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();
create trigger trg_site_templates_updated before update on public.site_templates
  for each row execute function public.set_updated_at();
create trigger trg_site_pages_updated before update on public.site_pages
  for each row execute function public.set_updated_at();
create trigger trg_site_menus_updated before update on public.site_menus
  for each row execute function public.set_updated_at();
create trigger trg_site_posts_updated before update on public.site_posts
  for each row execute function public.set_updated_at();

-- === auto-create public.users row on auth signup ===
create or replace function public.handle_new_auth_user() returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
