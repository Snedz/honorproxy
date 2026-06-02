import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'

// Temporary stub for server when env vars are missing at runtime for this deployment.
// Prevents 500s on server components / generateMetadata / route handlers while the
// user configures the vars in Vercel and redeploys. Operations return empty results.
function createServerStub(customMessage?: string): any {
  const configError = { message: customMessage || 'Supabase not configured at server runtime for this deployment. Set env vars in Vercel (Production) and redeploy.' }

  const empty = { data: [], error: null }
  const nullish = { data: null, error: null }

  const makeBuilder = () => {
    const b: any = {
      select: () => b,
      eq: () => b,
      order: () => b,
      limit: () => b,
      single: () => Promise.resolve(nullish),
      then: (r: any) => Promise.resolve(empty).then(r),
    }
    return b
  }

  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
    from: () => ({
      select: () => makeBuilder(),
      update: () => ({ eq: () => Promise.resolve({ error: configError }) }),
      insert: () => Promise.resolve({ error: configError }),
    }),
    storage: {
      from: () => ({
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  }
}

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    if (!(globalThis as any).__honorproxy_supabase_server_config_logged) {
      ;(globalThis as any).__honorproxy_supabase_server_config_logged = true
      const msg = '[Supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing at server runtime. ' +
        'Set the environment variables in Vercel (Production + Preview) and redeploy.'
      console.error(msg)
    }
    return createServerStub()
  }

  // Basic sanity check (same as client)
  const looksLikeValidSupabase = supabaseUrl.includes('.supabase.co') &&
    supabaseKey.startsWith('eyJ') &&
    supabaseKey.length > 100;

  if (!looksLikeValidSupabase) {
    if (!(globalThis as any).__honorproxy_supabase_server_config_logged) {
      ;(globalThis as any).__honorproxy_supabase_server_config_logged = true
      const msg = '[Supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY at server runtime looks invalid. ' +
        'Check that the values set in Vercel (Production) are correct (anon key, matching project). Redeploy after fixing.'
      console.error(msg)
    }
    return createServerStub('Supabase configuration at server runtime is invalid (bad API key or URL). Verify env vars in Vercel and redeploy.')
  }

  return createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
