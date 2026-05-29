# HonorProxy — Supabase Setup Guide (MVP)

This document walks the founding team through creating the Supabase backend for HonorProxy.

## 1. Create Supabase Project

1. Go to https://supabase.com and create an account (or sign in).
2. Click **New Project**.
3. Choose a name: `honorproxy` (or `honorproxy-prod`).
4. Set a strong database password and save it securely.
5. Choose a region close to your primary users (US East or Central recommended for initial cemeteries).
6. Click **Create new project**. Wait ~2 minutes for provisioning.

## 2. Get API Keys

Once the project is ready:
- Go to **Project Settings → API**
- Copy:
  - **Project URL** (e.g. `https://xyzabc.supabase.co`)
  - **anon public** key (starts with `eyJ...`)
  - **service_role** key (keep secret — only for admin scripts later)

Create a `.env.local` file in the root of `honorproxy/` (never commit it):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Optional for server-side admin tasks (later)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 3. Run the Initial Schema

In the Supabase dashboard, go to **SQL Editor → New query**.

Copy and paste the entire contents of `supabase/migrations/001_initial_schema.sql` (create the file first if it doesn't exist, or paste the SQL below directly).

After running successfully you should see tables:
- profiles
- cemeteries
- grave_requests
- visits
- visit_reports
- etc.

## 4. Enable Auth Providers (MVP)

- Go to **Authentication → Providers**
- Enable **Email** (password) — this is sufficient for MVP.
- (Optional later) Add Google or Apple for faster sign-in.

## 5. Row Level Security (RLS)

The migration below includes RLS policies. After running the SQL, verify in **Authentication → Policies** that the tables have the expected policies.

## 6. Storage Buckets

In the dashboard:
- Go to **Storage**
- Create a new bucket called `visit-photos`
- Make it **private** (we will use signed URLs)
- Recommended settings: 10 MB file size limit, allowed MIME types: image/jpeg, image/png, image/webp

## 7. Next Steps After Schema

- Run `npm run dev` and test basic connection (we will add the client in the next coding step).
- Seed the four initial cemeteries (Arlington + the three chosen).
- Begin implementing auth flows and the request form.

---

**Initial Cemeteries for MVP (confirmed):**
1. Arlington National Cemetery (Virginia)
2. Fort Snelling National Cemetery (Minnesota)
3. Golden Gate National Cemetery (California)
4. Quantico National Cemetery (Virginia)

The schema uses a `cemetery_slug` for easy routing and future expansion to any cemetery on Earth or beyond.
