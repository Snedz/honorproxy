'use client'

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <a href="/" className="text-sm text-[#5c656f] hover:text-[#1c252f]">← Back to HonorProxy</a>
        <h1 className="mt-6 text-4xl font-semibold tracking-tighter text-[#1c252f]">Privacy &amp; Data Practices</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#4a5563]">
          This service handles deeply personal information. We treat it with the care it deserves.
        </p>
      </div>

      <div className="space-y-10 text-[15px] leading-relaxed text-[#3a434d]">
        <div>
          <div className="honor-label mb-3">What we collect</div>
          <ul className="space-y-2 list-disc pl-5">
            <li>When requesting a visit: The full name of the deceased, the cemetery, any known section or grave number, your relationship to them (optional), a personal message for the visitor, and your email address (required to deliver the report and photos).</li>
            <li>When offering to visit: An account with your email address so we can notify you of matches and deliver any thank-you messages from families.</li>
            <li>Photos and written reflections submitted by visitors.</li>
          </ul>
        </div>

        <div>
          <div className="honor-label mb-3">Who can see your information</div>
          <ul className="space-y-2 list-disc pl-5">
            <li><strong>Families (requesters):</strong> Your request details and personal message are shown only to the single visitor who claims that request.</li>
            <li><strong>Visitors:</strong> Receive only the information needed to locate and honor the specific grave.</li>
            <li><strong>Photos and reflections:</strong> Delivered privately by email to the family who requested the visit. They are not public.</li>
            <li>We do not sell, rent, or share personal information with third parties for advertising or any other purpose.</li>
          </ul>
        </div>

        <div>
          <div className="honor-label mb-3">Data retention and your rights</div>
          <p className="mb-3">We keep records so that families can view their requests and past visits, and so visitors can keep their own keepsakes and history.</p>
          <p>If you would like your data deleted, please contact us and we will handle the request promptly.</p>
        </div>

        <div>
          <div className="honor-label mb-3">Security</div>
          <p>Requests, reports, and photos are stored using industry-standard secure infrastructure (Supabase). Access is tightly controlled through authentication and row-level security rules.</p>
        </div>

        <div>
          <div className="honor-label mb-3">This is a mission-driven project</div>
          <p className="mb-3">
            HonorProxy is currently operated as a volunteer-led initiative with the long-term goal of becoming a formal 501(c)(3) nonprofit organization. Our only purpose is to help families receive respectful remembrance when they cannot be present themselves.
          </p>
          <p>We are not affiliated with the Department of Veterans Affairs, the individual national cemeteries, or any government agency.</p>
          <p className="mt-3 text-sm text-[#5c656f]">
            The public remembrances that exist today are the quiet traces of these visits — shared with permission so that others may feel less alone in their grief.
          </p>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-[#d8d2c6] text-sm text-[#5c656f]">
        Questions or concerns about your data? Reach out through the contact method listed on the main site or reply to any email you have received from us.
      </div>

      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <a href="/conduct" className="text-[#5c656f] hover:text-[#1c252f]">Visitor Code of Conduct</a>
        <a href="/request" className="text-[#5c656f] hover:text-[#1c252f]">Make a request →</a>
      </div>
    </div>
  )
}
