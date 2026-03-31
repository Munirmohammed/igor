'use client';

import React from 'react';
import { ShieldAlert, Zap, Cpu, Satellite } from 'lucide-react';

const IntelFeed = () => {
  const intelEvents = [
    { id: '1', title: 'GPS Data Injected', target: '+1 202 555 0124', time: '2m ago', type: 'location' },
    { id: '2', title: 'Facial Match Identified', target: '+44 20 7946 0032', time: '12m ago', type: 'match' },
    { id: '3', title: 'Satellite Uplink Stable', target: 'System', time: '24m ago', type: 'system' },
    { id: '4', title: 'Camera Feed Acquired', target: '+386 69 617 351', time: '35m ago', type: 'camera' },
  ];

  return (
    <div className="glass-card min-w-[320px] max-w-[400px]">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="text-emerald-500 w-5 h-5" />
        <h2 className="text-lg font-bold tracking-tight uppercase">Live Intelligence</h2>
      </div>

      <div className="flex flex-col gap-4">
        {intelEvents.map((event) => {
          let Icon = Zap;
          let color = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
          
          if (event.type === 'location') { Icon = Satellite; color = 'text-blue-400 border-blue-500/20 bg-blue-500/5'; }
          if (event.type === 'match') { Icon = ShieldAlert; color = 'text-amber-400 border-amber-500/20 bg-amber-500/5'; }
          if (event.type === 'system') { Icon = Cpu; color = 'text-purple-400 border-purple-500/20 bg-purple-500/5'; }

          return (
            <div key={event.id} className={`p-4 rounded-xl border ${color} animate-fade`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Icon size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">{event.title}</span>
                </div>
                <span className="text-[10px] opacity-60 font-medium">{event.time}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-white tracking-widest">{event.target}</span>
                <span className="text-[10px] opacity-70 font-medium">Session ID: {event.id.repeat(4)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all">
        <span className="text-xs text-muted font-bold uppercase tracking-widest">View Archives</span>
      </div>
    </div>
  );
};

export default IntelFeed;
