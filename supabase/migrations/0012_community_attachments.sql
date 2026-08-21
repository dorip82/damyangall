-- 커뮤니티 글쓰기에 이미지/첨부파일/외부 링크를 붙일 수 있게 컬럼을 추가한다.
-- community_posts는 로그인 없이 누구나 쓸 수 있는 공개 게시판(§문의게시판과
-- 동일 패턴)이라, 업로드용 Storage 버킷도 익명 사용자의 INSERT를 허용해야
-- 한다 — directory-images처럼 SUPER_ADMIN 전용으로 두면 일반 방문자가 글에
-- 사진을 못 붙인다. 대신 UPDATE는 아예 허용하지 않아(매 업로드가 새 랜덤
-- 경로) 남의 파일을 덮어쓸 수 없고, 삭제는 SUPER_ADMIN만 가능하다.

alter table public.community_posts
  add column if not exists image_url text,
  add column if not exists attachment_url text,
  add column if not exists attachment_name text,
  add column if not exists link_url text;

insert into storage.buckets (id, name, public, file_size_limit)
values ('community-uploads', 'community-uploads', true, 10485760) -- 10MB
on conflict (id) do nothing;

create policy community_uploads_insert_public
  on storage.objects for insert
  with check (bucket_id = 'community-uploads');

create policy community_uploads_delete_super_admin
  on storage.objects for delete
  using (bucket_id = 'community-uploads' and public.is_super_admin());
