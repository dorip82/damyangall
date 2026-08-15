-- Indexes for the tables in this deliverable (subset of spec §50).

create index if not exists idx_sites_slug on public.sites (slug);
create index if not exists idx_sites_status on public.sites (status);
create index if not exists idx_sites_category on public.sites (category);

create index if not exists idx_site_members_site_id on public.site_members (site_id);
create index if not exists idx_site_members_user_id on public.site_members (user_id);

create index if not exists idx_site_pages_site_id on public.site_pages (site_id);
create index if not exists idx_site_pages_slug on public.site_pages (slug);

create index if not exists idx_site_posts_site_id on public.site_posts (site_id);
create index if not exists idx_site_posts_published_at on public.site_posts (published_at);

create index if not exists idx_site_menus_site_id on public.site_menus (site_id);
