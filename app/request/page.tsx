'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function RequestPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Supabase client created only after mount (safe for static prerender of this page)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    setError(null)

    const form = e.currentTarget
    const formData = new FormData(form)

    const cemeterySlug = formData.get('cemetery') as string
    const client = createClient()

    const { data: cemeteries, error: cemError } = await client
      .from('cemeteries')
      .select('id, slug, name')
      .in('slug', ['arlington', 'fort-snelling', 'golden-gate', 'quantico'])

    console.log('[Request] Cemeteries query result:', { cemeteries, cemError })

    if (cemError) {
      setError("Error loading cemeteries: " + cemError.message)
      setSubmitting(false)
      return
    }

    if (!cemeteries || cemeteries.length === 0) {
      setError("No cemeteries found in the database. The table may be empty or permissions are missing.")
      setSubmitting(false)
      return
    }

    type CemeteryRow = { id: string; slug: string; name: string }
    const selectedCemetery = (cemeteries as CemeteryRow[]).find((c) => c.slug === cemeterySlug)
    if (!selectedCemetery) {
      setError(`Cemetery with slug "${cemeterySlug}" not found in results. Found: ${(cemeteries as CemeteryRow[]).map((c) => c.slug).join(', ')}`)
      setSubmitting(false)
      return
    }

    // Reuse the client created above for the cemeteries query
    // Get the current user's email so we can store it directly on the request
    const { data: { user: authUser } } = await client.auth.getUser()

    const { error: insertError } = await (client.from('grave_requests') as any)
      .insert({
        requester_id: user.id,
        requester_email: authUser?.email || null,
        cemetery_id: selectedCemetery.id,
        deceased_full_name: formData.get('deceased_full_name') as string,
        section: (formData.get('section') as string) || null,
        grave_number: (formData.get('grave_number') as string) || null,
        plot_info: (formData.get('plot_info') as string) || null,
        personal_message: (formData.get('personal_message') as string) || null,
        relationship_to_deceased: (formData.get('relationship') as string) || null,
        status: 'open',
      })

    if (insertError) {
      console.error(insertError)
      setError("Something went wrong. Please try again.")
    } else {
      setSuccess(true)
      form.reset()
    }

    setSubmitting(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center text-[#5c656f]">
        Loading...
      </div>
    )
  }

  // Not signed in — nice gate
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-[#e9e4d9] mb-6" />
        <h1 className="text-3xl font-semibold tracking-tighter text-[#1c252f]">Sign in to make a request</h1>
        <p className="mt-4 text-[#4a5563] leading-relaxed">
          All requests are private. An account lets us deliver the visit report, photos, and reflection securely back to you.
        </p>

        <div className="mt-9 flex flex-col gap-3">
          <a 
            href="/signup" 
            className="rounded-full bg-[#1c252f] py-3.5 text-white font-medium tracking-tight"
          >
            Create an account
          </a>
          <a 
            href="/login" 
            className="rounded-full border border-[#d8d2c6] py-3.5 font-medium hover:bg-white"
          >
            I already have an account
          </a>
        </div>

        <p className="mt-8 text-xs tracking-widest text-[#7a838e]">
          YOUR INFORMATION IS SHARED ONLY WITH THE VISITOR WHO FULFILLS YOUR REQUEST.
        </p>
      </div>
    )
  }

  // Success state — calm and reverent
  if (success) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-[#e9e4d9] flex items-center justify-center mb-7">
          <span className="text-[#4a5c4f] text-2xl">✓</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tighter text-[#1c252f]">Request received</h1>
        <p className="mt-5 text-[17px] leading-relaxed text-[#4a5563] max-w-prose mx-auto">
          Thank you. When a visitor claims your request and stands at the grave, we will send you a private email with their photos and personal reflection.
        </p>
        <p className="mt-3 text-xs text-[#7a838e]">
          The visit report will be reviewed by a human before it reaches you, to ensure it carries the quiet respect this work deserves.
        </p>
        <div className="mt-9 flex gap-4 justify-center">
          <a href="/my-requests" className="rounded-full border border-[#d8d2c6] px-7 py-2.5 text-sm font-medium hover:bg-white">
            View my requests
          </a>
          <a href="/" className="rounded-full bg-[#1c252f] px-7 py-2.5 text-sm font-medium text-white">
            Return home
          </a>
        </div>
      </div>
    )
  }

  // Main form (authenticated)
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tighter text-[#1c252f]">Request a proxy visit</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#4a5563] max-w-prose">
          A real person visiting the cemetery will go to the grave on your behalf, take respectful photos, and send you a personal reflection.
        </p>
      </div>

      {/* Calm expectations and tips */}
      <div className="mb-8 rounded-2xl border border-[#d8d2c6] bg-[#f9f7f2] p-6 text-sm text-[#3f4a3f]">
        <div className="font-medium tracking-tight mb-2">A few things that help</div>
        <ul className="space-y-1.5 text-[#4a5563]">
          <li>• The more precise the grave location, the more meaningful the visit can be.</li>
          <li>• Your personal message travels with the visitor — it is read at the grave.</li>
          <li>• Reports are reviewed by a human before being sent, for quiet dignity.</li>
        </ul>
        <p className="mt-3 text-xs text-[#7a838e]">You will receive the visit report by email once it has been approved.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-9">
        <div>
          <label className="block honor-label mb-2">Cemetery</label>
          <select name="cemetery" required className="w-full rounded-xl border px-4 py-3.5 text-base">
            <option value="arlington">Arlington National Cemetery — Virginia</option>
            <option value="fort-snelling">Fort Snelling National Cemetery — Minnesota</option>
            <option value="golden-gate">Golden Gate National Cemetery — California</option>
            <option value="quantico">Quantico National Cemetery — Virginia</option>
          </select>
        </div>

        {/* Grave location guidance — practical help so visitors can find the exact grave */}
        <div className="rounded-2xl border border-[#e2d9c9] bg-[#f9f7f2] p-5 text-sm">
          <div className="font-medium text-[#1c252f] mb-2 tracking-tight">Finding the exact grave (important for your visitor)</div>
          <p className="text-[#4a5563] mb-3 leading-relaxed">
            The Section and Grave number are the most helpful details. Use these official locators:
          </p>
          <ul className="space-y-2.5 text-[#3a434d]">
            <li>
              <span className="font-medium">Arlington:</span> <a href="https://ancexplorer.army.mil/publicwmv/index.html#/arlington-national/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#1c252f]">ANC Explorer</a> (search name → note exact Section + Grave number).
            </li>
            <li>
              <span className="font-medium">Fort Snelling, Golden Gate, Quantico:</span> <a href="https://gravelocator.cem.va.gov/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#1c252f]">Nationwide Gravesite Locator</a> (VA).
            </li>
            <li>
              <span className="font-medium">Helpful supplement:</span> <a href="https://www.findagrave.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#1c252f]">Find A Grave</a> (user photos + maps for most sites).
            </li>
          </ul>
          <p className="mt-3 text-xs text-[#7a838e]">Write down the precise numbers. Your visitor will use them to locate the grave respectfully.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block honor-label mb-2">Full name of the deceased <span className="text-red-600">*</span></label>
            <input 
              name="deceased_full_name" 
              type="text" 
              required 
              className="w-full rounded-xl border px-4 py-3.5" 
              placeholder="John Michael Smith" 
            />
          </div>
          <div>
            <label className="block honor-label mb-2">Your relationship to them</label>
            <input 
              name="relationship" 
              type="text" 
              className="w-full rounded-xl border px-4 py-3.5" 
              placeholder="My father, sister, Gold Star widow..." 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block honor-label mb-2">Section (if known)</label>
            <input name="section" type="text" className="w-full rounded-xl border px-4 py-3.5" placeholder="60" />
          </div>
          <div>
            <label className="block honor-label mb-2">Grave number</label>
            <input name="grave_number" type="text" className="w-full rounded-xl border px-4 py-3.5" placeholder="12345" />
          </div>
          <div>
            <label className="block honor-label mb-2">Other location details</label>
            <input name="plot_info" type="text" className="w-full rounded-xl border px-4 py-3.5" placeholder="Near the wall, etc." />
          </div>
        </div>

        <div>
          <label className="block honor-label mb-2">Message for the visitor (recommended)</label>
          <textarea 
            name="personal_message" 
            rows={5} 
            className="w-full rounded-xl border px-4 py-3.5 resize-y"
            placeholder="Please tell him we still think of him every single day. He loved the sound of the bugle."
          />
          <p className="text-xs text-[#7a838e] mt-1.5">This message will be shared with the visitor who fulfills your request.</p>
          <p className="text-xs text-[#7a838e] mt-0.5">It will be read at the grave, carrying your words to them.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={submitting}
          className="w-full rounded-full bg-[#1c252f] py-4 text-base font-medium text-white disabled:opacity-60 active:scale-[0.985] transition-colors tracking-tight"
        >
          {submitting ? "Submitting your request..." : "Submit request"}
        </button>

        <p className="text-[11px] text-center tracking-widest text-[#7a838e]">
          ALL REQUESTS ARE PRIVATE. ONLY THE VISITOR WHO CLAIMS IT WILL SEE YOUR DETAILS.
        </p>
      </form>
    </div>
  )
}
