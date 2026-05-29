'use client'

export default function ConductPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <a href="/" className="text-sm text-[#5c656f] hover:text-[#1c252f]">← Back to HonorProxy</a>
        <h1 className="mt-6 text-4xl font-semibold tracking-tighter text-[#1c252f]">Visitor Code of Conduct</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#4a5563]">
          When you claim a request, you are standing at a grave on behalf of someone who cannot be there. This is a quiet position of trust.
        </p>
      </div>

      <div className="space-y-10 text-[15px] leading-relaxed text-[#3a434d]">
        <div>
          <div className="honor-label mb-3">Core principles</div>
          <ul className="space-y-2 list-disc pl-5">
            <li>Treat every request with the same respect you would want shown to your own family.</li>
            <li>Follow all posted rules and guidelines of the specific cemetery.</li>
            <li>Remain quiet, composed, and focused on the act of remembrance.</li>
            <li>Never use a visit for personal, political, commercial, or religious promotion.</li>
          </ul>
        </div>

        <div>
          <div className="honor-label mb-3">Photography and reporting</div>
          <ul className="space-y-2 list-disc pl-5">
            <li>Take only the photos necessary to fulfill the specific request.</li>
            <li>Do not photograph other visitors, funeral services, or unrelated graves.</li>
            <li>Deliver an honest, personal reflection written from the heart.</li>
            <li>Photos and your written reflection are delivered privately to the family only.</li>
          </ul>
        </div>

        <div>
          <div className="honor-label mb-3">Tributes and behavior on site</div>
          <ul className="space-y-2 list-disc pl-5">
            <li>Leave only simple, appropriate tributes if the family has specifically requested one (a small flag, a single flower, etc.).</li>
            <li>Do not leave anything permanent, political, commercial, or that could disturb other visitors.</li>
            <li>Be mindful of other families who may be visiting at the same time.</li>
          </ul>
        </div>

        <div>
          <div className="honor-label mb-3">Honesty and reliability</div>
          <ul className="space-y-2 list-disc pl-5">
            <li>If you realize you cannot complete a claimed visit, release the request promptly through the platform so another visitor can step in.</li>
            <li>Submit your report within a reasonable time after the visit.</li>
            <li>Be truthful in everything you report.</li>
          </ul>
        </div>

        <div>
          <div className="honor-label mb-3">Cemetery-specific notes</div>
          <p className="mb-3">Always check the official cemetery website before traveling.</p>
          <ul className="space-y-2 list-disc pl-5">
            <li><strong>Arlington National Cemetery:</strong> Vehicle entry typically requires a REAL ID or other acceptable form of identification. Check current access rules on the official ANC site.</li>
            <li><strong>Fort Snelling, Golden Gate, Quantico and other VA national cemeteries:</strong> Observe all posted visiting hours and regulations. No alcohol or disruptive conduct is permitted.</li>
          </ul>
        </div>

        <p className="mt-3 text-sm text-[#5c656f]">
          These standards exist so that every visit remains a pure act of remembrance — never spectacle, never self-promotion, always service.
        </p>
      </div>

      <div className="mt-12 pt-8 border-t border-[#d8d2c6] text-sm text-[#5c656f]">
        HonorProxy is a mission-driven project. By participating as a visitor, you agree to uphold these standards of respect and care.
      </div>

      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <a href="/privacy" className="text-[#5c656f] hover:text-[#1c252f]">Privacy practices</a>
        <a href="/visit" className="text-[#5c656f] hover:text-[#1c252f]">Return to offering visits →</a>
      </div>
    </div>
  )
}
