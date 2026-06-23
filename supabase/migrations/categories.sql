-- ============================================================
-- CATEGORIES TABLE
-- Drives dynamic category management in the admin dashboard.
--
-- Design notes:
--   - slug is auto-generated from label on creation, immutable
--     after that. Stored on photos.category (text column).
--   - 'miscellaneous' is a protected default — cannot be deleted.
--     Photos whose category is deleted fall back to it.
--   - label is what Corey & Ed see/edit in the UI.
-- ============================================================

create table if not exists categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  label       text not null,
  protected   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Seed the three existing categories + the miscellaneous fallback
insert into categories (slug, label, protected) values
  ('miscellaneous', 'Miscellaneous', true),
  ('couples',       'Couples',       false),
  ('engagements',   'Engagements',   false),
  ('portraits',     'Portraits',     false)
on conflict (slug) do nothing;

-- RLS: allow reads for everyone, writes only for authenticated users
alter table categories enable row level security;

create policy "Public read" on categories
  for select using (true);

create policy "Auth write" on categories
  for all using (auth.role() = 'authenticated');
