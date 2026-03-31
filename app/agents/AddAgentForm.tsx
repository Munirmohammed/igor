'use client';

import { useState } from 'react';
import { UserPlus, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddAgentForm() {
  const [name, setName] = useState('');
  const [extension, setExtension] = useState('');
  const [status, setStatus] = useState('online');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setDone(false);
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, extension, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      setName(''); setExtension('');
      router.refresh();
      setTimeout(() => setDone(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0d0d0d] border border-white/[0.06] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <UserPlus size={15} className="text-[#00ff88]" />
        <span className="text-sm font-bold text-white">Add Agent</span>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-[10px] text-[#444] font-bold uppercase tracking-widest block mb-1.5">Full Name</label>
          <input
            required value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-[#141414] border border-white/[0.08] focus:border-[#00ff88]/30 rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder-[#333] transition-colors"
            placeholder="e.g. Munir Hassan"
          />
        </div>
        <div>
          <label className="text-[10px] text-[#444] font-bold uppercase tracking-widest block mb-1.5">Extension</label>
          <input
            required value={extension} onChange={e => setExtension(e.target.value)}
            className="w-full bg-[#141414] border border-white/[0.08] focus:border-[#00ff88]/30 rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder-[#333] font-mono transition-colors"
            placeholder="e.g. 1001"
          />
        </div>
        <div>
          <label className="text-[10px] text-[#444] font-bold uppercase tracking-widest block mb-1.5">Initial Status</label>
          <select
            value={status} onChange={e => setStatus(e.target.value)}
            className="w-full bg-[#141414] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white outline-none appearance-none"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="busy">Busy</option>
          </select>
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="flex items-center justify-center gap-2 py-2.5 bg-[#00ff88]/10 hover:bg-[#00ff88]/20 border border-[#00ff88]/25 rounded-xl text-[#00ff88] text-sm font-bold transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : done ? <CheckCircle2 size={15} /> : <UserPlus size={15} />}
          {loading ? 'Adding…' : done ? 'Added!' : 'Add Agent'}
        </button>
      </form>
    </div>
  );
}
