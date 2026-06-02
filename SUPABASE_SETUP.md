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

## 8. Recommended: Supabase Vercel + GitHub Integrations (for easy env vars & previews)

Now that your project is on GitHub and deployed to Vercel, connect the official integrations in the Supabase dashboard. This is the easiest and most reliable way to keep Supabase keys in sync with Vercel (especially for Production + Preview deployments) and enables powerful GitHub-based workflows.

1. In Supabase dashboard (your honorproxy project) → **Integrations** (in the left sidebar).
2. **Vercel**:
   - Click "Connect" / Install.
   - Authorize Supabase to access your Vercel account/teams.
   - Select your `honorproxy` Vercel project.
   - Link it. Supabase will automatically inject the correct environment variables into Vercel:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY` (for server-side use)
   - For preview deployments (Vercel previews on PRs), you can enable "Supabase Previews" so each preview gets its own temporary Supabase project (great for testing without affecting prod data).
3. **GitHub**:
   - Connect your `Snedz/honorproxy` repository.
   - This enables Supabase's Git integration (branching, running migrations from your repo, preview databases tied to Git branches, etc.).
   - Useful if you want to manage schema changes via pull requests in the future.

After connecting:
- Go back to your Vercel project → Settings → Environment Variables. You should now see the Supabase vars populated (or updated) for Production (and Previews if enabled).
- **Redeploy** your latest commit in Vercel (or push a small change) so the client bundle picks up the fresh keys.
- Hard-refresh the live site (especially signup / request / login flows).

This integration approach is now the recommended path over manually copying keys (as described earlier in this guide). It reduces "Invalid API key" / missing env var problems dramatically.

If you already had manual keys, the integration will usually overwrite/sync them cleanly.
