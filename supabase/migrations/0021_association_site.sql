-- 담양군농구협회 (dba.damyangall.kr) — 협회형 사이트에 필요한 테이블.
-- 동호회 · 대회 · 참가 신청 · 경기(일정/대진/결과) · 자료실 파일, 비공개 문의,
-- 관리자 계정 관리 RPC, 업로드용 Storage 버킷.
-- 모든 테이블은 site_id 중심이라 다른 협회 사이트에도 그대로 쓸 수 있다.
-- 실제 협회 정보(연락처·주소·임원·대회 일정 등)는 넣지 않는다 — 관리자가 입력한다.

-- === 공통 헬퍼: 활성 사이트인가 ===
create or replace function public.is_site_active(target_site_id uuid) returns boolean as $$
  select exists (select 1 from public.sites s where s.id = target_site_id and s.status = 'ACTIVE');
$$ language sql stable security definer set search_path = public;

-- === 문의: 비공개 문의 ===
-- 협회 문의는 연락처가 들어가므로 공개 게시판에 노출하지 않는다.
alter table public.site_inquiries add column if not exists is_private boolean not null default false;
alter table public.site_inquiries add column if not exists inquiry_type text;
alter table public.site_inquiries add column if not exists privacy_agreed_at timestamptz;

drop policy if exists site_inquiries_select on public.site_inquiries;
create policy site_inquiries_select on public.site_inquiries
  for select using (
    (status = 'PUBLISHED' and not is_private and public.is_site_active(site_id))
    or public.is_site_editor(site_id)
    or public.is_super_admin()
  );

-- === 동호회 ===
create table public.site_clubs (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  leader text,
  location text,
  schedule text,
  description text,
  image_url text,
  contact text,
  is_recruiting boolean not null default false,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_site_clubs_updated before update on public.site_clubs
  for each row execute function public.set_updated_at();
create index idx_site_clubs_site on public.site_clubs (site_id, sort_order);
alter table public.site_clubs enable row level security;
create policy site_clubs_select on public.site_clubs
  for select using ((is_published and public.is_site_active(site_id)) or public.is_site_editor(site_id) or public.is_super_admin());
create policy site_clubs_write on public.site_clubs
  for all using (public.is_site_editor(site_id) or public.is_super_admin())
  with check (public.is_site_editor(site_id) or public.is_super_admin());

-- === 대회 ===
-- status: PREPARING(준비중) / OPEN(접수중) / CLOSED(접수마감) / ONGOING(진행중) / FINISHED(종료)
create table public.site_tournaments (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  summary text,
  description text,
  start_date date,
  end_date date,
  venue text,
  apply_start date,
  apply_end date,
  max_teams integer check (max_teams is null or max_teams > 0),
  division text,
  host text,
  fee text,
  contact text,
  poster_url text,
  photo_urls text[] not null default '{}',
  result_summary text,
  status text not null default 'PREPARING'
    check (status in ('PREPARING','OPEN','CLOSED','ONGOING','FINISHED')),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_site_tournaments_updated before update on public.site_tournaments
  for each row execute function public.set_updated_at();
create index idx_site_tournaments_site on public.site_tournaments (site_id, start_date desc);
alter table public.site_tournaments enable row level security;
create policy site_tournaments_select on public.site_tournaments
  for select using ((is_published and public.is_site_active(site_id)) or public.is_site_editor(site_id) or public.is_super_admin());
create policy site_tournaments_write on public.site_tournaments
  for all using (public.is_site_editor(site_id) or public.is_super_admin())
  with check (public.is_site_editor(site_id) or public.is_super_admin());

-- === 대회 참가 신청 ===
-- 개인정보(대표자·연락처·선수 명단)가 들어가므로 공개 조회는 막고,
-- 승인된 팀 이름과 소속만 get_tournament_teams() 로 공개한다.
create table public.site_tournament_applications (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  tournament_id uuid not null references public.site_tournaments(id) on delete cascade,
  team_name text not null check (char_length(team_name) between 1 and 100),
  leader_name text not null check (char_length(leader_name) between 1 and 50),
  phone text not null check (char_length(phone) between 6 and 30),
  affiliation text check (affiliation is null or char_length(affiliation) <= 100),
  players text[] not null default '{}' check (cardinality(players) <= 40),
  notes text check (notes is null or char_length(notes) <= 2000),
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED')),
  admin_memo text,
  privacy_agreed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_site_tournament_applications_updated before update on public.site_tournament_applications
  for each row execute function public.set_updated_at();
create index idx_site_tournament_applications_t on public.site_tournament_applications (tournament_id, created_at);
create index idx_site_tournament_applications_site on public.site_tournament_applications (site_id, created_at desc);
alter table public.site_tournament_applications enable row level security;

create policy site_tournament_applications_select on public.site_tournament_applications
  for select using (public.is_site_editor(site_id) or public.is_super_admin());
-- 공개 접수: 접수중(OPEN)이고 게시된 대회, 접수 기간 안에서만. 상태·메모는 기본값 고정.
create policy site_tournament_applications_insert_public on public.site_tournament_applications
  for insert with check (
    status = 'PENDING'
    and admin_memo is null
    and exists (
      select 1 from public.site_tournaments t
      where t.id = tournament_id
        and t.site_id = site_tournament_applications.site_id
        and t.is_published
        and t.status = 'OPEN'
        and (t.apply_start is null or t.apply_start <= (now() at time zone 'Asia/Seoul')::date)
        and (t.apply_end is null or t.apply_end >= (now() at time zone 'Asia/Seoul')::date)
        and public.is_site_active(t.site_id)
    )
  );
create policy site_tournament_applications_update on public.site_tournament_applications
  for update using (public.is_site_editor(site_id) or public.is_super_admin())
  with check (public.is_site_editor(site_id) or public.is_super_admin());
create policy site_tournament_applications_delete on public.site_tournament_applications
  for delete using (public.is_site_editor(site_id) or public.is_super_admin());

create or replace function public.get_tournament_teams(target_tournament_id uuid)
returns table (team_name text, affiliation text) as $$
  select a.team_name, a.affiliation
  from public.site_tournament_applications a
  join public.site_tournaments t on t.id = a.tournament_id
  where a.tournament_id = target_tournament_id
    and a.status = 'APPROVED'
    and t.is_published
    and public.is_site_active(t.site_id)
  order by a.created_at;
$$ language sql stable security definer set search_path = public;
grant execute on function public.get_tournament_teams(uuid) to anon, authenticated;

-- === 경기 (일정 · 대진표 · 결과) ===
create table public.site_tournament_matches (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  tournament_id uuid not null references public.site_tournaments(id) on delete cascade,
  round text not null default '',
  match_no integer,
  scheduled_at timestamptz,
  court text,
  team_a text not null default '',
  team_b text not null default '',
  score_a integer check (score_a is null or score_a >= 0),
  score_b integer check (score_b is null or score_b >= 0),
  status text not null default 'SCHEDULED' check (status in ('SCHEDULED','LIVE','FINISHED','CANCELLED')),
  note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_site_tournament_matches_updated before update on public.site_tournament_matches
  for each row execute function public.set_updated_at();
create index idx_site_tournament_matches_t on public.site_tournament_matches (tournament_id, sort_order, scheduled_at);
alter table public.site_tournament_matches enable row level security;
create policy site_tournament_matches_select on public.site_tournament_matches
  for select using (
    exists (select 1 from public.site_tournaments t where t.id = tournament_id and t.is_published and public.is_site_active(t.site_id))
    or public.is_site_editor(site_id) or public.is_super_admin()
  );
create policy site_tournament_matches_write on public.site_tournament_matches
  for all using (public.is_site_editor(site_id) or public.is_super_admin())
  with check (public.is_site_editor(site_id) or public.is_super_admin());

-- === 자료실 ===
create table public.site_files (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  category text not null default '기타 자료',
  title text not null check (char_length(title) between 1 and 200),
  description text,
  file_url text not null,
  file_name text not null,
  file_size bigint,
  download_count integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_site_files_updated before update on public.site_files
  for each row execute function public.set_updated_at();
create index idx_site_files_site on public.site_files (site_id, created_at desc);
alter table public.site_files enable row level security;
create policy site_files_select on public.site_files
  for select using ((is_published and public.is_site_active(site_id)) or public.is_site_editor(site_id) or public.is_super_admin());
create policy site_files_write on public.site_files
  for all using (public.is_site_editor(site_id) or public.is_super_admin())
  with check (public.is_site_editor(site_id) or public.is_super_admin());

create or replace function public.increment_site_file_download(target_file_id uuid) returns void as $$
  update public.site_files set download_count = download_count + 1
  where id = target_file_id and is_published and public.is_site_active(site_id);
$$ language sql volatile security definer set search_path = public;
grant execute on function public.increment_site_file_download(uuid) to anon, authenticated;

-- === 관리자 계정 관리 (사이트 관리자 전용) ===
-- users 테이블은 본인만 조회되므로, 이메일을 보여주고 이메일로 추가하는 일은
-- 사이트 관리자 확인을 거치는 security definer 함수로만 한다.
create or replace function public.get_site_members(target_site_id uuid)
returns table (member_id uuid, user_id uuid, email text, name text, role site_member_role, status site_member_status, joined_at timestamptz) as $$
begin
  if not (public.is_site_admin(target_site_id) or public.is_super_admin()) then
    raise exception 'not allowed';
  end if;
  return query
    select sm.id, sm.user_id, u.email, u.name, sm.role, sm.status, sm.joined_at
    from public.site_members sm join public.users u on u.id = sm.user_id
    where sm.site_id = target_site_id
    order by sm.joined_at;
end;
$$ language plpgsql stable security definer set search_path = public;
grant execute on function public.get_site_members(uuid) to authenticated;

create or replace function public.add_site_member_by_email(target_site_id uuid, member_email text, member_role site_member_role)
returns text as $$
declare
  target_user uuid;
begin
  if not (public.is_site_admin(target_site_id) or public.is_super_admin()) then
    raise exception 'not allowed';
  end if;
  select id into target_user from public.users where lower(email) = lower(trim(member_email)) limit 1;
  if target_user is null then
    return 'NOT_FOUND';
  end if;
  insert into public.site_members (site_id, user_id, role, status)
  values (target_site_id, target_user, member_role, 'ACTIVE')
  on conflict (site_id, user_id) do update set role = excluded.role, status = 'ACTIVE';
  return 'OK';
end;
$$ language plpgsql volatile security definer set search_path = public;
grant execute on function public.add_site_member_by_email(uuid, text, site_member_role) to authenticated;

-- === 업로드 버킷 (사진 · 자료실 파일) ===
-- 경로 첫 폴더가 site_id 이고, 그 사이트의 편집자만 올리고 지울 수 있다.
insert into storage.buckets (id, name, public, file_size_limit)
values ('site-assets', 'site-assets', true, 31457280)
on conflict (id) do nothing;

create or replace function public.is_site_editor_path(object_name text) returns boolean as $$
  select exists (
    select 1 from public.site_members sm
    where sm.site_id::text = (storage.foldername(object_name))[1]
      and sm.user_id = auth.uid()
      and sm.status = 'ACTIVE'
      and sm.role in ('SITE_ADMIN','EDITOR')
  );
$$ language sql stable security definer set search_path = public, storage;

create policy site_assets_insert on storage.objects
  for insert with check (bucket_id = 'site-assets' and (public.is_site_editor_path(name) or public.is_super_admin()));
create policy site_assets_update on storage.objects
  for update using (bucket_id = 'site-assets' and (public.is_site_editor_path(name) or public.is_super_admin()))
  with check (bucket_id = 'site-assets' and (public.is_site_editor_path(name) or public.is_super_admin()));
create policy site_assets_delete on storage.objects
  for delete using (bucket_id = 'site-assets' and (public.is_site_editor_path(name) or public.is_super_admin()));

-- === 담양군농구협회 사이트 생성 ===
-- 이름 외의 정보(연락처·주소·이메일 등)는 비워 두고 관리자가 입력한다.
insert into public.sites (name, slug, category, description, status, published_at)
values ('담양군농구협회', 'dba', '협회', '농구로 하나 되는 담양! 담양군농구협회 공식 홈페이지', 'ACTIVE', now())
on conflict (slug) do nothing;

insert into public.site_settings (site_id, primary_color, secondary_color, accent_color, font_family, seo_title, seo_description)
select id, '#10264F', '#174F91', '#F28C28', 'Pretendard',
  '담양군농구협회 | DAMYANG BASKETBALL ASSOCIATION',
  '담양군농구협회 공식 홈페이지 — 협회 소개, 생활농구 동호회, 농구대회 일정과 참가 신청, 활동소식, 자료실.'
from public.sites where slug = 'dba'
on conflict (site_id) do nothing;

-- 관리자가 내용을 채울 페이지 (블록은 비워 둔다 → 홈페이지에는 "준비 중"으로 표시)
insert into public.site_pages (site_id, title, slug, sort_order, is_home, is_published, content)
select s.id, p.title, p.slug, p.sort_order, p.is_home, true, '{"version":1,"blocks":[]}'::jsonb
from public.sites s
cross join (values
  ('메인 (슬라이드 배너)', 'home', 0, true),
  ('협회장 인사말', 'greeting', 10, false),
  ('협회 소개', 'about', 20, false),
  ('조직도', 'organization', 30, false),
  ('임원진 · 역대 임원', 'executives', 40, false),
  ('협회 연혁', 'history', 50, false),
  ('생활농구 소개', 'life', 60, false),
  ('회원 모집 안내', 'recruit', 70, false),
  ('생활체육 프로그램', 'programs', 80, false),
  ('대회 안내', 'tournament-guide', 90, false),
  ('개인정보처리방침', 'privacy', 100, false),
  ('이용약관', 'terms', 110, false)
) as p(title, slug, sort_order, is_home)
where s.slug = 'dba'
on conflict (site_id, slug) do nothing;

-- 플랫폼 최고 관리자를 이 사이트의 관리자로 등록 (이후 관리자 화면에서 계정 추가)
insert into public.site_members (site_id, user_id, role, status)
select s.id, u.id, 'SITE_ADMIN', 'ACTIVE'
from public.sites s cross join public.users u
where s.slug = 'dba' and u.role = 'SUPER_ADMIN'
on conflict (site_id, user_id) do nothing;
