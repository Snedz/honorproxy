-- Fix RLS for visit_reports table
-- The previous policy was too restrictive for INSERT (especially when setting is_approved = true in MVP)

-- Drop the old restrictive policy if it exists
drop policy if exists "Visitor can create and edit their own report before approval" on visit_reports;

-- Allow any authenticated user to INSERT a report if they own the related visit
create policy "Visitors can insert reports for visits they own"
  on visit_reports
  for insert
  to authenticated
  with check (
    exists (
      select 1 from visits 
      where visits.id = visit_reports.visit_id 
        and visits.visitor_id = auth.uid()
    )
  );

-- Allow the visitor who owns the visit to UPDATE their own reports (before moderation if we add it later)
create policy "Visitors can update their own reports"
  on visit_reports
  for update
  to authenticated
  using (
    exists (
      select 1 from visits 
      where visits.id = visit_reports.visit_id 
        and visits.visitor_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from visits 
      where visits.id = visit_reports.visit_id 
        and visits.visitor_id = auth.uid()
    )
  );

-- Keep the existing select policy for requesters viewing approved reports
-- (we already have one from the initial schema)

-- Optional: Allow requesters to view reports on their own requests (even if not yet approved in early testing)
-- You can add this later if needed for the requester dashboard.
