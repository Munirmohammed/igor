'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  PhoneCall, 
  MapPin, 
  ShieldAlert, 
  Users, 
  Settings, 
  LogOut,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Mission Control', icon: LayoutDashboard, path: '/' },
    { name: 'Active Calls', icon: PhoneCall, path: '/calls' },
    { name: 'Intelligence', icon: ShieldAlert, path: '/intel' },
    { name: 'Target Tracking', icon: MapPin, path: '/tracking' },
    { name: 'Agents', icon: Users, path: '/agents' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="sidebar">
      <div className="flex items-center gap-3 px-6 mb-8 group cursor-pointer">
        <div className="p-2 bg-[#10b98120] rounded-xl group-hover:bg-[#10b98140] transition-all">
          <Zap className="text-emerald-500 w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
          IGOR OS
        </span>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5 px-4 mb-4">
        <button className="nav-item w-full text-red-500/80 hover:text-red-500 hover:bg-red-500/10 border-none bg-transparent cursor-pointer">
          <LogOut size={20} />
          <span className="font-medium">End Session</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
