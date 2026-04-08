'use client';

import { Bell, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TopBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-14 shrink-0 bg-[#0d0d0d] border-b border-white/[0.06] flex items-center gap-4 px-4 md:px-6">
      {/* Search */}
      <div className="hidden sm:flex items-center gap-2 flex-1 max-w-sm bg-white/[0.03] border border-white/[0.07] rounded-lg px-3 py-2">
        <Search size={14} className="text-[#444]" />
        <input
          className="bg-transparent text-sm text-white placeholder-[#444] outline-none w-full font-medium"
          placeholder="Search calls, dossiers…"
        />
      </div>

      <div className="flex-1" />

      {/* Clock */}
      <span className="hidden md:inline font-mono text-xs text-[#444] tracking-widest">{time}</span>

      {/* Notifications */}
      <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.05] transition-colors">
        <Bell size={16} className="text-[#555]" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
      </button>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff88]/30 to-emerald-900/40 border border-[#00ff88]/20 flex items-center justify-center">
        <span className="text-xs font-bold text-[#00ff88]">A</span>
      </div>
    </header>
  );
}
