'use client';

import { useState, useRef, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Delete, Loader2, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import type { Call, Device } from '@twilio/voice-sdk';

type CallState = 'idle' | 'dialing' | 'connected' | 'ending';

interface LiveCallSession {
  id: string;
  callerId: string;
  recipientId: string;
  startTime: string;
  geoCity?: string;
  geoCountry?: string;
  geoLat?: number;
  geoLon?: number;
  status: string;
  callerName?: string;
}

export default function CallsPage() {
  const [dialpad, setDialpad] = useState('');
  const [callerName, setCallerName] = useState('');
  const [callState, setCallState] = useState<CallState>('idle');
  const [activeSession, setActiveSession] = useState<LiveCallSession | null>(null);
  const [muted, setMuted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [sessions, setSessions] = useState<LiveCallSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState<Device | null>(null);
  const [twilioCall, setTwilioCall] = useState<Call | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing sessions
  const fetchSessions = async () => {
    const res = await fetch('/api/calls');
    const data = await res.json();
    setSessions(data.calls ?? []);
    setLoading(false);
  };

  useEffect(() => { 
    fetchSessions(); 
    setupTwilio();
  }, []);

  const setupTwilio = async () => {
    try {
      const res = await fetch('/api/twilio/token');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (typeof window !== 'undefined') {
        const { Device } = await import('@twilio/voice-sdk');
        const newDevice = new Device(data.token, {
          codecPreferences: ['opus', 'pcmu'],
          fakeLocalDTMF: true,
          enableRingingState: true,
        });

        newDevice.on('registered', () => {
          toast.success('VoIP System Online (WebRTC)');
        });

        newDevice.on('error', (err: any) => {
          console.error('Twilio Voice Error:', err);
          toast.error(`VoIP Error: ${err.message}`);
        });

        await newDevice.register();
        setDevice(newDevice);
      }
    } catch (e: any) {
      toast.error('Failed to configure VoIP. Check Settings.');
    }
  };

  // Timer for active call
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callState]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleDial = (d: string) => setDialpad(p => (p + d).slice(0, 20));
  const handleBackspace = () => setDialpad(p => p.slice(0, -1));

  const startCall = async () => {
    if (!dialpad.trim()) { toast.error('Enter a number to dial'); return; }
    if (!device) { toast.error('VoIP not ready. Check Twilio settings.'); return; }

    setCallState('dialing');

    try {
      // Connect out via Twilio WebRTC
      const call = await device.connect({ params: { To: dialpad, From: 'IGOR-Agent' } });
      setTwilioCall(call);

      // Setup call event listeners
      call.on('accept', () => {
        setCallState('connected');
        toast.success(`Call Connected`);
        setActiveSession({
          id: 'temp-live',
          callerId: dialpad,
          recipientId: 'IGOR-HQ',
          startTime: new Date().toISOString(),
          status: 'ongoing'
        });
        fetchSessions();
      });

      call.on('disconnect', () => {
        setCallState('idle');
        setTwilioCall(null);
        setActiveSession(null);
        toast.success('Call ended — Dossier pipeline checking');
        fetchSessions();
      });

      call.on('error', (err: any) => {
        setCallState('idle');
        setTwilioCall(null);
        setActiveSession(null);
        toast.error(`Call Error: ${err.message}`);
      });

    } catch (e: any) {
      toast.error(e.message ?? 'Failed to start call');
      setCallState('idle');
    }
  };

  const endCall = async () => {
    if (callState === 'ending') return;
    setCallState('ending');
    
    if (twilioCall) {
      twilioCall.disconnect();
    } else {
      setCallState('idle');
      setActiveSession(null);
      setDialpad('');
      setCallerName('');
    }
  };

  const dialKeys = ['1','2','3','4','5','6','7','8','9','*','0','#'];

  return (
    <div className="flex gap-6 h-full">
      <Toaster position="top-right" toastOptions={{ style: { background: '#141414', color: '#fff', border: '1px solid #ffffff0f', fontSize: '13px' } }} />

      {/* Dialer Panel */}
      <div className="w-80 shrink-0 flex flex-col gap-4">
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl overflow-hidden">
          {/* Display */}
          <div className="p-5 border-b border-white/[0.06]">
            {callState === 'connected' && activeSession ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#00ff88] blink" />
                  <span className="text-[11px] text-[#00ff88] font-bold uppercase tracking-widest">Live</span>
                </div>
                <div className="font-mono text-2xl font-bold text-white">{fmt(elapsed)}</div>
                <div className="text-sm text-[#555] font-mono">{activeSession.callerId}</div>
                {activeSession.geoCity && (
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-400">
                    <MapPin size={11} />
                    {activeSession.geoCity}, {activeSession.geoCountry}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  className="bg-transparent text-sm text-[#666] outline-none placeholder-[#333] font-medium w-full"
                  placeholder="Caller name (optional)"
                  value={callerName}
                  onChange={e => setCallerName(e.target.value)}
                />
                <div className="font-mono text-2xl font-bold text-white tracking-widest min-h-[36px]">
                  {dialpad || <span className="text-[#2a2a2a]">———</span>}
                </div>
              </div>
            )}
          </div>

          {/* Dialpad Grid */}
          {callState !== 'connected' && (
            <div className="grid grid-cols-3 gap-0 border-b border-white/[0.06]">
              {dialKeys.map(k => (
                <button
                  key={k}
                  onClick={() => handleDial(k)}
                  className="flex flex-col items-center justify-center py-4 text-base font-bold text-white hover:bg-white/[0.04] active:bg-white/[0.08] transition-colors border-r border-b border-white/[0.04] last:border-r-0"
                >
                  {k}
                  <span className="text-[8px] text-[#333] font-normal mt-0.5">
                    {(({'2':'ABC','3':'DEF','4':'GHI','5':'JKL','6':'MNO','7':'PQRS','8':'TUV','9':'WXYZ','*':'','+':'',0:'',1:'','#':''}) as Record<string, string>)[k] || ''}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="p-4 flex gap-3 justify-center">
            {callState === 'idle' || callState === 'dialing' ? (
              <>
                <button
                  onClick={handleBackspace}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-[#444] hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  <Delete size={18} />
                </button>
                <button
                  onClick={startCall}
                  disabled={callState === 'dialing'}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00ff88]/15 hover:bg-[#00ff88]/25 border border-[#00ff88]/30 rounded-xl text-[#00ff88] font-bold text-sm transition-all disabled:opacity-50"
                >
                  {callState === 'dialing' ? (
                    <><Loader2 size={16} className="animate-spin" /> Connecting…</>
                  ) : (
                    <><Phone size={16} /> Call</>
                  )}
                </button>
              </>
            ) : (
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => {
                    if (twilioCall) twilioCall.mute(!muted);
                    setMuted(m => !m);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all border ${muted ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/[0.04] border-white/[0.08] text-[#666]'}`}
                >
                  {muted ? <MicOff size={16} /> : <Mic size={16} />}
                  {muted ? 'Muted' : 'Mute'}
                </button>
                <button
                  onClick={endCall}
                  disabled={callState === 'ending'}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold transition-all disabled:opacity-50"
                >
                  <PhoneOff size={16} />
                  {callState === 'ending' ? 'Ending…' : 'End'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SIP Status */}
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] text-[#333] uppercase tracking-widest font-bold">SIP Connection</div>
            <button onClick={setupTwilio} className="text-[#444] hover:text-white transition-colors" title="Reconnect Twilio">
              <RefreshCw size={12} />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-1.5 h-1.5 rounded-full ${device ? 'bg-[#00ff88] blink' : 'bg-red-500'}`} />
            <span className="text-xs text-[#555] font-medium">{device ? 'WebRTC Mode (Twilio SDK)' : 'Disconnected (Check Settings)'}</span>
          </div>
          <div className="text-[10px] text-[#2a2a2a] font-mono">
             Identity: IGOR-Agent
          </div>
        </div>
      </div>

      {/* Active Sessions List */}
      <div className="flex-1 bg-[#0d0d0d] border border-white/[0.06] rounded-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
          <span className="text-sm font-semibold text-white">All Call Sessions</span>
          <button onClick={fetchSessions} className="text-[11px] text-[#444] hover:text-white transition-colors font-medium">Refresh</button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 size={20} className="animate-spin text-[#333]" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <AlertCircle size={28} className="text-[#2a2a2a]" />
              <p className="text-[#444] text-sm">No call sessions yet. Use the dialer to start.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-[#0d0d0d]">
                <tr className="border-b border-white/[0.04]">
                  {['Caller', 'Location', 'Status', 'Duration', 'Started'].map(h => (
                    <th key={h} className="text-left px-5 py-2.5 text-[10px] text-[#333] font-bold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} className="border-b border-white/[0.03] hover:bg-white/[0.015] transition-colors">
                    <td className="px-5 py-3 font-mono text-xs font-bold text-white">{s.callerName || s.callerId}</td>
                    <td className="px-5 py-3 text-xs text-[#555]">
                      {s.geoCity ? `${s.geoCity}, ${s.geoCountry}` : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        s.status === 'ongoing' ? 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/20' :
                        s.status === 'completed' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                        'text-red-400 bg-red-500/10 border-red-500/20'
                      }`}>{s.status.toUpperCase()}</span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-[#555]">—</td>
                    <td className="px-5 py-3 text-xs text-[#444]">
                      {new Date(s.startTime).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
