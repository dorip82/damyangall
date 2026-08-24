-- 지역정보 업체에 인스타그램과 별도로 홈페이지 링크도 등록할 수 있게 한다.
alter table public.directory_listings
  add column if not exists website_url text;
