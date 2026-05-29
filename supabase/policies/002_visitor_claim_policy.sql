-- Add policy to allow authenticated users (visitors) to claim open requests
-- Run this in Supabase SQL Editor

-- First, make sure RLS is enabled (safe to run again)
alter table grave_requests enable row level security;

-- Allow any logged-in user to UPDATE an open request to claim it
-- They can only set status to 'claimed' and must set claimed_by to themselves
create policy "Authenticated users can claim open requests"
  on grave_requests
  for update
  to authenticated
  using (
    status = 'open'
  )
  with check (
    status = 'claimed' 
    AND claimed_by = auth.uid()
  );

-- Note: We may want a more restrictive version later that also checks
-- the visitor hasn't claimed too many, or time since last claim, etc.
