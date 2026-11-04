-- ============================================================
-- UGET ACADEMY: COHORT 2 TRANSITION & UNPAID APPLICANT CLEANUP
-- ============================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- Step 1: Add 'cohort' column to scholarship_applications if it doesn't exist yet
alter table public.scholarship_applications
  add column if not exists cohort text default 'Cohort 1';

-- Step 2: Tag all existing paid records as 'Cohort 1'
update public.scholarship_applications
set cohort = 'Cohort 1'
where cohort is null or cohort = '';

-- Step 3: Remove all applicants who did NOT pay (leaving only paid Cohort 1 students)
delete from public.scholarship_applications
where payment_status is null
   or payment_status not in ('Paid');

-- Step 4: Ensure delete policy exists for admin actions
drop policy if exists "Allow public delete for applications" on public.scholarship_applications;
create policy "Allow public delete for applications" 
  on public.scholarship_applications 
  for delete 
  using (true);

-- Step 5: Check remaining paid students in database
select 
  id, 
  full_name, 
  email, 
  track, 
  cohort, 
  payment_status, 
  payment_amount, 
  payment_date 
from public.scholarship_applications
order by created_at desc;

