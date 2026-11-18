-- 담양군농구협회: 게시판형 공지(상단 고정 · 첨부파일) + 문의자 본인 조회.
-- 1) site_posts: is_pinned(상단 고정), attachments(첨부파일 목록 [{url,name,size}])
-- 2) site_inquiries: 조회 비밀번호(bcrypt 해시)와 실패 잠금.
--    문의 목록은 제목·내용·연락처 없이(번호·유형·가린 이름·날짜·답변 여부만) 공개하고,
--    본문과 답변은 작성자가 정한 비밀번호가 맞을 때만 돌려준다.

create extension if not exists pgcrypto with schema extensions;

-- === 1. 게시글 ===
alter table public.site_posts add column if not exists is_pinned boolean not null default false;
alter table public.site_posts add column if not exists attachments jsonb not null default '[]'::jsonb;
alter table public.site_posts drop constraint if exists site_posts_attachments_array;
alter table public.site_posts add constraint site_posts_attachments_array
  check (jsonb_typeof(attachments) = 'array' and jsonb_array_length(attachments) <= 20);

-- === 2. 문의 조회 비밀번호 ===
alter table public.site_inquiries add column if not exists view_password_hash text;
alter table public.site_inquiries add column if not exists view_failed_count int not null default 0;
alter table public.site_inquiries add column if not exists view_locked_until timestamptz;

-- 문의 접수: 비밀번호를 DB 안에서 해시해 저장한다. 활성 사이트에만, 항상 비공개.
create or replace function public.submit_site_inquiry(
  target_site_id uuid,
  p_inquiry_type text,
  p_author_name text,
  p_author_contact text,
  p_title text,
  p_content text,
  p_password text
) returns uuid as $$
declare
  new_id uuid;
begin
  if not public.is_site_active(target_site_id) then
    raise exception 'site not active';
  end if;
  if p_password is null or char_length(p_password) < 4 or char_length(p_password) > 30 then
    raise exception 'invalid password';
  end if;
  insert into public.site_inquiries (
    site_id, author_name, author_contact, title, content, inquiry_type,
    is_private, privacy_agreed_at, view_password_hash
  ) values (
    target_site_id, p_author_name, p_author_contact, p_title, p_content, p_inquiry_type,
    true, now(), extensions.crypt(p_password, extensions.gen_salt('bf', 8))
  ) returning id into new_id;
  return new_id;
end;
$$ language plpgsql volatile security definer set search_path = public;
grant execute on function public.submit_site_inquiry(uuid, text, text, text, text, text, text) to anon, authenticated;

-- 공개 목록: 개인정보 없이 번호용 정보만. 이름은 첫 글자만 남긴다.
create or replace function public.list_site_inquiries_public(target_site_id uuid)
returns table (
  id uuid,
  inquiry_type text,
  masked_name text,
  created_at timestamptz,
  answered boolean,
  can_view boolean
) as $$
  select
    i.id,
    i.inquiry_type,
    left(i.author_name, 1) || repeat('*', greatest(char_length(i.author_name) - 1, 1)),
    i.created_at,
    i.reply_content is not null,
    i.view_password_hash is not null
  from public.site_inquiries i
  where i.site_id = target_site_id
    and i.status = 'PUBLISHED'
    and public.is_site_active(target_site_id)
  order by i.created_at desc
  limit 500;
$$ language sql stable security definer set search_path = public;
grant execute on function public.list_site_inquiries_public(uuid) to anon, authenticated;

-- 본인 조회: 비밀번호가 맞으면 본문과 답변을 돌려준다.
-- 5번 틀리면 10분 동안 잠근다 (틀린 횟수가 남도록 예외 대신 상태 코드를 돌려준다).
create or replace function public.view_site_inquiry(target_site_id uuid, target_inquiry_id uuid, p_password text)
returns table (
  result text,
  title text,
  content text,
  inquiry_type text,
  author_name text,
  created_at timestamptz,
  reply_content text,
  replied_at timestamptz
) as $$
declare
  r public.site_inquiries%rowtype;
begin
  select * into r from public.site_inquiries
  where id = target_inquiry_id and site_id = target_site_id and status = 'PUBLISHED' and public.is_site_active(site_id);
  if not found or r.view_password_hash is null then
    return query select 'NOT_FOUND'::text, null::text, null::text, null::text, null::text, null::timestamptz, null::text, null::timestamptz;
    return;
  end if;
  if r.view_locked_until is not null and r.view_locked_until > now() then
    return query select 'LOCKED'::text, null::text, null::text, null::text, null::text, null::timestamptz, null::text, null::timestamptz;
    return;
  end if;
  if p_password is null or extensions.crypt(p_password, r.view_password_hash) <> r.view_password_hash then
    update public.site_inquiries
      set view_failed_count = case when r.view_failed_count + 1 >= 5 then 0 else r.view_failed_count + 1 end,
          view_locked_until = case when r.view_failed_count + 1 >= 5 then now() + interval '10 minutes' else null end
      where id = r.id;
    return query select 'WRONG'::text, null::text, null::text, null::text, null::text, null::timestamptz, null::text, null::timestamptz;
    return;
  end if;
  if r.view_failed_count > 0 then
    update public.site_inquiries set view_failed_count = 0, view_locked_until = null where id = r.id;
  end if;
  return query select 'OK'::text, r.title, r.content, r.inquiry_type, r.author_name, r.created_at, r.reply_content, r.replied_at;
end;
$$ language plpgsql volatile security definer set search_path = public;
grant execute on function public.view_site_inquiry(uuid, uuid, text) to anon, authenticated;
