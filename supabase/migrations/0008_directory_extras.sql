-- 지역정보 업체에 인스타그램 링크 필드 추가, 그리고 관리자가 사진을
-- URL 대신 직접 업로드할 수 있도록 Storage 버킷과 정책을 만든다.

alter table public.directory_listings
  add column if not exists instagram_url text;

insert into storage.buckets (id, name, public)
values ('directory-images', 'directory-images', true)
on conflict (id) do nothing;

create policy directory_images_insert_super_admin
  on storage.objects for insert
  with check (bucket_id = 'directory-images' and public.is_super_admin());

create policy directory_images_update_super_admin
  on storage.objects for update
  using (bucket_id = 'directory-images' and public.is_super_admin())
  with check (bucket_id = 'directory-images' and public.is_super_admin());

create policy directory_images_delete_super_admin
  on storage.objects for delete
  using (bucket_id = 'directory-images' and public.is_super_admin());
