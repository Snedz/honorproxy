'use client'

export default function VisionPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-10">
        <a href="/" className="text-sm text-[#5c656f] hover:text-[#1c252f]">← Back to HonorProxy</a>
      </div>

      <div className="mb-12">
        <div className="inline-block rounded-full border border-[#d8d2c6] bg-white px-4 py-1 text-[10px] tracking-[3px] text-[#5c656f] mb-4">
          THE LONG VIEW
        </div>
        <h1 className="text-5xl font-semibold tracking-[-2px] text-[#1c252f]">Architecture for the Long Term</h1>
        <p className="mt-4 text-xl text-[#3f4852] leading-tight">
          Designed from the beginning to serve remembrance everywhere — and one day, beyond.
        </p>
      </div>

      <div className="space-y-12 text-[15px] leading-relaxed text-[#3a434d]">
        <div>
          <div className="honor-label mb-3">Core design principles</div>
          <p>
            HonorProxy is built on a small set of unchanging principles. These guide every technical and human decision, especially as the service grows.
          </p>
          <ul className="mt-3 space-y-2 list-disc pl-5">
            <li><strong>Reverence first.</strong> No feature, scale, or technology is worth compromising the quiet dignity of remembrance.</li>
            <li><strong>Human at the center.</strong> Technology exists only to connect one person standing at a grave with another who cannot be there.</li>
            <li><strong>Minimal data, maximum trust.</strong> We collect only what is necessary and share it only with the person who will actually stand at the grave.</li>
            <li><strong>Designed for sovereignty.</strong> Families and communities should be able to take their data with them, or move it elsewhere, at any time.</li>
          </ul>
        </div>

        <div>
          <div className="honor-label mb-3">Global scale</div>
          <p>
            The current MVP begins with four major American military cemeteries. This is intentional and temporary.
          </p>
          <p className="mt-3">
            The underlying model — a simple, private request matched with a trusted visitor who is already going there — is designed to work anywhere a grave or memorial exists.
          </p>
          <p className="mt-3">
            Future phases will support cemeteries across countries and cultures, with careful attention to local customs, languages, religious requirements, and legal frameworks.
          </p>
        </div>

        <div>
          <div className="honor-label mb-3">Data portability &amp; sovereignty</div>
          <p>
            Every family should own their record of remembrance. Keepsakes, photos, reflections, and messages belong to them — not to the platform.
          </p>
          <p className="mt-3">
            The architecture prioritizes:
          </p>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Export of complete keepsakes (PDF + original files)</li>
            <li>Clear deletion rights</li>
            <li>Future support for data portability standards</li>
            <li>Community-hosted or self-hosted instances where appropriate</li>
          </ul>
        </div>

        <div>
          <div className="honor-label mb-3">Cultural &amp; religious sensitivity</div>
          <p>
            Different communities have very different relationships with death, memory, and who may visit a grave.
          </p>
          <p className="mt-3">
            The system is deliberately minimal so that local partners, cultural advisors, and communities themselves can shape how the service is offered in their context. No universal template will ever be imposed.
          </p>
        </div>

        <div>
          <div className="honor-label mb-3">Off-world memorials</div>
          <p>
            One day, there will be graves and memorials on the Moon, on Mars, in orbit, and beyond.
          </p>
          <p className="mt-3">
            The same simple emotional need will exist: someone who cannot be physically present will want to know that a real person stood (or floated) there with care and respect.
          </p>
          <p className="mt-3">
            The core loop — request, trusted visitor, personal reflection, private delivery — is intentionally abstract enough to support this future without requiring fundamental redesign.
          </p>
        </div>

        <div>
          <div className="honor-label mb-3">Technology as servant, not driver</div>
          <p>
            Every technical decision is evaluated against a simple question: Does this help a real person stand at a grave with greater care, or does it primarily serve scale, convenience, or data collection?
          </p>
          <p className="mt-3">
            The platform will always favor tools that disappear into the background so the human act of remembrance remains the clearest thing.
          </p>
        </div>

        <p className="mt-3 text-sm text-[#5c656f]">
          The public remembrances that exist today are the first quiet traces of this long journey — shared so that the promise of remembrance can reach further than any one of us could go alone.
        </p>
      </div>

      <div className="mt-14 pt-8 border-t border-[#d8d2c6] text-sm">
        <p className="text-[#5c656f]">
          This is not a roadmap with dates. It is a set of commitments that will guide the project for decades.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a href="/about" className="text-[#5c656f] hover:text-[#1c252f] underline">About HonorProxy</a>
          <a href="/pilot" className="text-[#5c656f] hover:text-[#1c252f] underline">Running a Pilot</a>
          <a href="/conduct" className="text-[#5c656f] hover:text-[#1c252f] underline">Visitor Code of Conduct</a>
        </div>
      </div>
    </div>
  )
}
