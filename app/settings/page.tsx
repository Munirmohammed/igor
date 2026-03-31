'use client';

import { Settings, Mail, Server, Key, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSaved(true); setTimeout(() => setSaved(false), 3000); }, 800);
  };

  const Field = ({ label, placeholder, type = 'text', mono = false, defaultVal = '' }: {
    label: string; placeholder: string; type?: string; mono?: boolean; defaultVal?: string;
  }) => (
    <div>
      <label className="text-[10px] text-[#444] font-bold uppercase tracking-widest block mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={defaultVal}
        className={`w-full bg-[#141414] border border-white/[0.08] focus:border-[#00ff88]/30 rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder-[#333] transition-colors ${mono ? 'font-mono' : ''}`}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold text-white">Settings</h1>
        <p className="text-[12px] text-[#444] mt-0.5">Configure SIP, SMTP, and system preferences</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* SIP */}
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Server size={14} className="text-blue-400" />
            <span className="text-sm font-bold text-white">SIP / VoIP Server</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="SIP Host" placeholder="sip.yourdomain.com" />
            <Field label="SIP Port" placeholder="5060" mono />
            <Field label="SIP Username" placeholder="igor@yourdomain.com" mono />
            <Field label="SIP Password" type="password" placeholder="••••••••" />
            <div className="col-span-2">
              <Field label="WebSocket URI (WSS)" placeholder="wss://sip.yourdomain.com/ws" mono />
            </div>
          </div>
        </div>

        {/* SMTP */}
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={14} className="text-amber-400" />
            <span className="text-sm font-bold text-white">Email (SMTP)</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="SMTP Host" placeholder="smtp.gmail.com" />
            <Field label="SMTP Port" placeholder="587" mono />
            <Field label="SMTP User" placeholder="your@email.com" />
            <Field label="SMTP Password" type="password" placeholder="••••••••" />
            <div className="col-span-2">
              <Field label="Admin Recipient Email" placeholder="admin@shopyle.com" defaultVal="admin@shopyle.com" />
            </div>
          </div>
        </div>

        {/* Webhook */}
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key size={14} className="text-[#00ff88]" />
            <span className="text-sm font-bold text-white">Webhook Security</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-[10px] text-[#444] font-bold uppercase tracking-widest block mb-1.5">Injection Endpoint</label>
              <div className="flex items-center gap-2 py-2.5 px-3 bg-[#0a0a0a] border border-white/[0.05] rounded-lg">
                <span className="text-xs text-[#00ff88] font-mono font-bold">POST</span>
                <span className="text-xs text-[#555] font-mono">/api/intelligence/inject</span>
              </div>
            </div>
            <Field label="Webhook Secret Token (optional)" placeholder="Generate a shared secret for HMAC verification" type="password" mono />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 py-3 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/25 rounded-xl text-[#00ff88] font-bold text-sm transition-all disabled:opacity-50 w-full"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? 'Saving…' : saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
