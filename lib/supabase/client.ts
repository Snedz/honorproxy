import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

// Temporary stub client used only when the build is missing/invalid the Supabase env vars.
// This prevents hard crashes, unhandled promise rejections, and error boundaries
// while the user sets the variables and redeploys. All data operations return
// empty/safe results. Auth operations surface a clear error if the user tries to
// sign in/up before the redeploy.
function createStubClient(customMessage?: string): any {
  const configError = { message: customMessage || 'Supabase not configured in this build. Set NEXT_PUBLIC_SUPABASE_* in Vercel (Production) and redeploy.' }

  const emptyData = { data: [], error: null, count: 0 }
  const nullData = { data: null, error: null }
  const userData = { data: { user: null }, error: null }

  // A minimal chainable query builder that always "succeeds" with empty data.
  const makeQuery = () => {
    const builder: any = {
      select: () => builder,
      eq: () => builder,
      neq: () => builder,
      in: () => builder,
      order: () => builder,
      limit: () => builder,
      single: () => Promise.resolve(nullData),
      head: () => Promise.resolve({ count: 0, error: null }),
      then: (onF: any, onR?: any) => Promise.resolve(emptyData).then(onF, onR),
      catch: (onR: any) => Promise.resolve(emptyData).catch(onR),
    }
    return builder
  }

  return {
    auth: {
      getUser: () => Promise.resolve(userData),
      getSession: () => Promise.resolve(userData),
      onAuthStateChange: (callback?: any) => {
        // Call once with signed out so UI doesn't hang in loading
        if (typeof callback === 'function') {
          try { callback('SIGNED_OUT', null) } catch {}
        }
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        }
      },
      signInWithPassword: async () => ({ data: null, error: configError }),
      signUp: async () => ({ data: null, error: configError }),
      signOut: async () => ({ error: null }),
    },
    from: (_table: string) => ({
      select: (_cols?: string, _opts?: any) => makeQuery(),
      insert: () => Promise.resolve({ data: null, error: configError }),
      update: () => makeQuery(), // .eq() etc will resolve via the builder
      delete: () => Promise.resolve({ error: configError }),
      eq: () => makeQuery(),
      // Support common patterns used in the app
      order: () => makeQuery(),
      limit: () => makeQuery(),
      single: () => Promise.resolve(nullData),
    }),
    storage: {
      from: (_bucket: string) => ({
        getPublicUrl: (path: string) => ({
          data: { publicUrl: '' }, // Will result in broken images until fixed, but no crash
        }),
        upload: async () => ({ data: null, error: configError }),
        remove: async () => ({ data: null, error: configError }),
      }),
    },
    // Fallback for anything else
  }
}

export function createClient() {
  // Support both common naming conventions:
  // - NEXT_PUBLIC_* (recommended for Next.js client bundles, what our .env.example and most templates use)
  // - Plain SUPABASE_* (what Supabase's official Vercel integration often injects)
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    // Log only once per page load / module to avoid spamming the console on every component
    // that needs Supabase while the user is still fixing the Vercel configuration.
    if (!(globalThis as any).__honorproxy_supabase_config_logged) {
      ;(globalThis as any).__honorproxy_supabase_config_logged = true
      const msg =
        '[Supabase] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL or the anon key is missing in the client bundle. ' +
        'This usually means the Vercel environment variables were not set (or not set for Production) at the time of the last build. ' +
        'Easiest fix: In the Supabase dashboard go to Integrations → Vercel, connect and link your honorproxy Vercel project (and GitHub). Then redeploy.'
      console.error(msg)
    }
    // Return a stub instead of throwing. This eliminates unhandled promise rejections
    // and allows the page to render its static/public content. Dynamic parts (lists,
    // auth state, forms that need DB) will simply show empty or disabled states.
    return createStubClient()
  }

  // Basic runtime sanity check on the inlined values (catches wrong key copied, e.g. service_role instead of anon,
  // or key from wrong Supabase project, or truncated value). This turns "Invalid API key" from Supabase
  // into a clear actionable message and prevents the bad key from being sent.
  const looksLikeValidSupabase =
    supabaseUrl.includes('.supabase.co') &&
    supabaseKey.startsWith('eyJ') &&
    supabaseKey.length > 100 // anon keys are long JWTs

  if (!looksLikeValidSupabase) {
    if (!(globalThis as any).__honorproxy_supabase_config_logged) {
      ;(globalThis as any).__honorproxy_supabase_config_logged = true
      console.error('[Supabase] Invalid config detected in build:', {
        urlSample: supabaseUrl ? supabaseUrl.slice(0, 40) + '...' : 'MISSING',
        keySample: supabaseKey ? supabaseKey.slice(0, 15) + '...' : 'MISSING',
        keyLength: supabaseKey ? supabaseKey.length : 0,
        hasSupabaseCo: supabaseUrl?.includes('.supabase.co'),
        startsWithEyJ: supabaseKey?.startsWith('eyJ'),
      })
      const msg =
        '[Supabase] Supabase URL or ANON_KEY in this build looks invalid. ' +
        'Common causes: wrong key (must use the "anon" "public" key from Supabase dashboard, never service_role), key from different project, or the Vercel integration has not yet synced the vars for this build. ' +
        'If you just installed the Supabase Vercel integration: go to the integration, ensure your Vercel project is linked, then trigger a fresh Redeploy in Vercel for Production.'
      console.error(msg)
    }
    return createStubClient(
      'Supabase configuration in this build is invalid (bad API key or URL). Make sure you are using the "anon public" key (never service_role). If you just installed the Supabase Vercel integration, go back to it, re-link your Vercel project, then redeploy in Vercel.'
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}
