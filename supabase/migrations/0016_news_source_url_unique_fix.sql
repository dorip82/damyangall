-- The partial unique index from 0015 (`where source_url is not null`) can't
-- be used as an ON CONFLICT target unless the conflict clause repeats the
-- same predicate — PostgREST's upsert(onConflict:'source_url') doesn't do
-- that, so every scraper insert failed with "no unique or exclusion
-- constraint matching the ON CONFLICT specification". A plain UNIQUE
-- constraint has the same practical effect here anyway: SQL treats NULLs as
-- distinct from each other, so admin-authored rows (source_url null) are
-- still unaffected, and it matches ON CONFLICT (source_url) directly.
drop index if exists idx_news_source_url_unique;
alter table public.news add constraint news_source_url_key unique (source_url);
