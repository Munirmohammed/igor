'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PhoneCall,
  ShieldAlert,
  FileText,
  Users,
  Settings,
  Zap,
} from 'lucide-react';

const nav = [
  { label: 'Dashboard',     href: '/',          icon: LayoutDashboard },
  { label: 'Active Calls',  href: '/calls',     icon: PhoneCall },
  { label: 'Intelligence',  href: '/intel',     icon: ShieldAlert },
  { label: 'Dossiers',      href: '/dossiers',  icon: FileText },
  { label: 'Agents',        href: '/agents',    icon: Users },
  { label: 'Settings',      href: '/settings',  icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 bg-[#0d0d0d] border-r border-white/[0.06] flex flex-col h-screen">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-white/[0.06]">
        <div className="w-7 h-7 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center">
          <Zap size={14} className="text-[#00ff88]" />
        </div>
        <span className="font-bold text-sm tracking-widest text-white uppercase">Igor OS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 flex flex-col gap-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20'
                  : 'text-[#666] hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* System status */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="text-[10px] font-mono text-[#333] uppercase tracking-widest mb-2">System</div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] glow-pulse" />
          <span className="text-[11px] text-[#555] font-medium">All Systems Online</span>
        </div>
      </div>
    </aside>
  );
}
