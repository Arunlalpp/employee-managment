-- ============================================================
-- GENTS COLLECTION — Store Manager Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null unique,
  phone       text,
  role        text not null default 'staff' check (role in ('admin', 'staff')),
  monthly_salary  numeric(10,2) not null default 0,
  daily_allowance numeric(10,2) not null default 30,
  joining_date    date not null default current_date,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

-- RLS
alter table profiles enable row level security;

-- Admin can see all profiles
create policy "Admin full access to profiles" on profiles
  for all using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Staff can see only their own profile
create policy "Staff can view own profile" on profiles
  for select using (auth.uid() = id);

-- ─────────────────────────────────────────
-- ATTENDANCE
-- ─────────────────────────────────────────
create table attendance (
  id               uuid primary key default uuid_generate_v4(),
  staff_id         uuid not null references profiles(id) on delete cascade,
  date             date not null,
  check_in         time,
  check_out        time,
  is_present       boolean not null default false,
  allowance_earned numeric(10,2) not null default 0,
  notes            text,
  created_at       timestamptz not null default now(),
  unique(staff_id, date)
);

-- RLS
alter table attendance enable row level security;

-- Admin full access
create policy "Admin full access to attendance" on attendance
  for all using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Staff can only see their own attendance
create policy "Staff can view own attendance" on attendance
  for select using (auth.uid() = staff_id);

-- ─────────────────────────────────────────
-- ADVANCE PAYMENTS
-- ─────────────────────────────────────────
create table advance_payments (
  id              uuid primary key default uuid_generate_v4(),
  staff_id        uuid not null references profiles(id) on delete cascade,
  amount          numeric(10,2) not null,
  reason          text not null,
  date            date not null default current_date,
  is_deducted     boolean not null default false,
  deducted_month  text, -- YYYY-MM format
  created_at      timestamptz not null default now()
);

-- RLS
alter table advance_payments enable row level security;

-- Admin full access
create policy "Admin full access to advances" on advance_payments
  for all using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Staff can see their own advances
create policy "Staff can view own advances" on advance_payments
  for select using (auth.uid() = staff_id);

-- ─────────────────────────────────────────
-- SEED: Create the admin owner account
-- ─────────────────────────────────────────
-- After creating the owner via Supabase Auth UI (or sign-up),
-- manually insert their profile:
--
-- insert into profiles (id, full_name, email, role, monthly_salary, joining_date)
-- values (
--   '<UUID from auth.users>',
--   'Store Owner Name',
--   'owner@gentscollection.com',
--   'admin',
--   0,
--   '2024-01-01'
-- );

-- ─────────────────────────────────────────
-- HELPFUL VIEWS
-- ─────────────────────────────────────────

-- Monthly salary summary view
create or replace view monthly_salary_summary as
select
  p.id as staff_id,
  p.full_name,
  p.monthly_salary,
  to_char(a.date, 'YYYY-MM') as month,
  count(*) filter (where a.is_present = true) as days_present,
  sum(a.allowance_earned) as total_allowance,
  coalesce(
    (select sum(ap.amount) from advance_payments ap
     where ap.staff_id = p.id
       and ap.deducted_month = to_char(a.date, 'YYYY-MM')), 0
  ) as advance_deductions,
  p.monthly_salary
    + sum(a.allowance_earned)
    - coalesce(
        (select sum(ap.amount) from advance_payments ap
         where ap.staff_id = p.id
           and ap.deducted_month = to_char(a.date, 'YYYY-MM')), 0
      ) as net_salary
from profiles p
join attendance a on a.staff_id = p.id
where p.role = 'staff' and p.is_active = true
group by p.id, p.full_name, p.monthly_salary, to_char(a.date, 'YYYY-MM');
