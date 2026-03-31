import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Shield, MapPin, User, Camera, Satellite, CheckCircle2, Clock, Mail } from 'lucide-react';

async function getDossiers() {
  return prisma.dossier.findMany({
    orderBy: { compiledAt: 'desc' },
    include: { callSession: { include: { injectedData: true } } },
  });
}

export default async function DossiersPage() {
  const dossiers = await getDossiers();

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">Intelligence Dossiers</h1>
          <p className="text-[12px] text-[#444] mt-0.5">Compiled reports sent to admin@shopyle.com</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0d0d0d] border border-white/[0.06] rounded-lg">
          <Mail size={13} className="text-[#444]" />
          <span className="text-xs text-[#555] font-mono">admin@shopyle.com</span>
        </div>
      </div>

      {dossiers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#0d0d0d] border border-white/[0.06] rounded-xl">
          <FileText size={36} className="text-[#1a1a1a]" />
          <p className="text-[#444] text-sm">No dossiers yet. End a call session to generate one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 overflow-y-auto">
          {dossiers.map((d) => {
            const intel = d.callSession.injectedData;
            return (
              <div key={d.id} className="bg-[#0d0d0d] border border-white/[0.06] hover:border-white/[0.12] rounded-xl p-5 transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <FileText size={16} className="text-amber-400" />
                    </div>
                    <div>
                      <div className="font-mono text-sm font-bold text-white">
                        {d.callSession.callerName || d.callSession.callerId}
                      </div>
                      <div className="text-[11px] text-[#444] font-mono mt-0.5">{d.id.slice(0, 16)}…</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      d.status === 'sent'
                        ? 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/20'
                        : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    }`}>
                      {d.status === 'sent' ? '✓ Sent' : '⏳ Pending'}
                    </span>
                    <span className="text-[11px] text-[#333]">
                      {formatDistanceToNow(new Date(d.compiledAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Intel Grid */}
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  <div className="bg-[#141414] rounded-lg p-3 border border-white/[0.04]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <MapPin size={11} className="text-blue-400" />
                      <span className="text-[9px] text-[#444] font-bold uppercase tracking-wider">Location</span>
                    </div>
                    <div className="font-mono text-xs text-white">
                      {intel?.gpsCoordinates ||
                        (d.callSession.geoCity ? `${d.callSession.geoCity}, ${d.callSession.geoCountry}` : 'No data')}
                    </div>
                  </div>
                  <div className="bg-[#141414] rounded-lg p-3 border border-white/[0.04]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <User size={11} className="text-purple-400" />
                      <span className="text-[9px] text-[#444] font-bold uppercase tracking-wider">Facial ID</span>
                    </div>
                    <div className="font-mono text-xs text-white">{intel?.facialMatch || 'No data'}</div>
                  </div>
                  <div className="bg-[#141414] rounded-lg p-3 border border-white/[0.04]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Camera size={11} className="text-red-400" />
                      <span className="text-[9px] text-[#444] font-bold uppercase tracking-wider">Cameras</span>
                    </div>
                    <div className="font-mono text-xs text-white">{intel?.cameraHits || 'No hits'}</div>
                  </div>
                  <div className="bg-[#141414] rounded-lg p-3 border border-white/[0.04]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Satellite size={11} className="text-amber-400" />
                      <span className="text-[9px] text-[#444] font-bold uppercase tracking-wider">Satellite</span>
                    </div>
                    <div className="font-mono text-xs text-white">{intel?.satelliteIntel || 'No data'}</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-[#333]">
                  <div className="flex items-center gap-2 font-mono">
                    <CheckCircle2 size={12} className="text-[#00ff88]" />
                    Emailed to {d.adminEmail}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={11} />
                    Session: {new Date(d.callSession.startTime).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
