-- CityTalk Supabase MVP schema
-- PostgreSQL / Supabase migration

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- USERS
-- Mirrors auth.users for public profile data.
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_username_length check (username is null or char_length(username) between 3 and 32)
);

create unique index if not exists users_username_idx
  on public.users (username)
  where username is not null;

-- PLACES
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_review text,
  full_description text,
  address text,
  latitude double precision,
  longitude double precision,
  image_url text,
  city text,
  country text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint places_name_not_blank check (char_length(trim(name)) > 0),
  constraint places_slug_not_blank check (char_length(trim(slug)) > 0)
);

create unique index if not exists places_slug_idx
  on public.places (slug);

create index if not exists places_city_country_idx
  on public.places (city, country);

create index if not exists places_created_by_idx
  on public.places (created_by);

-- REVIEWS
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  rating smallint,
  title text,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_rating_check check (rating is null or rating between 1 and 5),
  constraint reviews_body_not_blank check (char_length(trim(body)) > 0)
);

create index if not exists reviews_user_id_idx
  on public.reviews (user_id);

create index if not exists reviews_place_id_idx
  on public.reviews (place_id);

create index if not exists reviews_place_created_at_idx
  on public.reviews (place_id, created_at desc);

-- Uncomment this if CityTalk should allow only one review per user per place.
-- create unique index if not exists reviews_user_place_unique_idx
--   on public.reviews (user_id, place_id);

-- TAGS
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tags_name_not_blank check (char_length(trim(name)) > 0),
  constraint tags_slug_not_blank check (char_length(trim(slug)) > 0)
);

create unique index if not exists tags_name_idx
  on public.tags (name);

create unique index if not exists tags_slug_idx
  on public.tags (slug);

-- PLACE_TAGS
create table if not exists public.place_tags (
  place_id uuid not null references public.places(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (place_id, tag_id)
);

create index if not exists place_tags_tag_id_idx
  on public.place_tags (tag_id);

-- SAVED_PLACES
create table if not exists public.saved_places (
  user_id uuid not null references public.users(id) on delete cascade,
  place_id uuid not null references public.places(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

create index if not exists saved_places_place_id_idx
  on public.saved_places (place_id);

-- UPDATED_AT TRIGGERS
create trigger set_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

create trigger set_places_updated_at
before update on public.places
for each row
execute function public.set_updated_at();

create trigger set_reviews_updated_at
before update on public.reviews
for each row
execute function public.set_updated_at();

create trigger set_tags_updated_at
before update on public.tags
for each row
execute function public.set_updated_at();

create trigger set_place_tags_updated_at
before update on public.place_tags
for each row
execute function public.set_updated_at();

create trigger set_saved_places_updated_at
before update on public.saved_places
for each row
execute function public.set_updated_at();

-- ROW LEVEL SECURITY
alter table public.users enable row level security;
alter table public.places enable row level security;
alter table public.reviews enable row level security;
alter table public.tags enable row level security;
alter table public.place_tags enable row level security;
alter table public.saved_places enable row level security;

-- USERS
create policy "users_select_authenticated"
on public.users
for select
to authenticated
using (true);

create policy "users_insert_own_profile"
on public.users
for insert
to authenticated
with check (auth.uid() = id);

create policy "users_update_own_profile"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- PLACES
create policy "places_select_public"
on public.places
for select
to anon, authenticated
using (true);

-- TAGS
create policy "tags_select_public"
on public.tags
for select
to anon, authenticated
using (true);

-- PLACE_TAGS
create policy "place_tags_select_public"
on public.place_tags
for select
to anon, authenticated
using (true);

-- REVIEWS
create policy "reviews_select_public"
on public.reviews
for select
to anon, authenticated
using (true);

create policy "reviews_insert_authenticated_owner"
on public.reviews
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "reviews_update_own"
on public.reviews
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "reviews_delete_own"
on public.reviews
for delete
to authenticated
using (auth.uid() = user_id);

-- SAVED_PLACES
create policy "saved_places_select_own"
on public.saved_places
for select
to authenticated
using (auth.uid() = user_id);

create policy "saved_places_insert_own"
on public.saved_places
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "saved_places_delete_own"
on public.saved_places
for delete
to authenticated
using (auth.uid() = user_id);
