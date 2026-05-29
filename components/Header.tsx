'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Create the Supabase browser client only in the browser, after mount.
    // This prevents crashes during static prerendering (e.g. /_not-found, homepage)
    // when NEXT_PUBLIC_SUPABASE_* env vars are not yet available in the build context.
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    // Create client locally when the action is actually triggered (client-side only)
    const supabase = createClient()
    await supabase.auth.signOut()
    // Refresh to clear any server-side state if needed
    window.location.href = '/'
  }

  return (
    <header className="border-b border-[#d8d2c6] bg-[#f9f7f2]/95 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-[#1c252f]" />
          <div className="font-semibold tracking-[-0.5px] text-lg text-[#1c252f]">HonorProxy</div>
        </a>

        <nav className="flex items-center gap-7 text-sm">
          <a href="#how" className="text-[#5c656f] hover:text-[#1c252f] hidden sm:block transition-colors">How it works</a>
          <a href="/request" className="text-[#5c656f] hover:text-[#1c252f] transition-colors">Make a request</a>
          <a href="/visit" className="text-[#5c656f] hover:text-[#1c252f] transition-colors">I&apos;m visiting</a>
          <a href="/about" className="text-[#5c656f] hover:text-[#1c252f] hidden md:block transition-colors">About</a>
          <a href="/conduct" className="text-[#5c656f] hover:text-[#1c252f] hidden md:block transition-colors">Guidelines</a>

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-5">
                  <a 
                    href="/my-requests" 
                    className="text-[#5c656f] hover:text-[#1c252f] hidden sm:block transition-colors"
                  >
                    My Requests
                  </a>
                  <a 
                    href="/keepsakes" 
                    className="text-[#5c656f] hover:text-[#1c252f] hidden sm:block transition-colors"
                  >
                    My Keepsakes
                  </a>
                  <a 
                    href="/review" 
                    className="text-[#5c656f] hover:text-[#1c252f] hidden sm:block transition-colors"
                  >
                    Review Queue
                  </a>
                  <button 
                    onClick={handleSignOut}
                    className="text-[#5c656f] hover:text-[#1c252f] transition-colors"
                  >
                    Sign out
                  </button>
                  <div className="text-xs px-3 py-1 rounded-full bg-[#f0ede4] text-[#5c656f] border border-[#d8d2c6]">
                    {user.email?.split('@')[0]}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <a 
                    href="/login" 
                    className="text-[#5c656f] hover:text-[#1c252f] px-3 py-1.5 transition-colors"
                  >
                    Sign in
                  </a>
                  <a 
                    href="/signup" 
                    className="rounded-full bg-[#1c252f] px-5 py-1.5 text-white text-xs font-medium hover:bg-black transition-colors"
                  >
                    Create account
                  </a>
                </div>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
