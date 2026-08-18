-- 행사(이벤트): 지역정보와 같은 패턴 — 올담이 직접 관리하는 전체 행사 목록이라
-- site_id에 묶이지 않는다. 쓰기는 SUPER_ADMIN만, 조회는 게시된 항목만 누구나.
create type event_status as enum ('PUBLISHED','HIDDEN');

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  location text,
  start_at timestamptz not null,
  end_at timestamptz,
  image_url text,
  status event_status not null default 'PUBLISHED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_title_len check (char_length(title) between 1 and 200)
);

create trigger trg_events_updated before update on public.events
  for each row execute function public.set_updated_at();

create index idx_events_status on public.events (status);
create index idx_events_start_at on public.events (start_at);

alter table public.events enable row level security;

create policy events_select_public on public.events
  for select using (status = 'PUBLISHED' or public.is_super_admin());

create policy events_write_super_admin on public.events
  for all using (public.is_super_admin())
  with check (public.is_super_admin());

-- 행사 이미지도 지역정보와 같은 버킷을 재사용한다(같은 업로드 컴포넌트,
-- 같은 SUPER_ADMIN 전용 쓰기 정책을 그대로 쓸 수 있어 버킷을 나눌 이유가 없다).

-- 메인 페이지 관리: 관리자가 Hero 문구와, 아직 실데이터가 없는 담양소식/
-- 오늘의 담양/광고 섹션의 노출 여부·문구를 편집할 수 있는 싱글턴 설정 테이블.
-- 조회는 누구나(메인 페이지 렌더링에 필요), 수정은 SUPER_ADMIN만.
create table public.main_page_settings (
  id smallint primary key default 1,
  hero_title text not null default '담양의 모든 이야기를 담다.',
  hero_subtitle text not null default '담양군민, 동아리·동호회, 기업·소상공인, 기관·단체가 함께 만들어가는 지역 통합 플랫폼입니다.',
  news_banner_visible boolean not null default true,
  news_banner_title text not null default '담양소식',
  news_banner_description text not null default '담양의 최신 소식과 유용한 정보를 확인해보세요.',
  today_banner_visible boolean not null default true,
  today_banner_title text not null default '오늘의 담양',
  today_banner_description text not null default '오늘 담양에서 열리는 행사·모임·새로운 소식을 모아봅니다.',
  ad_banner_visible boolean not null default true,
  ad_banner_title text not null default '광고',
  ad_banner_description text not null default '담양의 기업·소상공인을 위한 광고 공간이 마련됩니다.',
  updated_at timestamptz not null default now(),
  constraint main_page_settings_single_row check (id = 1)
);

insert into public.main_page_settings (id) values (1);

create trigger trg_main_page_settings_updated before update on public.main_page_settings
  for each row execute function public.set_updated_at();

alter table public.main_page_settings enable row level security;

create policy main_page_settings_select_public on public.main_page_settings
  for select using (true);

create policy main_page_settings_update_super_admin on public.main_page_settings
  for update using (public.is_super_admin())
  with check (public.is_super_admin());
