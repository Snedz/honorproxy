'use client';

import Link from 'next/link';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <div className="inline-block rounded-full border border-[#d8d2c6] bg-white px-4 py-1 text-[10px] tracking-[3px] text-[#5c656f] mb-6">
          SOMETHING QUIET WENT WRONG
        </div>

        <h1 className="text-4xl font-semibold tracking-tighter text-[#1c252f] mb-4">
          We’re sorry — an unexpected error occurred.
        </h1>

        <p className="text-[#4a5563] text-[15px] leading-relaxed mb-8">
          This moment of remembrance was interrupted. The team has been notified.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-full border border-[#d8d2c6] bg-white px-6 py-2.5 text-sm font-medium text-[#1c252f] hover:bg-[#f9f7f2] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-[#d8d2c6] bg-white px-6 py-2.5 text-sm font-medium text-[#1c252f] hover:bg-[#f9f7f2] transition-colors"
          >
            Return home
          </Link>
        </div>

        <div className="text-sm text-[#5c656f]">
          <Link href="/remembrances" className="underline hover:text-[#1c252f]">
            Read recent remembrances
          </Link>
          <span className="mx-2 text-[#d8d2c6]">·</span>
          <Link href="/request" className="underline hover:text-[#1c252f]">
            Request a proxy visit
          </Link>
        </div>

        <p className="mt-8 text-[10px] tracking-widest text-[#7a838e]">
          © 2026
        </p>
      </div>
    </div>
  );
}
