import StatsCards from "@/components/StatsCards";
import CallMonitor from "@/components/CallMonitor";
import IntelFeed from "@/components/IntelFeed";
import { Zap, Shield, Cpu, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      {/* Header Section */}
      <header className="flex justify-between items-end mb-4 group">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter text-white mb-2 group-hover:text-emerald-400 transition-colors">
            Mission Control
          </h1>
          <p className="text-muted text-sm font-medium uppercase tracking-[0.2em]">
            Operational Awareness & Intelligence Hub
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <Activity size={14} className="animate-pulse" />
              <span>System Online</span>
            </div>
            <span className="text-[10px] text-muted font-bold tracking-widest uppercase">Uptime: 24h 12m 04s</span>
          </div>
        </div>
      </header>

      {/* KPI Section */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="flex gap-8 items-start">
        <CallMonitor />
        <IntelFeed />
      </div>

      {/* System Status Footer */}
      <footer className="mt-auto pt-10 border-t border-white/5 grid grid-cols-4 gap-8">
        <div className="flex items-center gap-3 glass-card !p-4 hover:!bg-white/5 pointer-events-none">
          <Zap className="text-emerald-500 w-4 h-4" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Call Processor</span>
            <span className="text-xs font-bold text-white uppercase">Operational</span>
          </div>
        </div>
        <div className="flex items-center gap-3 glass-card !p-4 hover:!bg-white/5 pointer-events-none">
          <Shield className="text-blue-500 w-4 h-4" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Intelligence Link</span>
            <span className="text-xs font-bold text-white uppercase">Secured</span>
          </div>
        </div>
        <div className="flex items-center gap-3 glass-card !p-4 hover:!bg-white/5 pointer-events-none">
          <Cpu className="text-amber-500 w-4 h-4" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Tracing Patch</span>
            <span className="text-xs font-bold text-white uppercase">Active</span>
          </div>
        </div>
        <div className="flex items-center gap-3 glass-card !p-4 hover:!bg-white/5 pointer-events-none">
          <Activity className="text-purple-500 w-4 h-4" />
          <div className="flex flex-col">
            <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Dossier Queue</span>
            <span className="text-xs font-bold text-white uppercase">Empty</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
