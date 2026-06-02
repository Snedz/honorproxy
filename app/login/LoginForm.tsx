'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Support the callback redirect after email confirmation (from /auth/callback)
    if (searchParams.get('confirmed') === '1') {
      setInfo('Email confirmed. You can now sign in.')
    }
  }, [searchParams])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Create client only when the user actually submits (client-side only)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      let displayError = error.message
      if (displayError.toLowerCase().includes('invalid api key') || displayError.toLowerCase().includes('not configured') || displayError.toLowerCase().includes('invalid')) {
        displayError += ' — Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is the correct "anon" "public" key (not service_role) from your Supabase project\'s API settings, and that it was set for Production in Vercel before the last build. Then redeploy.'
      }
      setError(displayError)
    } else {
      router.push('/')
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-tighter text-[#1c252f]">Sign in</h1>
        <p className="text-[#5c656f] mt-2 text-sm">Welcome back to HonorProxy.</p>
        <p className="text-xs text-[#7a838e] mt-1">Every sign-in is a quiet step toward remembrance.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-xl border border-[#d8d2c6] px-4 py-3.5"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded-xl border border-[#d8d2c6] px-4 py-3.5"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-[#3f4a3f]">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#8c2f2f] py-3.5 text-white font-medium disabled:opacity-60 mt-2 hover:bg-[#6f2323]"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm mt-7 text-[#5c656f]">
        Don’t have an account?{' '}
        <a href="/signup" className="text-[#1c252f] underline">Create one</a>
      </p>
    </div>
  )
}
