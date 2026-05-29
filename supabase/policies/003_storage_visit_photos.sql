-- Supabase Storage setup for visit photos
-- Run these commands in the Supabase SQL Editor or Dashboard

-- 1. Create the bucket (do this in Dashboard > Storage if you prefer)
-- Name: visit-photos
-- Public: false (we'll use signed URLs)

-- 2. RLS Policies for the 'visit-photos' bucket

-- Allow authenticated users to upload photos for their own visits
create policy "Visitors can upload photos for their visits"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'visit-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own uploaded photos
create policy "Visitors can read their own photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'visit-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Note: In the future we may want to allow requesters to read the photos
-- that were taken for their requests, via signed URLs generated server-side.
