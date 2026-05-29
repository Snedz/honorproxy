import PublicImpactStats from "@/components/PublicImpactStats";

export default function HonorProxyHome() {
  return (
    <div className="min-h-screen bg-[#f8f6f1] font-sans">

      <main>
        {/* Hero — more reverent and powerful */}
        <section className="mx-auto max-w-4xl px-6 pt-24 pb-20 text-center">
          <div className="inline-block rounded-full border border-[#d8d2c6] bg-white px-4 py-1 text-[10px] tracking-[3px] text-[#5c656f] mb-8">
            A QUIET ACT OF REMEMBRANCE
          </div>
          
          <h1 className="text-6xl sm:text-7xl font-semibold tracking-[-2.5px] leading-[0.96] text-balance text-[#1c252f]">
            Someone will stand<br />at their grave for you.
          </h1>
          
          <p className="mt-7 max-w-md mx-auto text-[17px] leading-relaxed text-[#3f4852]">
            When distance, health, or time keeps you away, a real person will go in your place —<br className="hidden sm:block" />
            with respect, care, and the promise to remember.
          </p>

          <div className="mt-11 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/request" 
               className="inline-flex h-12 items-center justify-center rounded-full bg-[#1c252f] px-9 text-sm font-medium text-white hover:bg-black transition-colors">
              Request a proxy visit
            </a>
            <a href="/visit" 
               className="inline-flex h-12 items-center justify-center rounded-full border border-[#d8d2c6] bg-white px-9 text-sm font-medium text-[#1c252f] hover:bg-[#f9f7f2] transition-colors">
              I’m visiting a cemetery
            </a>
          </div>

          <p className="mt-7 text-xs tracking-widest text-[#7a838e]">
            ARLINGTON • FORT SNELLING • GOLDEN GATE • QUANTICO
          </p>
          <p className="mt-1 text-[10px] tracking-widest text-[#7a838e]">
            The quiet visits from these cemeteries are shared in our public remembrances.
          </p>
        </section>

        {/* How it works — elevated rhythm */}
        <section id="how" className="border-y border-[#d8d2c6] bg-white py-16">
          <div className="mx-auto max-w-4xl px-6">
            <div className="text-center mb-12">
              <div className="honor-label mb-3">How it works</div>
              <h2 className="text-4xl font-semibold tracking-[-1.5px] text-[#1c252f]">Three quiet steps</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-x-8 gap-y-10 text-[15px]">
              <div className="space-y-3">
                <div className="font-mono text-xs tracking-[2px] text-[#8a7754]">01 — ASK</div>
                <div className="font-medium text-lg tracking-tight text-[#1c252f]">You make a request</div>
                <p className="text-[#4a5563] leading-relaxed">Tell us whose grave you wish someone would visit. Share the words or feeling you want carried to them.</p>
              </div>
              <div className="space-y-3">
                <div className="font-mono text-xs tracking-[2px] text-[#8a7754]">02 — STAND IN</div>
                <div className="font-medium text-lg tracking-tight text-[#1c252f]">Someone goes for you</div>
                <p className="text-[#4a5563] leading-relaxed">A visitor already heading to that cemetery claims the request and stands at the grave with quiet respect.</p>
              </div>
              <div className="space-y-3">
                <div className="font-mono text-xs tracking-[2px] text-[#8a7754]">03 — RECEIVE</div>
                <div className="font-medium text-lg tracking-tight text-[#1c252f]">You are sent the memory</div>
                <p className="text-[#4a5563] leading-relaxed">Fresh photos and a personal reflection arrive privately in your inbox — proof that someone was there for you.</p>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-[#5c656f] max-w-prose mx-auto">
              Many of these quiet acts are later shared in our public remembrances, so others may find comfort and inspiration.
            </p>
          </div>
        </section>

        {/* Cemeteries — more elegant */}
        <section className="honor-section border-b border-[#d8d2c6]">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <div className="honor-label mb-2">Beginning with these four</div>
            <h3 className="text-3xl font-semibold tracking-[-1px] text-[#1c252f] mb-10">National cemeteries where<br />HonorProxy is active</h3>
            
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-left">
              {[
                { name: "Arlington National Cemetery", loc: "Arlington, Virginia" },
                { name: "Fort Snelling National Cemetery", loc: "Minneapolis, Minnesota" },
                { name: "Golden Gate National Cemetery", loc: "San Bruno, California" },
                { name: "Quantico National Cemetery", loc: "Triangle, Virginia" },
              ].map((c) => (
                <div key={c.name} className="honor-card px-6 py-5">
                  <div className="font-medium tracking-tight text-[#1c252f]">{c.name}</div>
                  <div className="text-sm text-[#5c656f] mt-0.5">{c.loc}</div>
                </div>
              ))}
            </div>
            
            <p className="mt-9 text-xs tracking-widest text-[#7a838e]">
              BUILT TO SCALE TO EVERY CEMETERY ON EARTH — AND ONE DAY, BEYOND.
            </p>
            <p className="mt-2 text-xs tracking-widest text-[#7a838e]">
              The quiet visits that have taken place here are shared in our public remembrances.
            </p>
          </div>
        </section>

        {/* Subtle public impact statement */}
        <PublicImpactStats />

        {/* Quiet invitation to the public archive */}
        <div className="py-8 text-center">
          <a 
            href="/remembrances" 
            className="text-sm text-[#5c656f] underline hover:text-[#1c252f] tracking-widest"
          >
            Read recent remembrances
          </a>
        </div>
      </main>
    </div>
  );
}
