-- 활동내역에 유튜브 영상을 연결할 수 있도록 컬럼 추가.
-- 목록/카드에서는 유튜브 썸네일 이미지를 자동으로 보여주고,
-- 상세 페이지에서는 임베드 플레이어로 재생한다 (thumbnail_url이 별도로
-- 있으면 그것을 우선하고, 없으면 video_url에서 썸네일을 유도한다).

alter table public.site_posts
  add column if not exists video_url text;
