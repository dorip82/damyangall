-- 행사 상세 페이지를 관공서/문화재단 게시판 형태(일시·장소·문의처·주최 정보
-- 패널)로 보여주기 위해 문의처/주최 필드를 추가한다.
alter table public.events
  add column if not exists organizer text,
  add column if not exists contact text;
