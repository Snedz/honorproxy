export default function Footer() {
  return (
    <footer className="border-t border-[#d8d2c6] py-9 text-center text-[11px] tracking-widest text-[#6b7582]">
      HONORPROXY — A respectful, mission-driven project • 501(c)(3) path • No commercialization of remembrance<br />
      <span className="block mt-1 text-[10px]">Maintained with quiet care. © {new Date().getFullYear()}</span>
      <a href="/about" className="underline hover:text-[#1c252f]">About</a> · 
      <a href="/pilot" className="underline hover:text-[#1c252f]">Pilots</a> · 
      <a href="/vision" className="underline hover:text-[#1c252f]">Long-Term Vision</a> · 
      <a href="/remembrances" className="underline hover:text-[#1c252f]">Recent Remembrances</a> · 
      <a href="/conduct" className="underline hover:text-[#1c252f]">Guidelines</a> · 
      <a href="/privacy" className="underline hover:text-[#1c252f]">Privacy</a>
    </footer>
  );
}
