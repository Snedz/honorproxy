'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Create the Supabase browser client only in the browser, after mount.
    // Guarded so a missing env in the client bundle doesn't break the whole UI.
    let supabase: ReturnType<typeof createClient> | null = null
    try {
      supabase = createClient()
    } catch (err) {
      console.warn('[Header] Supabase client unavailable (likely missing env in this build):', err)
      setLoading(false)
      return
    }

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    try {
      // Create client locally when the action is actually triggered (client-side only)
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('[Header] signOut failed (non-fatal):', err)
    }
    // Refresh to clear any server-side state if needed
    window.location.href = '/'
  }

  // Simple mobile + user dropdown state (no external deps)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Prefer the full_name we collect at signup (user_metadata), fall back to email local-part.
  // This fixes ugly displays like "5n0wd3nz3ng".
  const displayName = (() => {
    const metaName = (user?.user_metadata?.full_name as string | undefined)?.trim()
    if (metaName) return metaName.split(/\s+/)[0]
    const emailLocal = user?.email?.split('@')[0]
    return emailLocal || ''
  })()

  const shortName = displayName.length > 14 ? displayName.slice(0, 11) + '…' : displayName

  // Close menus when navigating (simple)
  function closeMenus() {
    setMobileOpen(false)
    setUserMenuOpen(false)
  }

  return (
    <header className="border-b border-[#d8d2c6] bg-[#f9f7f2]/95 backdrop-blur sticky top-0 z-50">
      {/* Subtle remembrance red accent line at very top for brand presence */}
      <div className="h-[3px] bg-[#8c2f2f]" />
      <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 shrink-0" onClick={closeMenus}>
          <div className="h-6 w-6 rounded-full bg-[#8c2f2f]" /> {/* Remembrance red dot */}
          <div className="font-semibold tracking-[-0.5px] text-lg text-[#1c252f]">HonorProxy</div>
        </a>

        {/* Desktop primary nav (limited items to prevent wrapping) */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="/#how" className="text-[#5c656f] hover:text-[#1c252f] transition-colors">How it works</a>
          <a href="/request" className="text-[#5c656f] hover:text-[#1c252f] transition-colors">Make a request</a>
          <a href="/visit" className="text-[#5c656f] hover:text-[#1c252f] transition-colors">I&apos;m visiting</a>

          {/* My Requests moved into the user menu for signed-in users to keep the top bar uncluttered */}
        </nav>

        {/* Right side: auth / user area (desktop) */}
        <div className="hidden md:flex items-center gap-3 text-sm">
          {!loading && (
            <>
              {user ? (
                /* Signed-in user menu trigger + dropdown */
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-full border border-[#d8d2c6] bg-white/60 pl-3 pr-2.5 py-1 text-[#5c656f] hover:text-[#1c252f] hover:bg-white transition-colors text-xs"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="font-medium tracking-tight">{shortName}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-[#d8d2c6] bg-white shadow-lg py-1.5 text-sm z-50">
                      <a href="/my-requests" onClick={closeMenus} className="block px-4 py-2 text-[#5c656f] hover:text-[#1c252f] hover:bg-[#f9f7f2]">My Requests</a>
                      <a href="/keepsakes" onClick={closeMenus} className="block px-4 py-2 text-[#5c656f] hover:text-[#1c252f] hover:bg-[#f9f7f2]">My Keepsakes</a>
                      <a href="/review" onClick={closeMenus} className="block px-4 py-2 text-[#5c656f] hover:text-[#1c252f] hover:bg-[#f9f7f2]">Review Queue</a>
                      <a href="/conduct" onClick={closeMenus} className="block px-4 py-2 text-[#5c656f] hover:text-[#1c252f] hover:bg-[#f9f7f2]">Guidelines</a>
                      <div className="my-1 h-px bg-[#d8d2c6]" />
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-[#5c656f] hover:text-[#1c252f] hover:bg-[#f9f7f2]"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest actions */
                <>
                  <a href="/login" className="text-[#5c656f] hover:text-[#1c252f] px-3 py-1.5 transition-colors">
                    Sign in
                  </a>
                  <a href="/signup" className="rounded-full bg-[#8c2f2f] px-5 py-1.5 text-white text-xs font-medium hover:bg-[#6f2323] transition-colors">
                    Create account
                  </a>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#d8d2c6] text-[#5c656f] hover:text-[#1c252f] hover:bg-white/70 active:bg-white transition"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6h12v12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile expanded nav (simple, no overlay to keep it lightweight) */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#d8d2c6] bg-[#f9f7f2] px-6 py-4 text-sm">
          <nav className="flex flex-col gap-1">
            <a href="/#how" onClick={closeMenus} className="py-2 text-[#5c656f] hover:text-[#1c252f]">How it works</a>
            <a href="/request" onClick={closeMenus} className="py-2 text-[#5c656f] hover:text-[#1c252f]">Make a request</a>
            <a href="/visit" onClick={closeMenus} className="py-2 text-[#5c656f] hover:text-[#1c252f]">I&apos;m visiting</a>
            <a href="/about" onClick={closeMenus} className="py-2 text-[#5c656f] hover:text-[#1c252f]">About</a>
            <a href="/conduct" onClick={closeMenus} className="py-2 text-[#5c656f] hover:text-[#1c252f]">Guidelines</a>

            <div className="h-px bg-[#d8d2c6] my-2" />

            {!loading && user ? (
              <>
                <a href="/my-requests" onClick={closeMenus} className="py-2 text-[#5c656f] hover:text-[#1c252f] font-medium">My Requests</a>
                <a href="/keepsakes" onClick={closeMenus} className="py-2 text-[#5c656f] hover:text-[#1c252f]">My Keepsakes</a>
                <a href="/review" onClick={closeMenus} className="py-2 text-[#5c656f] hover:text-[#1c252f]">Review Queue</a>
                <button onClick={handleSignOut} className="py-2 text-left text-[#5c656f] hover:text-[#1c252f]">Sign out</button>
                <div className="mt-2 text-xs text-[#7a838e]">Signed in as {displayName}</div>
              </>
            ) : (
              <>
                <a href="/login" onClick={closeMenus} className="py-2 text-[#5c656f] hover:text-[#1c252f]">Sign in</a>
                <a href="/signup" onClick={closeMenus} className="mt-1 inline-block rounded-full bg-[#8c2f2f] px-4 py-2 text-white text-xs font-medium w-fit">Create account</a>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
