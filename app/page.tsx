import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { Phone, PhoneOff, PhoneIncoming, Shield, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

async function getStats() {
  const [totalCalls, activeCalls, dossiers, agents] = await Promise.all([
    prisma.callSession.count(),
    prisma.callSession.count({ where: { status: 'ongoing' } }),
    prisma.dossier.count(),
    prisma.agent.count({ where: { status: 'online' } }),
  ]);

  const completedCalls = await prisma.callSession.count({ where: { status: 'completed' } });
  const successRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;

  return { totalCalls, activeCalls, dossiers, agents, successRate };
}

async function getRecentCalls() {
  return prisma.callSession.findMany({
    orderBy: { startTime: 'desc' },
    take: 8,
    include: { injectedData: true },
  });
}

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    ongoing:   { label: 'LIVE',      cls: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/20' },
    completed: { label: 'DONE',      cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    failed:    { label: 'FAILED',    cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
  };
  const s = map[status] ?? { label: status.toUpperCase(), cls: 'text-[#666] bg-white/5 border-white/10' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${s.cls}`}>
      {status === 'ongoing' && <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] blink" />}
      {s.label}
    </span>
  );
};

export default async function DashboardPage() {
  const [stats, recentCalls] = await Promise.all([getStats(), getRecentCalls()]);

  const statCards = [
    { label: 'Total Calls',  value: stats.totalCalls,   icon: Phone,         color: 'text-[#00ff88]', bg: 'bg-[#00ff88]/5  border-[#00ff88]/10' },
    { label: 'Active Now',   value: stats.activeCalls,  icon: PhoneIncoming, color: 'text-blue-400',   bg: 'bg-blue-500/5   border-blue-500/10' },
    { label: 'Dossiers Sent',value: stats.dossiers,     icon: Shield,        color: 'text-amber-400',  bg: 'bg-amber-500/5  border-amber-500/10' },
    { label: 'Success Rate', value: `${stats.successRate}%`, icon: CheckCircle2, color: 'text-purple-400', bg: 'bg-purple-500/5 border-purple-500/10' },
  ];

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight">Mission Control</h1>
        <p className="text-[12px] text-[#444] mt-0.5 uppercase tracking-widest font-mono">Real-time call operations & intelligence</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-xl border p-4 bg-[#0d0d0d] ${bg} transition-all hover:border-opacity-50`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] text-[#555] font-semibold uppercase tracking-widest">{label}</span>
              <Icon size={16} className={color} />
            </div>
            <div className={`text-2xl font-bold tracking-tight ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/calls" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 rounded-lg text-[#00ff88] text-sm font-semibold transition-all">
          <Phone size={15} />
          <span>New Call</span>
        </Link>
        <Link href="/intel" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-lg text-white text-sm font-medium transition-all">
          <Shield size={15} />
          <span>Inject Intel</span>
        </Link>
        <Link href="/dossiers" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] rounded-lg text-white text-sm font-medium transition-all">
          <CheckCircle2 size={15} />
          <span>Dossiers</span>
        </Link>
      </div>

      {/* Calls Table */}
      <div className="flex-1 bg-[#0d0d0d] border border-white/[0.06] rounded-xl overflow-hidden flex flex-col min-h-0">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-[#555]" />
            <span className="text-sm font-semibold text-white">Recent Sessions</span>
          </div>
          {stats.activeCalls > 0 && (
            <span className="flex items-center gap-1.5 text-[11px] text-[#00ff88] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] blink" />
              {stats.activeCalls} live
            </span>
          )}
        </div>

        <div className="overflow-auto flex-1">
          {recentCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <PhoneOff size={28} className="text-[#2a2a2a]" />
              <p className="text-[#444] text-sm">No calls yet. <Link href="/calls" className="text-[#00ff88] hover:underline">Start the first one.</Link></p>
            </div>
          ) : (
            <div className="min-w-[800px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#0d0d0d] z-10">
                  <tr className="border-b border-white/[0.05]">
                    {['Caller', 'Recipient', 'Direction', 'Location', 'Status', 'Intel', 'Duration', 'Time'].map((h) => (
                      <th key={h} className="text-left px-5 py-2.5 text-[10px] text-[#444] font-bold uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentCalls.map((call) => (
                    <tr key={call.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group">
                      <td className="px-5 py-3 font-mono text-xs text-white font-bold">{call.callerName || call.callerId}</td>
                      <td className="px-5 py-3 font-mono text-xs text-[#666]">{call.recipientId}</td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] text-[#555] font-semibold uppercase tracking-wider">{call.direction}</span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#666]">
                        {call.geoCity && call.geoCountry ? `${call.geoCity}, ${call.geoCountry}` : call.ipAddress ?? '—'}
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={call.status} /></td>
                      <td className="px-5 py-3">
                        {call.injectedData ? (
                          <Shield size={14} className="text-amber-400" />
                        ) : (
                          <span className="text-[#2a2a2a] text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-[#555]">
                        {call.duration ? `${Math.floor(call.duration / 60)}m ${call.duration % 60}s` : call.status === 'ongoing' ? <Clock size={12} className="text-[#00ff88] blink" /> : '—'}
                      </td>
                      <td className="px-5 py-3 text-[11px] text-[#444]">
                        {formatDistanceToNow(new Date(call.startTime), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
