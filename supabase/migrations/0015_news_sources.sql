-- 담양소식 자동 수집: 외부 지역 언론사에서 가져온 기사와 관리자가 직접 쓴
-- 글을 구분하고, 같은 기사를 중복 수집하지 않도록 원문 URL을 유니크로 둔다.
create type news_source_type as enum ('ADMIN','EXTERNAL');

alter table public.news
  add column if not exists source_type news_source_type not null default 'ADMIN',
  add column if not exists source_name text,
  add column if not exists source_url text;

-- source_url이 있는 행(=외부 수집)에 한해 유니크 — 같은 기사를 두 번 못 넣는다.
create unique index if not exists idx_news_source_url_unique
  on public.news (source_url) where source_url is not null;
