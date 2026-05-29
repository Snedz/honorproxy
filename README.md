# HonorProxy

**Someone will stand at their grave for you.**

A mission-driven platform that connects families and friends of those interred at major U.S. military cemeteries with respectful visitors who are already going there. Visitors deliver fresh photos + a short, personal, dignified reflection — directly and privately.

## Current MVP Scope (Confirmed)

Four major American military cemeteries:

- Arlington National Cemetery (Virginia)
- Fort Snelling National Cemetery (Minnesota)
- Golden Gate National Cemetery (California)
- Quantico National Cemetery (Virginia)

## Long-Term Vision

HonorProxy is built from day one to eventually serve **every cemetery on Earth** and, one day, memorials on the Moon, Mars, and beyond. The same simple, respectful emotional channel — "a real person was there for you today" — should work anywhere a grave or memorial exists.

## Tech Stack (MVP)

- **Next.js 16** (App Router, TypeScript, Tailwind)
- **Supabase** (Postgres + Auth + Storage + RLS)
- **Resend** (beautiful transactional email for visit reports)
- Vercel deployment

## Getting Started (Local Development)

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.local.example` → `.env.local` and fill in your Supabase keys.

3. Run the development server:
   ```bash
   npm run dev
   ```

4. See `SUPABASE_SETUP.md` for the full backend setup instructions (create project, run the initial schema migration).

## Email Setup (Resend)

HonorProxy uses Resend to deliver the visit reports and thank-you messages that carry the emotional weight of this work.

### Local Development & Testing
- Without any configuration, emails are sent from `onboarding@resend.dev`.
- In Resend’s testing mode, emails are **only delivered** to the address associated with your Resend account.
- This is sufficient while building and testing flows locally.

### Production Email (Strongly Recommended)

For families to receive these messages with the dignity they deserve, use a verified domain.

1. **Add and verify your domain in Resend**
   - In the Resend dashboard, go to **Domains** → **Add Domain**.
   - Follow the DNS instructions (usually a TXT record, sometimes additional records depending on your DNS provider).
   - Verification can take a few minutes to a few hours.

2. **Create a dedicated sending address**
   Recommended addresses that feel appropriate for this mission:
   - `visits@yourdomain.com`
   - `remembrance@yourdomain.com`
   - `honor@yourdomain.com`

3. **Set the production from address**
   Add this to your environment variables (both locally for testing the real flow and in production):

   ```env
   RESEND_FROM_EMAIL="HonorProxy <visits@yourdomain.com>"
   ```

   The code will fall back gracefully to the testing address if this variable is not set.

4. **Deploy the variable**
   - On Vercel: Project Settings → Environment Variables → Add `RESEND_FROM_EMAIL` for Production.
   - Redeploy after adding.

This small detail makes a real difference in how seriously families receive the report.

**Important**: Do not use the testing address (`onboarding@resend.dev`) for real family deliveries once you are live.

## Deployment

HonorProxy is designed to deploy easily on Vercel.

1. Push the repository to GitHub.
2. Import the project in Vercel.
3. Add the required environment variables (see `.env.local.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (strongly recommended once you have a verified domain)
4. Run any pending Supabase migrations in your production Supabase project.
5. Deploy.

The application already uses strict Row Level Security policies. There is no separate “admin” surface — the review queue is simply a protected page available to anyone with a verified account who has been granted access.

For production email, verify a custom domain in Resend and use a respectful sending address such as `visits@yourdomain.com`. See the Email Setup section above for details.

## Project Structure

```
honorproxy/
├── app/                  # Next.js routes (pages, layouts, flows)
├── components/           # Reusable UI (will grow with shadcn/ui)
├── lib/supabase/         # Client & server Supabase helpers
├── supabase/migrations/  # SQL schema history (001_initial_schema.sql is the foundation)
├── SUPABASE_SETUP.md     # Step-by-step backend instructions
└── README.md
```

## Guiding Principles

- **Respect and solemnity above all else.**
- Complement existing tools (ANC Explorer, Find a Grave, Travis Manion Foundation Honor Project, etc.) rather than replace them.
- No commercialization of remembrance.
- Designed for 501(c)(3) nonprofit path from the beginning.
- Architecture must support global scale and eventual off-world use.

## Current Status & Next Steps

The core emotional experience is complete and has received significant polish:

- Full request → claim → visit → beautiful private delivery loop
- Human review queue with moderator notes, soft rejection, audit view, and restore
- Public Remembrances archive with cemetery filtering, progressive loading, and published counts
- Visitor experience refinements (claim success states, first-time guidance, empty states)
- Request form guidance for families

The project is in a mature, usable state for small-scale pilots or further development.

Next natural areas of focus (if desired):
- Further visitor or request form refinements
- Production/deployment hardening (custom domain, monitoring, etc.)
- Mobile/PWA experience improvements for visitors in the field
- Expansion of the public archive (more cemeteries, additional filtering)

---

*HonorProxy exists because of a simple, powerful truth expressed in a public thread: people want to honor the fallen, and families desperately want to know someone was there.*

Built with care. Not for profit.
