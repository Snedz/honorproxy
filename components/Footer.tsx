export default function Footer() {
  return (
    <footer className="border-t border-[#d8d2c6] py-8 text-center text-[11px] tracking-widest text-[#6b7582]">
      <div className="mx-auto max-w-5xl px-6">
        HONORPROXY — A respectful, mission-driven project • 501(c)(3) path • No commercialization of remembrance
        <div className="mt-1 text-[10px]">Maintained with quiet care. © {new Date().getFullYear()}</div>

        {/* Links wrap gracefully instead of forcing one long line */}
        <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px]">
          <a href="/about" className="underline hover:text-[#1c252f]">About</a>
          <span className="text-[#d8d2c6]">·</span>
          <a href="/pilot" className="underline hover:text-[#1c252f]">Pilot</a>
          <span className="text-[#d8d2c6]">·</span>
          <a href="/vision" className="underline hover:text-[#1c252f]">Vision</a>
          <span className="text-[#d8d2c6]">·</span>
          <a href="/remembrances" className="underline hover:text-[#1c252f]">Remembrances</a>
          <span className="text-[#d8d2c6]">·</span>
          <a href="/conduct" className="underline hover:text-[#1c252f]">Guidelines</a>
          <span className="text-[#d8d2c6]">·</span>
          <a href="/privacy" className="underline hover:text-[#1c252f]">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
