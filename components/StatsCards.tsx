'use client';

import React from 'react';
import { Phone, CheckCircle, Clock, FileText, TrendingUp } from 'lucide-react';

const StatsCards = () => {
  const stats = [
    { name: 'Active Calls', value: '12', icon: Phone, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Success Rate', value: '94.2%', icon: CheckCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', trend: '+2.1%' },
    { name: 'Avg. Handle Time', value: '4m 12s', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { name: 'Traced Dossiers', value: '1,284', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="dashboard-grid">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="glass-card animate-fade">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <Icon className={`${stat.color} w-6 h-6`} />
              </div>
              {stat.trend && (
                <div className="flex items-center gap-1 text-emerald-500 text-sm font-semibold">
                  <TrendingUp size={14} />
                  {stat.trend}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-muted text-sm font-medium">{stat.name}</span>
              <span className="text-3xl font-bold tracking-tighter text-white mt-1">
                {stat.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
