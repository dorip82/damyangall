-- RLS: public reads only published content on ACTIVE sites; writes require
-- site_members membership scoped to the specific site_id (spec §23).
-- SUPER_ADMIN bypass is included even though there's no platform admin UI
-- yet, so these policies don't need to be rewritten when ALLDAM grows.

alter table public.users enable row level security;
alter table public.sites enable row level security;
alter table public.site_members enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_templates enable row level security;
alter table public.site_pages enable row level security;
alter table public.site_menus enable row level security;
alter table public.site_posts enable row level security;

-- === Helpers ===

create or replace function public.is_super_admin() returns boolean as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'SUPER_ADMIN'
  );
$$ language sql stable security definer set search_path = public;

create or replace function public.is_site_editor(target_site_id uuid) returns boolean as $$
  select exists (
    select 1 from public.site_members sm
    where sm.site_id = target_site_id
      and sm.user_id = auth.uid()
      and sm.status = 'ACTIVE'
      and sm.role in ('SITE_ADMIN','EDITOR')
  );
$$ language sql stable security definer set search_path = public;

create or replace function public.is_site_admin(target_site_id uuid) returns boolean as $$
  select exists (
    select 1 from public.site_members sm
    where sm.site_id = target_site_id
      and sm.user_id = auth.uid()
      and sm.status = 'ACTIVE'
      and sm.role = 'SITE_ADMIN'
  );
$$ language sql stable security definer set search_path = public;

-- === users ===
create policy users_select_own on public.users
  for select using (id = auth.uid() or public.is_super_admin());
create policy users_update_own on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());
-- inserts happen via handle_new_auth_user() (security definer trigger only).

-- === sites ===
create policy sites_select_public on public.sites
  for select using (status = 'ACTIVE' or public.is_site_editor(id) or public.is_super_admin());
create policy sites_update_admins on public.sites
  for update using (public.is_site_admin(id) or public.is_super_admin())
  with check (public.is_site_admin(id) or public.is_super_admin());
create policy sites_insert_super_admin on public.sites
  for insert with check (public.is_super_admin());
create policy sites_delete_super_admin on public.sites
  for delete using (public.is_super_admin());

-- === site_members ===
create policy site_members_select on public.site_members
  for select using (
    user_id = auth.uid()
    or public.is_site_admin(site_id)
    or public.is_super_admin()
  );
create policy site_members_write_admins on public.site_members
  for all using (public.is_site_admin(site_id) or public.is_super_admin())
  with check (public.is_site_admin(site_id) or public.is_super_admin());

-- === site_settings ===
create policy site_settings_select on public.site_settings
  for select using (
    exists (select 1 from public.sites s where s.id = site_id and s.status = 'ACTIVE')
    or public.is_site_editor(site_id)
    or public.is_super_admin()
  );
create policy site_settings_write on public.site_settings
  for all using (public.is_site_admin(site_id) or public.is_super_admin())
  with check (public.is_site_admin(site_id) or public.is_super_admin());

-- === site_templates (read-only reference data; writes via service role/seed only) ===
create policy site_templates_select_all on public.site_templates
  for select using (is_active or public.is_super_admin());

-- === site_pages ===
create policy site_pages_select on public.site_pages
  for select using (
    (is_published and exists (select 1 from public.sites s where s.id = site_id and s.status = 'ACTIVE'))
    or public.is_site_editor(site_id)
    or public.is_super_admin()
  );
create policy site_pages_write on public.site_pages
  for all using (public.is_site_editor(site_id) or public.is_super_admin())
  with check (public.is_site_editor(site_id) or public.is_super_admin());

-- === site_menus ===
create policy site_menus_select on public.site_menus
  for select using (
    (is_visible and exists (select 1 from public.sites s where s.id = site_id and s.status = 'ACTIVE'))
    or public.is_site_editor(site_id)
    or public.is_super_admin()
  );
create policy site_menus_write on public.site_menus
  for all using (public.is_site_admin(site_id) or public.is_super_admin())
  with check (public.is_site_admin(site_id) or public.is_super_admin());

-- === site_posts ===
create policy site_posts_select on public.site_posts
  for select using (
    (status = 'PUBLISHED' and exists (select 1 from public.sites s where s.id = site_id and s.status = 'ACTIVE'))
    or public.is_site_editor(site_id)
    or public.is_super_admin()
  );
create policy site_posts_write on public.site_posts
  for all using (public.is_site_editor(site_id) or public.is_super_admin())
  with check (public.is_site_editor(site_id) or public.is_super_admin());
