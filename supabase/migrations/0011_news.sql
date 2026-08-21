-- 담양소식: 지역정보/행사와 같은 패턴 — 올담이 직접 관리하는 전체 소식 목록이라
-- site_id에 묶이지 않는다. 쓰기는 SUPER_ADMIN만, 조회는 게시된 항목만 누구나.
-- 스펙(§12) 하위 카테고리 중 "행사"는 이미 별도 행사 기능(events 테이블)이
-- 담당하므로 중복을 피해 제외했다.
create type news_category as enum ('LOCAL','LIFE','REPORT');
create type news_status as enum ('PUBLISHED','HIDDEN');

create table public.news (
  id uuid primary key default gen_random_uuid(),
  category news_category not null default 'LOCAL',
  title text not null,
  summary text,
  content text not null,
  thumbnail_url text,
  status news_status not null default 'PUBLISHED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_title_len check (char_length(title) between 1 and 200),
  constraint news_content_len check (char_length(content) between 1 and 10000)
);

create trigger trg_news_updated before update on public.news
  for each row execute function public.set_updated_at();

create index idx_news_category on public.news (category);
create index idx_news_status on public.news (status);
create index idx_news_created_at on public.news (created_at);

alter table public.news enable row level security;

create policy news_select_public on public.news
  for select using (status = 'PUBLISHED' or public.is_super_admin());

create policy news_write_super_admin on public.news
  for all using (public.is_super_admin())
  with check (public.is_super_admin());

-- 썸네일도 지역정보/행사와 같은 버킷을 재사용한다.
