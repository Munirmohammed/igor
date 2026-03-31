'use client';

import { useState, useEffect } from 'react';
import { Shield, Satellite, Camera, User, Zap, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface CallSession {
  id: string;
  callerId: string;
  callerName?: string;
  status: string;
  startTime: string;
}

export default function IntelPage() {
  const [sessions, setSessions] = useState<CallSession[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [gps, setGps] = useState('');
  const [facial, setFacial] = useState('');
  const [cameras, setCameras] = useState('');
  const [satellite, setSatellite] = useState('');
  const [extra, setExtra] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/calls')
      .then(r => r.json())
      .then(d => {
        const all: CallSession[] = d.calls ?? [];
        setSessions(all);
        const live = all.find(c => c.status === 'ongoing');
        if (live) setSelectedId(live.id);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) { toast.error('Select a call session first'); return; }
    setSubmitting(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/intelligence/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: selectedId,
          gps_coordinates: gps || null,
          facial_match: facial || null,
          camera_hits: cameras || null,
          satellite_intel: satellite || null,
          extra_payload: extra || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      toast.success('Intelligence injected into session');
    } catch (e: any) {
      toast.error(e.message ?? 'Injection failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex gap-6 h-full">
      <Toaster position="top-right" toastOptions={{ style: { background: '#141414', color: '#fff', border: '1px solid #ffffff0f', fontSize: '13px' } }} />

      {/* Injection Form */}
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <h1 className="text-lg font-bold text-white">Intelligence Injection</h1>
          <p className="text-[12px] text-[#444] mt-0.5">Push external tracing data into an active call session.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Session selector */}
          <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5">
            <label className="text-[10px] text-[#444] font-bold uppercase tracking-widest block mb-3">
              Target Call Session <span className="text-red-400">*</span>
            </label>
            {sessions.length === 0 ? (
              <div className="flex items-center gap-2 text-[#444] text-sm">
                <AlertCircle size={14} />
                No sessions found. Start a call first.
              </div>
            ) : (
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="w-full bg-[#141414] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white outline-none font-mono appearance-none"
              >
                <option value="">— Select session —</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.id}>
                    [{s.status.toUpperCase()}] {s.callerName || s.callerId} — {new Date(s.startTime).toLocaleTimeString()}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Intel fields */}
          {[
            { icon: Satellite, label: 'GPS Coordinates', key: 'gps', val: gps, set: setGps, placeholder: 'e.g. 46.0569° N, 14.5058° E' },
            { icon: User, label: 'Facial Match Result', key: 'facial', val: facial, set: setFacial, placeholder: 'e.g. MATCH: John Doe (97.3%)' },
            { icon: Camera, label: 'Camera Hit IDs / URLs', key: 'cameras', val: cameras, set: setCameras, placeholder: 'e.g. CAM-401, CAM-109, street-cam-7' },
            { icon: Zap, label: 'Satellite Intelligence', key: 'satellite', val: satellite, set: setSatellite, placeholder: 'e.g. Uplink stable — Hub: Ljubljana-2' },
          ].map(({ icon: Icon, label, key, val, set, placeholder }) => (
            <div key={key} className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5">
              <label className="flex items-center gap-2 text-[10px] text-[#444] font-bold uppercase tracking-widest mb-3">
                <Icon size={12} />
                {label}
              </label>
              <input
                value={val}
                onChange={e => set(e.target.value)}
                className="w-full bg-[#141414] border border-white/[0.08] focus:border-[#00ff88]/30 rounded-lg px-3 py-2.5 text-sm text-white outline-none font-mono placeholder-[#333] transition-colors"
                placeholder={placeholder}
              />
            </div>
          ))}

          {/* Extra payload */}
          <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5">
            <label className="text-[10px] text-[#444] font-bold uppercase tracking-widest block mb-3">Extra Payload (JSON / Text)</label>
            <textarea
              rows={3}
              value={extra}
              onChange={e => setExtra(e.target.value)}
              className="w-full bg-[#141414] border border-white/[0.08] focus:border-[#00ff88]/30 rounded-lg px-3 py-2.5 text-sm text-white outline-none font-mono placeholder-[#333] transition-colors resize-none"
              placeholder='{"custom_field": "value"}'
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !selectedId}
            className="flex items-center justify-center gap-2 py-3 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/30 rounded-xl text-[#00ff88] font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : success ? <CheckCircle2 size={16} /> : <Shield size={16} />}
            {submitting ? 'Injecting…' : success ? 'Injected!' : 'Inject Intelligence'}
          </button>
        </form>
      </div>

      {/* Info Panel */}
      <div className="w-72 shrink-0 flex flex-col gap-4">
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5">
          <div className="text-[10px] text-[#333] uppercase tracking-widest font-bold mb-4">How it works</div>
          <div className="flex flex-col gap-4">
            {[
              { n: '1', t: 'Select Session', d: 'Pick an active or completed call session to inject intelligence into.' },
              { n: '2', t: 'Fill Intel Fields', d: 'Enter GPS, facial match data, camera IDs, or satellite intelligence.' },
              { n: '3', t: 'Inject', d: 'Data merges into the session and is included in the final dossier.' },
              { n: '4', t: 'Dossier Sent', d: 'On call end, a full report is compiled and emailed to admin@shopyle.com.' },
            ].map(({ n, t, d }) => (
              <div key={n} className="flex gap-3">
                <div className="w-5 h-5 shrink-0 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center text-[10px] font-bold text-[#00ff88]">{n}</div>
                <div>
                  <div className="text-xs font-semibold text-white mb-0.5">{t}</div>
                  <div className="text-[11px] text-[#444] leading-relaxed">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={13} className="text-amber-400" />
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Webhook Endpoint</span>
          </div>
          <div className="font-mono text-[10px] text-[#555] break-all">POST /api/intelligence/inject</div>
          <div className="mt-2 text-[10px] text-[#444]">Your external patch can push data here directly.</div>
        </div>
      </div>
    </div>
  );
}
