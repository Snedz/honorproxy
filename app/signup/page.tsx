'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    // Create client only when the user actually submits (client-side only)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage("Account created. Please check your email to confirm your account, then sign in.")
    }

    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold tracking-tighter text-[#1c252f]">Create an account</h1>
        <p className="text-[#5c656f] mt-2 text-sm">For families requesting visits and for those offering to visit.</p>
        <p className="text-xs text-[#7a838e] mt-1">Join a community of quiet care.</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <input
          type="text"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full rounded-xl border border-[#d8d2c6] px-4 py-3.5"
        />
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
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-xl border border-[#d8d2c6] px-4 py-3.5"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-[#3f4a3f]">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#1c252f] py-3.5 text-white font-medium disabled:opacity-60 mt-2"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm mt-7 text-[#5c656f]">
        Already have an account?{' '}
        <a href="/login" className="text-[#1c252f] underline">Sign in</a>
      </p>
    </div>
  )
}
