export default function Footer() {
  return (
    <footer className="bg-[#020617] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <span className="font-semibold text-zinc-200">
            Luxury<span className="text-[#d6b56e]">Cars</span>
          </span>

          <span className="text-zinc-500 text-xs">
            © {new Date().getFullYear()} All rights reserved
          </span>

          <span className="text-zinc-400 text-xs">Built by Sathvik</span>
        </div>
      </div>
    </footer>
  );
}
