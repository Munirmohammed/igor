import { prisma } from '@/lib/prisma';
import { Users, Circle, Plus, Phone } from 'lucide-react';
export const dynamic = 'force-dynamic';
import AddAgentForm from './AddAgentForm';

async function getAgents() {
  return prisma.agent.findMany({ orderBy: { createdAt: 'desc' } });
}

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Agents</h1>
          <p className="text-[12px] text-[#444] mt-0.5">Manage call center agents and extensions</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Agent List */}
        <div className="flex-1 bg-[#0d0d0d] border border-white/[0.06] rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
            <Users size={14} className="text-[#444]" />
            <span className="text-sm font-semibold text-white">{agents.length} Agent{agents.length !== 1 ? 's' : ''}</span>
          </div>

          {agents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <Users size={32} className="text-[#1a1a1a]" />
              <p className="text-[#444] text-sm">No agents yet. Add one below.</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#0d0d0d]">
                  <tr className="border-b border-white/[0.05]">
                    {['Agent', 'Extension', 'Status', 'Added'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] text-[#333] font-bold uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agents.map(a => (
                    <tr key={a.id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff88]/20 to-emerald-900/30 border border-[#00ff88]/10 flex items-center justify-center text-xs font-bold text-[#00ff88]">
                            {a.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white text-sm">{a.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-sm text-[#555]">{a.extension}</td>
                      <td className="px-5 py-3.5">
                        <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border w-fit ${
                          a.status === 'online'
                            ? 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/20'
                            : a.status === 'busy'
                            ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                            : 'text-[#444] bg-white/[0.03] border-white/[0.06]'
                        }`}>
                          <Circle size={6} fill="currentColor" />
                          {a.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#444]">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Agent Form */}
        <div className="w-72 shrink-0">
          <AddAgentForm />
        </div>
      </div>
    </div>
  );
}
