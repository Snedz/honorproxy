-- Add requester_email column to grave_requests for reliable email delivery
-- Run this on your Supabase database

ALTER TABLE grave_requests
ADD COLUMN IF NOT EXISTS requester_email text;

-- Optional: Backfill existing rows if you have any test data
-- (This is best-effort and may not work for old rows)
-- UPDATE grave_requests 
-- SET requester_email = profiles.email
-- FROM profiles 
-- WHERE grave_requests.requester_id = profiles.id 
--   AND grave_requests.requester_email IS NULL;
