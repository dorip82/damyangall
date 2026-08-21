-- 메인 페이지 좌/우 여백에 노출할 광고 배너. 지역정보/행사/소식과 같은 패턴 —
-- 조회는 게시된 항목만 누구나, 쓰기는 SUPER_ADMIN만.
create type banner_ad_position as enum ('LEFT','RIGHT');
create type banner_ad_status as enum ('PUBLISHED','HIDDEN');

create table public.banner_ads (
  id uuid primary key default gen_random_uuid(),
  position banner_ad_position not null,
  title text not null,
  image_url text not null,
  link_url text,
  sort_order integer not null default 0,
  status banner_ad_status not null default 'PUBLISHED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint banner_ads_title_len check (char_length(title) between 1 and 100)
);

create trigger trg_banner_ads_updated before update on public.banner_ads
  for each row execute function public.set_updated_at();

create index idx_banner_ads_position on public.banner_ads (position);
create index idx_banner_ads_status on public.banner_ads (status);

alter table public.banner_ads enable row level security;

create policy banner_ads_select_public on public.banner_ads
  for select using (status = 'PUBLISHED' or public.is_super_admin());

create policy banner_ads_write_super_admin on public.banner_ads
  for all using (public.is_super_admin())
  with check (public.is_super_admin());

-- 배너 이미지는 지역정보와 같은 버킷을 재사용한다(둘 다 SUPER_ADMIN 전용 쓰기).
