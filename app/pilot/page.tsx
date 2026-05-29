'use client'

export default function PilotPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <a href="/" className="text-sm text-[#5c656f] hover:text-[#1c252f]">← Back to HonorProxy</a>
      </div>

      <div className="mb-12">
        <div className="inline-block rounded-full border border-[#d8d2c6] bg-white px-4 py-1 text-[10px] tracking-[3px] text-[#5c656f] mb-4">
          FOR THOSE WHO WANT TO HELP
        </div>
        <h1 className="text-5xl font-semibold tracking-[-2px] text-[#1c252f]">Running a Pilot</h1>
        <p className="mt-4 text-xl text-[#3f4852] leading-tight">
          Small, careful beginnings for a quiet service.
        </p>
      </div>

      <div className="space-y-12 text-[15px] leading-relaxed text-[#3a434d]">
        <div>
          <div className="honor-label mb-3">Why start small</div>
          <p>
            HonorProxy exists to serve real grief with real presence. Before opening the doors widely, we believe in beginning with a few trusted pilots — small groups of visitors and families who can help us learn, refine, and ensure the experience remains dignified.
          </p>
          <p className="mt-3">
            A good pilot is not about scale. It is about care, listening, and protecting the sacred nature of this work.
          </p>
        </div>

        <div>
          <div className="honor-label mb-3">Finding your first visitors</div>
          <p className="mb-3">Look for people who already feel called to this kind of quiet service:</p>
          <ul className="space-y-2 list-disc pl-5">
            <li>Veterans or Gold Star families who understand the weight of remembrance</li>
            <li>People who regularly visit national cemeteries on their own</li>
            <li>Trusted members of veterans organizations, church groups, or service clubs</li>
            <li>Individuals with a natural gift for writing and reflection</li>
          </ul>
          <p className="mt-3 text-sm text-[#5c656f]">
            Start with 3–8 people you know personally. This keeps the early experience human and accountable.
          </p>
        </div>

        <div>
          <div className="honor-label mb-3">Seeding the first requests</div>
          <p>
            Reach out gently to a small number of families who might benefit. This is sensitive work — never pressure anyone.
          </p>
          <p className="mt-3">Good places to begin (with care and permission):</p>
          <ul className="space-y-2 list-disc pl-5">
            <li>Gold Star family networks</li>
            <li>Veterans service organizations</li>
            <li>Hospice or grief support groups</li>
            <li>Personal connections in the veteran community</li>
          </ul>
        </div>

        <div>
          <div className="honor-label mb-3">Sample messages</div>
          
          <div className="mt-4 p-5 border border-[#d8d2c6] bg-white rounded-2xl">
            <div className="honor-label mb-2 text-[#8a7754]">For a potential visitor</div>
            <p className="text-sm italic">
              “I’m helping test something small and meaningful called HonorProxy. It connects families who can’t visit a grave with trusted people who are already going to that cemetery. Would you be open to hearing more? There’s no pressure — only if it feels right.”
            </p>
          </div>

          <div className="mt-4 p-5 border border-[#d8d2c6] bg-white rounded-2xl">
            <div className="honor-label mb-2 text-[#8a7754]">For a family</div>
            <p className="text-sm italic">
              “A few of us are quietly testing a service where someone who is already visiting a national cemetery can stand at your loved one’s grave on your behalf, take respectful photos, and write a short reflection. It’s completely private and free. Would this be something you’d like to try, or would you prefer not to be contacted about it again?”
            </p>
          </div>
        </div>

        <div>
          <div className="honor-label mb-3">During the pilot</div>
          <ul className="space-y-2 list-disc pl-5">
            <li>Stay in close, personal contact with both visitors and families</li>
            <li>Listen more than you talk</li>
            <li>Note what feels reverent and what feels off</li>
            <li>Be willing to pause or stop the pilot if anything feels wrong</li>
            <li>Collect quiet feedback — not surveys, but conversations</li>
          </ul>
        </div>

        <div>
          <div className="honor-label mb-3">After a pilot</div>
          <p>Ask yourselves:</p>
          <ul className="space-y-2 list-disc pl-5 mt-2">
            <li>Did this feel like genuine service, or did it feel like a project?</li>
            <li>Where did the process feel heavy or beautiful?</li>
            <li>What would we never want to change?</li>
            <li>What would we do differently next time?</li>
          </ul>
        </div>

        <div className="pt-6 border-t border-[#d8d2c6]">
          <div className="honor-label mb-3">A note on the long view</div>
          <p>
            HonorProxy was imagined to one day serve remembrance at cemeteries everywhere — and eventually, perhaps, beyond Earth. But none of that matters if we cannot first do this work with extraordinary care in the places we know best.
          </p>
          <p className="mt-3">
            Every small, reverent pilot is part of that future.
          </p>
          <p className="mt-3 text-sm text-[#5c656f]">
            The public remembrances that may come from these pilots are not the goal — they are a quiet gift to others who may one day need the same comfort.
          </p>
        </div>
      </div>

      <div className="mt-14 pt-8 border-t border-[#d8d2c6] text-sm">
        <p className="text-[#5c656f]">
          If you’re running a pilot and want to talk through it, reach out through the contact method on the main site.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a href="/about" className="text-[#5c656f] hover:text-[#1c252f] underline">About HonorProxy</a>
          <a href="/conduct" className="text-[#5c656f] hover:text-[#1c252f] underline">Visitor Code of Conduct</a>
          <a href="/privacy" className="text-[#5c656f] hover:text-[#1c252f] underline">Privacy</a>
        </div>
      </div>
    </div>
  )
}
