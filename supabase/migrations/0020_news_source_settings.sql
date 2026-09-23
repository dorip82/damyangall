-- 담양소식 자동 수집처를 코드(lib/news-scraper/sources.ts)에 박아두지 않고
-- 관리자가 화면에서 추가/수정/끌 수 있게 테이블로 옮긴다. 수집 cron이 매
-- 실행마다 여기서 enabled=true 인 행만 읽어 간다.
--
-- kind:
--   HTML — list_url(보통 언론사 홈) HTML에서 기사 링크를 뽑는다.
--          link_pattern이 비어 있으면 흔한 기사 URL 모양(articleView.html?idxno=,
--          wr_id=, /숫자 등)을 자동 감지한다.
--   RSS  — list_url이 RSS/Atom 피드. 발행시각이 피드에 있어 가장 안정적이다.
-- link_pattern / date_pattern 은 JS 정규식 문자열이며 첫 번째 캡처 그룹을 쓴다.
create type news_source_kind as enum ('HTML','RSS');

create table public.news_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind news_source_kind not null default 'HTML',
  list_url text not null,
  charset text not null default 'utf-8',
  link_pattern text,
  date_pattern text,
  keyword text default '담양',
  enabled boolean not null default true,
  sort_order int not null default 0,
  last_run_at timestamptz,
  last_found int,
  last_inserted int,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_sources_name_len check (char_length(name) between 1 and 50),
  constraint news_sources_charset check (charset in ('utf-8','euc-kr'))
);

create trigger trg_news_sources_updated before update on public.news_sources
  for each row execute function public.set_updated_at();

alter table public.news_sources enable row level security;

create policy news_sources_super_admin on public.news_sources
  for all using (public.is_super_admin())
  with check (public.is_super_admin());

-- 기존에 코드로 관리하던 4곳을 그대로 옮긴다.
insert into public.news_sources (name, kind, list_url, charset, link_pattern, date_pattern, sort_order) values
  ('뉴스디', 'HTML', 'http://www.newsdy.co.kr/', 'utf-8',
    $re$href="(/news/articleView\.html\?idxno=\d+)"$re$, null, 1),
  ('담양신문', 'HTML', 'http://xn--jk1bu0n8rgz0c.kr/', 'euc-kr',
    $re$href=['"](/\d{6,})['"]\s+class=['"]maintitle['"]$re$, null, 2),
  ('담양자치신문', 'HTML', 'http://www.dyjachinews.co.kr/', 'utf-8',
    $re$href="(/news/articleView\.html\?idxno=\d+)"$re$, null, 3),
  ('담양매일', 'HTML', 'http://dymaeil.kr/', 'utf-8',
    $re$href="((?:http://dymaeil\.kr)?/damyang/\d+)$re$,
    $re$bo_v_time"[^>]*>[\s\S]{0,60}?(\d{4}\.\d{2}\.\d{2}\s+\d{2}:\d{2})$re$, 4);
