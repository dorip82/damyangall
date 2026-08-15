-- 오시는길·문의 페이지를 대체하는 "문의" 게시판. 담양소식/site_posts와 달리
-- 관리자가 아닌 누구나(비로그인 포함) 글을 작성할 수 있다. 스팸/오남용 방지를
-- 위해 관리자는 숨김(HIDDEN) 처리 또는 삭제할 수 있고, 답변을 남길 수 있다.

create type inquiry_status as enum ('PUBLISHED', 'HIDDEN');

create table public.site_inquiries (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  author_name text not null,
  author_contact text,
  title text not null,
  content text not null,
  status inquiry_status not null default 'PUBLISHED',
  reply_content text,
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint site_inquiries_author_name_len check (char_length(author_name) between 1 and 50),
  constraint site_inquiries_title_len check (char_length(title) between 1 and 200),
  constraint site_inquiries_content_len check (char_length(content) between 1 and 5000)
);

create trigger trg_site_inquiries_updated before update on public.site_inquiries
  for each row execute function public.set_updated_at();

create index idx_site_inquiries_site_id on public.site_inquiries (site_id);
create index idx_site_inquiries_created_at on public.site_inquiries (created_at);

alter table public.site_inquiries enable row level security;

-- 공개 조회: 게시된(HIDDEN이 아닌) 글은 누구나, 사이트 editor 이상은 전체 조회
create policy site_inquiries_select on public.site_inquiries
  for select using (
    (status = 'PUBLISHED' and exists (select 1 from public.sites s where s.id = site_id and s.status = 'ACTIVE'))
    or public.is_site_editor(site_id)
    or public.is_super_admin()
  );

-- 공개 작성: 활성 사이트에 한해 누구나 작성 가능하지만, status/reply 관련 필드는
-- 항상 기본값으로 고정해 방문자가 숨김 해제나 답변 위조를 할 수 없게 한다.
create policy site_inquiries_insert_public on public.site_inquiries
  for insert with check (
    status = 'PUBLISHED'
    and reply_content is null
    and replied_at is null
    and exists (select 1 from public.sites s where s.id = site_id and s.status = 'ACTIVE')
  );

-- 수정/삭제(숨김 처리, 답변 작성 등)는 사이트 editor 이상만
create policy site_inquiries_update_editors on public.site_inquiries
  for update using (public.is_site_editor(site_id) or public.is_super_admin())
  with check (public.is_site_editor(site_id) or public.is_super_admin());

create policy site_inquiries_delete_editors on public.site_inquiries
  for delete using (public.is_site_editor(site_id) or public.is_super_admin());
