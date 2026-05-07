export function Header() {
  return (
    <header className="w-full py-5 px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          {/* Logo — animated gradient ring */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose via-primary to-sky opacity-60 group-hover:opacity-90 transition-opacity duration-500 blur-sm" />
            <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-rose via-primary to-sky flex items-center justify-center shadow-[0_0_30px_rgba(249,168,212,0.25)]">
              <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
            </div>
          </div>
          <span className="text-[16px] font-normal tracking-[0.18em] bg-gradient-to-r from-rose via-primary to-sky bg-clip-text text-transparent uppercase font-cute">
            AuraMatch
          </span>
        </div>
        <p className="hidden md:block text-white/30 text-[10px] tracking-[0.35em] uppercase font-light font-cute">
          Personal Color Analysis
        </p>
      </div>
    </header>
  );
}
