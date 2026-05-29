# Storage Setup for Visit Photos (HonorProxy)

Photos taken during visits are stored in Supabase Storage.

## Step 1: Create the Bucket

1. Go to your Supabase project → **Storage**
2. Click **New Bucket**
3. Name: `visit-photos`
4. **Public** → Turn **ON** (recommended for reliable photo display in emails)
5. Click Create

## Step 2: Apply RLS Policies

Run the SQL file:

`supabase/policies/003_storage_visit_photos.sql`

This allows visitors to upload and read their own photos.

## Step 3: Test

After creating the bucket and running the policy:

- Go to `/visit`
- Claim a request
- Click "Submit Visit Report"
- Upload 1-3 photos + write a reflection
- Submit

The photos will be stored under the path: `your-user-id/visit-id/...`

## Photos in Emails (Recommended Approach)

For photos to reliably display **and** be clickable in emails (Gmail, Apple Mail, Outlook, etc.), the most reliable solution is to make the bucket **Public**.

### Recommended Setup for MVP

1. Go to Supabase Dashboard → **Storage** → `visit-photos`
2. Set the bucket to **Public** (this is the current recommended setting for email delivery).

3. The code in `/api/send-report` now uses simple public URLs via `getPublicUrl()`.

Public URLs are clean, load reliably in email clients, and avoid issues with very long signed URLs being stripped or broken by email providers.

**Note**: Since these are memorial/visit photos being explicitly shared with families, making them public is reasonable for this use case. If you later want private photos, you would need a different architecture (e.g., image proxy or pre-signed short links + attachments).

---

**Note for MVP**: Reports are currently auto-approved (`is_approved: true`). We can add moderation later.
