-- Anonymous visitors need to bump view_count on a published post, but
-- site_posts_write (0002) intentionally restricts all writes to site
-- editors. Rather than loosening that policy, expose one narrow atomic
-- operation via a security-definer function instead.

create or replace function public.increment_site_post_view(target_post_id uuid)
returns void as $$
begin
  update public.site_posts
  set view_count = view_count + 1
  where id = target_post_id
    and status = 'PUBLISHED'
    and exists (
      select 1 from public.sites s
      where s.id = site_posts.site_id and s.status = 'ACTIVE'
    );
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.increment_site_post_view(uuid) to anon, authenticated;
