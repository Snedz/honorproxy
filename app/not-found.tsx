import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <div className="inline-block rounded-full border border-[#d8d2c6] bg-white px-4 py-1 text-[10px] tracking-[3px] text-[#5c656f] mb-6">
          THIS PLACE IS QUIET
        </div>

        <h1 className="text-4xl font-semibold tracking-tighter text-[#1c252f] mb-4">
          The page you are looking for is not here.
        </h1>

        <p className="text-[#4a5563] text-[15px] leading-relaxed mb-8">
          Perhaps it has moved, or perhaps you have arrived at a different kind of remembrance.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center rounded-full border border-[#d8d2c6] bg-white px-6 py-2.5 text-sm font-medium text-[#1c252f] hover:bg-[#f9f7f2] transition-colors"
          >
            Return home
          </Link>
          <Link 
            href="/remembrances" 
            className="inline-flex items-center justify-center rounded-full border border-[#d8d2c6] bg-white px-6 py-2.5 text-sm font-medium text-[#1c252f] hover:bg-[#f9f7f2] transition-colors"
          >
            Read recent remembrances
          </Link>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center text-sm">
          <Link 
            href="/request" 
            className="text-[#5c656f] underline hover:text-[#1c252f]"
          >
            Request a proxy visit
          </Link>
          <span className="hidden sm:inline text-[#d8d2c6]">·</span>
          <Link 
            href="/visit" 
            className="text-[#5c656f] underline hover:text-[#1c252f]"
          >
            Offer to visit a cemetery
          </Link>
        </div>

        <p className="mt-8 text-[10px] tracking-widest text-[#7a838e]">
          © 2026
        </p>
      </div>
    </div>
  )
}
