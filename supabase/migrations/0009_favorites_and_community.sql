-- 즐겨찾기(하트): 로그인한 회원 계정에 저장. site_id/directory_listing_id를
-- 하나의 테이블로 받기 위해 target_type/target_id 패턴을 쓴다(스펙 §16 likes
-- 테이블과 동일한 설계).
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('DIRECTORY_LISTING','SITE')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

alter table public.favorites enable row level security;

create policy favorites_select_own on public.favorites
  for select using (user_id = auth.uid());
create policy favorites_insert_own on public.favorites
  for insert with check (user_id = auth.uid());
create policy favorites_delete_own on public.favorites
  for delete using (user_id = auth.uid());

create index idx_favorites_user_id on public.favorites (user_id);
create index idx_favorites_target on public.favorites (target_type, target_id);

-- 커뮤니티 게시판: 문의게시판과 같은 패턴 — 로그인 없이 이름만 입력하면 누구나
-- 작성 가능. 관리(숨김/삭제)는 올담 슈퍼관리자만.
create type community_category as enum (
  'FREE','LOCAL_INFO','FOOD','TRAVEL','JOBS','MARKET','CLUB_RECRUIT','EVENT_INFO','REPORT'
);
create type community_post_status as enum ('PUBLISHED','HIDDEN');

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  category community_category not null default 'FREE',
  author_name text not null,
  title text not null,
  content text not null,
  status community_post_status not null default 'PUBLISHED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_posts_author_name_len check (char_length(author_name) between 1 and 50),
  constraint community_posts_title_len check (char_length(title) between 1 and 200),
  constraint community_posts_content_len check (char_length(content) between 1 and 5000)
);

create trigger trg_community_posts_updated before update on public.community_posts
  for each row execute function public.set_updated_at();

create index idx_community_posts_category on public.community_posts (category);
create index idx_community_posts_created_at on public.community_posts (created_at);

alter table public.community_posts enable row level security;

create policy community_posts_select on public.community_posts
  for select using (status = 'PUBLISHED' or public.is_super_admin());

create policy community_posts_insert_public on public.community_posts
  for insert with check (status = 'PUBLISHED');

create policy community_posts_update_super_admin on public.community_posts
  for update using (public.is_super_admin())
  with check (public.is_super_admin());

create policy community_posts_delete_super_admin on public.community_posts
  for delete using (public.is_super_admin());
