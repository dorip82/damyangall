-- 접속통계: 공개 페이지 조회 시마다 한 줄 기록, 관리자(SUPER_ADMIN)만 열람 가능.
-- 개인 식별 정보(IP, User-Agent 등)는 저장하지 않는다 — 경로/시각만 집계 목적으로 남긴다.
create table public.page_views (
  id bigint generated always as identity primary key,
  path text not null,
  created_at timestamptz not null default now(),
  constraint page_views_path_len check (char_length(path) between 1 and 300)
);

create index idx_page_views_created_at on public.page_views (created_at);
create index idx_page_views_path on public.page_views (path);

alter table public.page_views enable row level security;

create policy page_views_insert_anyone on public.page_views
  for insert with check (true);

create policy page_views_select_super_admin on public.page_views
  for select using (public.is_super_admin());
