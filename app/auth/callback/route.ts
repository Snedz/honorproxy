import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Supabase Auth callback handler.
 * Used for:
 * - Email confirmation links (signup confirmations)
 * - Password reset, magic links, etc.
 *
 * We exchange the `code` (PKCE flow) for a session server-side,
 * then redirect the user to the app. This makes the "click the link in email"
 * flow land the user already signed in.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successfully confirmed / signed in via the link.
      // Redirect to the intended page (or home). The session cookies are now set.
      // You can also redirect to '/my-requests' or a welcome page.
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }

    // If exchange fails, fall through to a safe redirect with an error hint.
    // The login page can surface a message if desired.
    console.warn('[auth/callback] exchangeCodeForSession failed:', error?.message)
  }

  // Fallback: also support the older token_hash flow for email confirmations
  // (some Supabase email templates still emit token_hash + type).
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (!error) {
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
    console.warn('[auth/callback] verifyOtp failed:', error?.message)
  }

  // Safe landing: go to login (user can sign in if already confirmed, or see message).
  // Append a param so UI can optionally show "Confirmation complete, please sign in."
  const redirectUrl = new URL('/login', requestUrl.origin)
  if (token_hash || code) {
    redirectUrl.searchParams.set('confirmed', '1')
  }
  return NextResponse.redirect(redirectUrl)
}
