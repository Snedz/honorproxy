import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Guard: if env vars are not present at runtime (e.g. not set for Production
  // or deployment not yet redeployed after adding them), do not crash the
  // request. Public pages will still load; auth session refresh will be skipped
  // until the variables are available. This matches the defensive pattern used
  // in sitemap.ts and visit/keepsakes pages.
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[middleware] Supabase environment variables missing at runtime. Skipping auth refresh for this request.')
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Admin-only protection for the internal Pilot page (Snowden Zeng only)
    const pathname = request.nextUrl.pathname
    const ADMIN_EMAIL = 'snowdenzeng@gmail.com'
    if (pathname === '/pilot' || pathname.startsWith('/pilot/')) {
      const isAdmin = !!user && user.email?.toLowerCase() === ADMIN_EMAIL
      if (!isAdmin) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }

    // Optional: Protect certain routes later
    // if (!user && request.nextUrl.pathname.startsWith('/account')) {
    //   const url = request.nextUrl.clone()
    //   url.pathname = '/login'
    //   return NextResponse.redirect(url)
    // }
  } catch (err) {
    // Do not let Supabase/auth errors (transient, bad key, edge network, etc.)
    // take down the entire page. Log for debugging; continue serving the response.
    console.warn('[middleware] Supabase auth.getUser() failed for this request (non-fatal):', err)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
