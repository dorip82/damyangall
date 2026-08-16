-- 지역정보(업체 디렉터리). 소리향기 같은 개별 사이트와 달리 소유자 로그인이
-- 없는, 올담이 직접 관리하는 목록이라 site_id에 묶이지 않는다. 쓰기는
-- SUPER_ADMIN만 가능하고(공개 제출 아님), 조회는 게시된 항목만 누구나 가능.

create type directory_category as enum (
  'CAFE','RESTAURANT','GAS_STATION','PHARMACY','PARKING','PENSION','MART','BANK'
);
create type directory_listing_status as enum ('PUBLISHED','HIDDEN');

create table public.directory_listings (
  id uuid primary key default gen_random_uuid(),
  category directory_category not null,
  name text not null,
  description text,
  phone text,
  address text,
  image_url text,
  status directory_listing_status not null default 'PUBLISHED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_directory_listings_updated before update on public.directory_listings
  for each row execute function public.set_updated_at();

create index idx_directory_listings_category on public.directory_listings (category);
create index idx_directory_listings_status on public.directory_listings (status);

alter table public.directory_listings enable row level security;

create policy directory_listings_select_public on public.directory_listings
  for select using (status = 'PUBLISHED' or public.is_super_admin());

create policy directory_listings_write_super_admin on public.directory_listings
  for all using (public.is_super_admin())
  with check (public.is_super_admin());
