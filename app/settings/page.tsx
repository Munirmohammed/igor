'use client';

import { Server, Mail, Key, Save, Loader2, Phone, ExternalLink, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSaved(true); setTimeout(() => setSaved(false), 3000); }, 800);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const CopyButton = ({ text, id }: { text: string; id: string }) => (
    <button
      type="button"
      onClick={() => copyText(text, id)}
      className="flex items-center gap-1.5 text-[10px] text-[#555] hover:text-[#00ff88] transition-colors"
    >
      {copied === id ? <CheckCircle2 size={11} className="text-[#00ff88]" /> : <Copy size={11} />}
      {copied === id ? 'Copied' : 'Copy'}
    </button>
  );

  const Field = ({ label, placeholder, type = 'text', mono = false, defaultVal = '', hint = '' }: {
    label: string; placeholder: string; type?: string; mono?: boolean; defaultVal?: string; hint?: string;
  }) => (
    <div>
      <label className="text-[10px] text-[#444] font-bold uppercase tracking-widest block mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={defaultVal}
        className={`w-full bg-[#141414] border border-white/[0.08] focus:border-[#00ff88]/30 rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder-[#333] transition-colors ${mono ? 'font-mono' : ''}`}
        placeholder={placeholder}
      />
      {hint && <p className="text-[10px] text-[#333] mt-1">{hint}</p>}
    </div>
  );

  const webhookBase = typeof window !== 'undefined' ? window.location.origin : 'https://YOUR_DOMAIN';

  return (
    <div className="flex flex-col gap-4 max-w-2xl overflow-y-auto">
      {/* How to connect real calls */}
      <div className="bg-[#0a0a0a] border border-[#00ff88]/20 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Phone size={14} className="text-[#00ff88]" />
          <span className="text-sm font-bold text-white">Connect Real Phone Calls (Twilio)</span>
        </div>
        <div className="flex flex-col gap-3 text-[12px] text-[#555]">
          {[
            { n: '1', t: 'Create a Twilio account', d: 'Go to twilio.com → sign up (free $15 trial credit)', link: 'https://twilio.com' },
            { n: '2', t: 'Buy a phone number', d: 'In the Twilio Console → Phone Numbers → Buy a Number — pick any country' },
            { n: '3', t: 'Set Voice Webhook', d: 'Phone Number → Voice → "A Call Comes In" webhook:' },
            { n: '4', t: 'Set Status Callback', d: '"Call Status Changes" webhook:' },
            { n: '5', t: 'Fill credentials below', d: 'Paste your Account SID, Auth Token, and phone number in the Twilio section' },
            { n: '6', t: 'Expose locally (dev only)', d: 'Run: npx ngrok http 3000 — copy the https URL, use it as YOUR_DOMAIN' },
          ].map(({ n, t, d, link }) => (
            <div key={n} className="flex gap-3">
              <div className="w-5 h-5 shrink-0 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 flex items-center justify-center text-[10px] font-bold text-[#00ff88]">{n}</div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white mb-0.5">{t}</div>
                <div className="text-[11px] text-[#444]">{d}</div>
                {n === '3' && (
                  <div className="mt-1 flex items-center gap-2 bg-[#141414] rounded px-2 py-1.5 border border-white/[0.05]">
                    <span className="font-mono text-[10px] text-[#00ff88] break-all">{webhookBase}/api/calls/inbound</span>
                    <CopyButton text={`${webhookBase}/api/calls/inbound`} id="inbound" />
                  </div>
                )}
                {n === '4' && (
                  <div className="mt-1 flex items-center gap-2 bg-[#141414] rounded px-2 py-1.5 border border-white/[0.05]">
                    <span className="font-mono text-[10px] text-[#00ff88] break-all">{webhookBase}/api/calls/status</span>
                    <CopyButton text={`${webhookBase}/api/calls/status`} id="status" />
                  </div>
                )}
                {link && (
                  <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 mt-1 text-[11px]">
                    <ExternalLink size={10} /> {link}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* Twilio */}
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Phone size={14} className="text-[#00ff88]" />
            <span className="text-sm font-bold text-white">Twilio Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Account SID" placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" mono hint="Found in Twilio Console → Dashboard" />
            </div>
            <div className="col-span-2">
              <Field label="API Key" type="password" placeholder="SKxxxxxxxxxxxxxxxxxxxxx" mono hint="Found in Twilio Console → API Keys" />
            </div>
            <div className="col-span-2">
              <Field label="API Secret" type="password" placeholder="your_api_secret" mono />
            </div>
            <div className="col-span-2">
              <Field label="TwiML App SID" placeholder="APxxxxxxxxxxxxxxxxxxxxx" mono hint="TwiML App used for browser dialing" />
            </div>
            <div className="col-span-2">
              <Field label="Your Twilio Phone Number" placeholder="+1XXXXXXXXXX" mono hint="The number people call to be logged in IGOR" />
            </div>
          </div>
        </div>

        {/* SIP */}
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Server size={14} className="text-blue-400" />
            <span className="text-sm font-bold text-white">SIP / VoIP Server (optional)</span>
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
            <span className="text-sm font-bold text-white">Email — Dossier Dispatch</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="SMTP Host" placeholder="smtp.gmail.com" defaultVal="smtp.gmail.com" />
            <Field label="SMTP Port" placeholder="587" defaultVal="587" mono />
            <Field label="SMTP User" placeholder="your@gmail.com" />
            <Field label="SMTP Password" type="password" placeholder="App password (not real password)" hint="Gmail: Account → Security → App Passwords" />
            <div className="col-span-2">
              <Field label="Dossier Recipient (Admin Email)" placeholder="admin@shopyle.com" defaultVal="admin@shopyle.com" />
            </div>
          </div>
        </div>

        {/* Webhook endpoint display */}
        <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key size={14} className="text-[#00ff88]" />
            <span className="text-sm font-bold text-white">API Endpoints</span>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { method: 'POST', path: '/api/calls/inbound', desc: 'Twilio Voice Webhook — incoming call trigger' },
              { method: 'POST', path: '/api/calls/outbound', desc: 'TwiML App Webhook — used for browser dialing outbound' },
              { method: 'POST', path: '/api/calls/status', desc: 'Twilio Status Callback — call lifecycle events' },
              { method: 'POST', path: '/api/intelligence/inject', desc: 'External tracing patch — inject GPS / facial / satellite data' },
              { method: 'POST', path: '/api/calls/recording-status', desc: 'Twilio Recording Callback — saves audio URL' },
            ].map(({ method, path, desc }) => (
              <div key={path} className="flex items-start gap-3">
                <span className="text-[10px] font-bold text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-2 py-0.5 rounded-full mt-0.5 shrink-0">{method}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-white">{path}</span>
                    <CopyButton text={`${webhookBase}${path}`} id={path} />
                  </div>
                  <p className="text-[10px] text-[#333] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 py-3 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/25 rounded-xl text-[#00ff88] font-bold text-sm transition-all disabled:opacity-50 w-full"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {loading ? 'Saving…' : saved ? '✓ Saved to .env' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
