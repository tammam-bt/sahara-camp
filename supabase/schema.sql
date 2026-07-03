-- =============================================================================
-- Sahara Camp — Supabase Database Schema
-- =============================================================================
-- Run this entire script once in the Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run).
--
-- What this script does:
--   1. Enables the pgcrypto extension for gen_random_uuid()
--   2. Creates the `bookings` table with full constraints
--   3. Enables Row Level Security (RLS)
--   4. Adds RLS policies: anon INSERT + anon SELECT (confirmed rows only)
--   5. Creates the `available_bookings` view (public-safe, SECURITY DEFINER)
--   6. Adds a composite index for calendar/availability queries
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Extensions
-- -----------------------------------------------------------------------------

-- pgcrypto provides gen_random_uuid(), used as the default for UUID columns.
create extension if not exists "pgcrypto";


-- -----------------------------------------------------------------------------
-- 2. Bookings table
-- -----------------------------------------------------------------------------

create table public.bookings (
  -- Primary key — auto-generated UUID
  id             uuid        primary key default gen_random_uuid(),

  -- Audit timestamp — set automatically on INSERT
  created_at     timestamptz not null default now(),

  -- Tent category; must be one of the two supported types
  tent_type      text        not null
                   check (tent_type in ('traditional', 'glamping')),

  -- Stay dates (date only, no time component)
  check_in       date        not null,
  check_out      date        not null,

  -- Guest counts
  adults         integer     not null check (adults >= 1),
  children       integer     not null default 0 check (children >= 0),

  -- Guest contact details
  guest_name     text        not null,
  email          text        not null,
  phone          text        not null,

  -- Optional free-text field for dietary needs, accessibility, etc.
  special_req    text,

  -- Booking lifecycle:
  --   pending   → newly submitted, awaiting camp-owner action
  --   confirmed → owner clicked "confirm" in the magic-link email
  --   denied    → owner clicked "deny"
  status         text        not null default 'pending'
                   check (status in ('pending', 'confirmed', 'denied')),

  -- One-time token embedded in the magic link sent to the camp owner.
  -- The confirm-booking Edge Function looks up rows by this column.
  confirm_token  uuid        not null default gen_random_uuid(),

  -- Logical integrity: checkout must be strictly after check-in
  constraint check_out_after_check_in check (check_out > check_in)
);

comment on table  public.bookings                is 'Guest booking requests for Sahara Camp.';
comment on column public.bookings.id             is 'Auto-generated primary key.';
comment on column public.bookings.tent_type      is '"traditional" or "glamping".';
comment on column public.bookings.check_in       is 'Arrival date (inclusive).';
comment on column public.bookings.check_out      is 'Departure date (exclusive).';
comment on column public.bookings.status         is 'Booking lifecycle state: pending | confirmed | denied.';
comment on column public.bookings.confirm_token  is 'UUID embedded in the owner magic-link; single-use.';


-- -----------------------------------------------------------------------------
-- 3. Row Level Security
-- -----------------------------------------------------------------------------

-- RLS must be enabled before policies take effect.
alter table public.bookings enable row level security;


-- -----------------------------------------------------------------------------
-- 4. RLS Policies
-- -----------------------------------------------------------------------------

-- ── Policy: anon INSERT ──────────────────────────────────────────────────────
-- Guests submit booking requests from the public website.
-- No authentication is required.
create policy "anon_can_insert_bookings"
  on public.bookings
  for insert
  to anon
  with check (true);

-- ── Policy: anon SELECT (confirmed rows only) ────────────────────────────────
-- The website may need to check whether dates are already taken.
-- Visitors can only see rows whose status is 'confirmed' — they must NEVER
-- see 'pending' or 'denied' rows, nor sensitive columns like email/phone.
-- Column restriction is enforced at the VIEW layer (see section 5).
create policy "anon_can_select_confirmed_bookings"
  on public.bookings
  for select
  to anon
  using (status = 'confirmed');

-- Note: no UPDATE or DELETE policies are created for anon.
--       All updates are performed by the Edge Function using the
--       service-role key, which bypasses RLS entirely.


-- -----------------------------------------------------------------------------
-- 5. Public availability view
-- -----------------------------------------------------------------------------
-- This SECURITY DEFINER view runs with the privileges of its owner (postgres),
-- but only projects the three columns that are safe for public consumption.
-- Even though the RLS policy above limits anon SELECT to confirmed rows, the
-- view adds a second, defence-in-depth layer that hard-codes the column list
-- and the status filter.
--
-- Usage from the JS client:
--   const { data } = await supabase.from('available_bookings').select('*');

create or replace view public.available_bookings
  with (security_invoker = false)  -- SECURITY DEFINER semantics
  as
  select
    id,
    check_in,
    check_out,
    tent_type
  from public.bookings
  where status = 'confirmed';

comment on view public.available_bookings is
  'Public-safe view exposing only (id, check_in, check_out, tent_type) '
  'for confirmed bookings. Use this from the frontend instead of querying '
  'the bookings table directly.';


-- -----------------------------------------------------------------------------
-- 6. Performance index
-- -----------------------------------------------------------------------------
-- Most availability queries filter by tent_type and status, then sort or
-- range-scan by date. This composite index serves those patterns efficiently.
create index if not exists idx_bookings_availability
  on public.bookings (tent_type, status, check_in, check_out);

comment on index public.idx_bookings_availability is
  'Supports tent-availability queries filtering by type + status + date range.';


-- =============================================================================
-- End of schema setup
-- =============================================================================
