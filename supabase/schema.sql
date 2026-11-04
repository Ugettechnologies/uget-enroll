-- Uget Academy Scholarship Applications Table
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

create table if not exists public.scholarship_applications (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  track text not null,
  track_reason text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  gender text not null,
  date_of_birth date,
  residential_address text,
  state_region text not null,

  country text not null,
  linkedin_url text,
  highest_qualification text not null,
  institution text,
  course_of_study text,
  current_status text not null,
  studied_before boolean not null default false,
  experience_level text not null,
  why_apply text not null,
  goals text not null,
  two_year_vision text not null,
  has_computer boolean not null default false,
  has_internet boolean not null default false,
  can_commit boolean not null default false,
  portfolio_url text,
  github_url text,
  design_profile_url text,
  other_links text,
  emergency_name text,
  emergency_relationship text,
  emergency_phone text,
  heard_from text not null,
  referral_code text,
  signature text not null,
  agreed_to_terms boolean not null default false,
  
  -- Cohort Field (Cohort 1, Cohort 2, etc.)
  cohort text default 'Cohort 2',

  -- Payment Fields
  payment_status text default 'Unpaid',
  payment_sender text,
  payment_amount numeric,
  payment_date date,
  payment_ref text
);

-- Referral codes table (if not exists)
create table if not exists public.referral_codes (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  referrer_name text not null,
  discount_percentage numeric default 0,
  created_at timestamptz default now() not null
);

-- Enable Row Level Security (RLS) to secure the tables
alter table public.scholarship_applications enable row level security;
alter table public.referral_codes enable row level security;

-- Drop existing policies if they already exist to avoid errors
drop policy if exists "Allow public submissions" on public.scholarship_applications;
drop policy if exists "Allow read for dashboard users" on public.scholarship_applications;
drop policy if exists "Allow public updates for payment" on public.scholarship_applications;
drop policy if exists "Allow public delete for applications" on public.scholarship_applications;
drop policy if exists "Allow public read referrals" on public.referral_codes;
drop policy if exists "Allow full referrals management" on public.referral_codes;

-- Policy: Allow anyone to submit/insert data (essential for the registration form)
create policy "Allow public submissions" 
  on public.scholarship_applications 
  for insert 
  with check (true);

-- Policy: Allow the dashboard and student lookup to read entries
create policy "Allow read for dashboard users"
  on public.scholarship_applications 
  for select 
  using (true);

-- Policy: Allow applicants and payment verification to update application details
create policy "Allow public updates for payment" 
  on public.scholarship_applications 
  for update 
  using (true)
  with check (true);

-- Policy: Allow deletion of records (for admin cleanup of unpaid candidates)
create policy "Allow public delete for applications" 
  on public.scholarship_applications 
  for delete 
  using (true);

-- Referral codes policies
create policy "Allow public read referrals" 
  on public.referral_codes 
  for select 
  using (true);

create policy "Allow full referrals management" 
  on public.referral_codes 
  for all 
  using (true) 
  with check (true);
