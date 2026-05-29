'use client'

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-12">
        <a href="/" className="text-sm text-[#5c656f] hover:text-[#1c252f]">← Back to HonorProxy</a>
      </div>

      <div className="text-center mb-14">
        <div className="inline-block rounded-full border border-[#d8d2c6] bg-white px-4 py-1 text-[10px] tracking-[3px] text-[#5c656f] mb-6">
          OUR PURPOSE
        </div>
        <h1 className="text-5xl font-semibold tracking-[-2px] text-[#1c252f]">HonorProxy</h1>
        <p className="mt-4 text-xl text-[#3f4852] leading-tight">
          A quiet act of remembrance.
        </p>
      </div>

      <div className="space-y-12 text-[15px] leading-relaxed text-[#3a434d]">
        <div>
          <div className="honor-label mb-3">The need</div>
          <p className="text-balance">
            Some families cannot stand at the graves of their loved ones — because of distance, health, age, or the simple fact that life moved them far away. On Memorial Day, Veterans Day, birthdays, or anniversaries, the ache remains.
          </p>
          <p className="mt-3">
            HonorProxy exists so that no one has to grieve alone in that particular way.
          </p>
        </div>

        <div>
          <div className="honor-label mb-3">What we do</div>
          <p>
            A real person — a volunteer visitor — goes to the cemetery on their behalf. They stand at the grave. They take respectful photographs. They leave a simple tribute if requested. And they write a personal reflection of the visit.
          </p>
          <p className="mt-3">
            That report is delivered privately to the family. A small, human act of remembrance, carried across the distance.
          </p>
        </div>

        <div>
          <div className="honor-label mb-3">How it works</div>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <div className="font-mono text-xs tracking-[2px] text-[#8a7754]">01</div>
              <div className="font-medium">Request</div>
              <p className="text-sm text-[#5c656f]">A family shares the name, cemetery, and any message they wish carried to the grave.</p>
            </div>
            <div className="space-y-1.5">
              <div className="font-mono text-xs tracking-[2px] text-[#8a7754]">02</div>
              <div className="font-medium">Claim</div>
              <p className="text-sm text-[#5c656f]">Someone already planning to visit that cemetery claims the request and prepares with care.</p>
            </div>
            <div className="space-y-1.5">
              <div className="font-mono text-xs tracking-[2px] text-[#8a7754]">03</div>
              <div className="font-medium">Deliver</div>
              <p className="text-sm text-[#5c656f]">Photos, a written reflection, and a quiet sense of presence are sent back to the family.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#d8d2c6]">
          <div className="honor-label mb-3">The long view</div>
          <p>
            We began with four major U.S. national cemeteries — Arlington, Fort Snelling, Golden Gate, and Quantico — because that is where the need was most visible to us.
          </p>
          <p className="mt-3 font-medium text-[#2a3138]">
            But this is built to scale to every cemetery on earth — and one day, beyond.
          </p>
          <p className="mt-3">
            The same simple, respectful model can work anywhere people are buried and loved ones are far away. The technology is secondary. The human act of standing in is what matters.
          </p>
          <p className="mt-3 text-sm text-[#5c656f]">
            The public remembrances you see on this site are the quiet traces of these visits — shared with permission so that others may feel less alone in their grief.
          </p>
        </div>

        <div>
          <div className="honor-label mb-3">Our commitments</div>
          <ul className="space-y-2 text-[15px]">
            <li>• Every visit is made with dignity and without spectacle.</li>
            <li>• We never commercialize remembrance.</li>
            <li>• Data is shared only with the person who will actually stand at the grave.</li>
            <li>• We are on a path toward formal 501(c)(3) nonprofit status.</li>
          </ul>
        </div>
      </div>

      <div className="mt-14 pt-8 border-t border-[#d8d2c6] text-center">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <a href="/conduct" className="text-[#5c656f] hover:text-[#1c252f] underline">Visitor Code of Conduct</a>
          <a href="/privacy" className="text-[#5c656f] hover:text-[#1c252f] underline">Privacy</a>
          <a href="/pilot" className="text-[#5c656f] hover:text-[#1c252f] underline">Running a Pilot</a>
          <a href="/vision" className="text-[#5c656f] hover:text-[#1c252f] underline">Long-Term Vision</a>
          <a href="/remembrances" className="text-[#5c656f] hover:text-[#1c252f] underline">Recent Remembrances</a>
          <a href="/request" className="text-[#5c656f] hover:text-[#1c252f] underline">Make a request</a>
          <a href="/visit" className="text-[#5c656f] hover:text-[#1c252f] underline">Offer to visit</a>
        </div>
        <p className="mt-8 text-xs tracking-widest text-[#7a838e]">
          HONORPROXY — A respectful, mission-driven project
        </p>
      </div>
    </div>
  )
}
