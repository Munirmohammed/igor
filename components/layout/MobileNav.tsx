'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PhoneCall,
  ShieldAlert,
  FileText,
  Settings,
} from 'lucide-react';

const nav = [
  { label: 'Dash',   href: '/',          icon: LayoutDashboard },
  { label: 'Calls',  href: '/calls',     icon: PhoneCall },
  { label: 'Intel',  href: '/intel',     icon: ShieldAlert },
  { label: 'Dossier',href: '/dossiers',  icon: FileText },
  { label: 'Setup',  href: '/settings',  icon: Settings },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0a]/80 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-around px-2 z-50">
      {nav.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 transition-all duration-200 ${
              active ? 'text-[#00ff88]' : 'text-[#666]'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${active ? 'bg-[#00ff88]/10' : ''}`}>
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
