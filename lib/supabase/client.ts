import { createBrowserClient } from '@supabase/ssr'
import { Database } from './database.types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    const msg = '[Supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in the client bundle. ' +
      'This usually means the Vercel environment variables were not set (or not set for Production) at the time of the last build. ' +
      'Set them in Project Settings → Environment Variables (Production), then redeploy.'
    console.error(msg)
    throw new Error('Supabase client configuration is missing. Check Vercel env vars and redeploy.')
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseKey)
}
