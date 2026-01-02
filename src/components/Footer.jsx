export default function Footer() {
  return (
    <footer className="relative bg-[#020617] border-t border-white/5">
      {/* subtle glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <span className="font-medium tracking-wide text-zinc-200">
            Luxury<span className="text-[#d6b56e] ml-0.5">Cars</span>
          </span>

          <span className="text-xs text-zinc-500">
            © {new Date().getFullYear()} All rights reserved
          </span>

          <span className="text-xs text-zinc-600">Crafted by Sathvik</span>
        </div>
      </div>
    </footer>
  );
}
