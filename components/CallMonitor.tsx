'use client';

import React from 'react';
import { Phone, MapPin, Shield, Circle, ExternalLink, MoreVertical } from 'lucide-react';

const CallMonitor = () => {
  const activeCalls = [
    { id: '1', caller: '+1 202 555 0124', location: 'Washington, DC', status: 'live', intel: 'GPS Fixed', type: 'Outbound' },
    { id: '2', caller: '+44 20 7946 0032', location: 'London, UK', status: 'live', intel: 'Tracing...', type: 'Inbound' },
    { id: '3', caller: '+91 98765 43210', location: 'Bengaluru, IN', status: 'completed', intel: 'Dossier Sent', type: 'Outbound' },
    { id: '4', caller: '+386 69 617 351', location: 'Ljubljana, SI', status: 'live', intel: 'Satellite Sync', type: 'Inbound' },
  ];

  const simulateCall = async () => {
    alert('SIMULATION STARTED: \n1. Opening Call Session \n2. Injecting Intelligence \n3. Compiling Dossier \nCheck console for details.');
    
    // 1. START CALL
    const callRes = await fetch('/api/calls', {
      method: 'POST',
      body: JSON.stringify({ callerId: '+1 202 555 0124', recipientId: '+386 69 617 351', ipAddress: '192.168.1.1' }),
    });
    const callData = await callRes.json();
    const callId = callData.id;

    // 2. INJECT INTEL
    await fetch('/api/intelligence/inject', {
      method: 'POST',
      body: JSON.stringify({ 
        callId, 
        gps_coordinates: '46.0569° N, 14.5058° E', 
        facial_match: 'MATCH: MUNIR (98%)', 
        camera_hits: 'CAM-402, CAM-109',
        satellite_intel: 'STABLE UPLINK - HUB LJUBLJANA'
      }),
    });

    // 3. END CALL & TRIGGER DOSSIER
    await fetch('/api/calls', {
      method: 'PATCH',
      body: JSON.stringify({ callId, status: 'completed' }),
    });
  };

  return (
    <div className="glass-card flex-1 min-h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold tracking-tight">Situational Awareness</h2>
        <div className="flex gap-2">
          <button className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-all text-muted font-medium">Clear History</button>
          <button 
            onClick={simulateCall}
            className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all text-emerald-500 font-bold"
          >
            Simulate Full Trace
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-muted text-xs font-semibold uppercase tracking-widest">
              <th className="pb-4 px-4 font-bold">Target / Caller</th>
              <th className="pb-4 px-4 font-bold">Location</th>
              <th className="pb-4 px-4 font-bold">Status</th>
              <th className="pb-4 px-4 font-bold">Intelligence</th>
              <th className="pb-4 px-4 font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {activeCalls.map((call) => (
              <tr key={call.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                <td className="py-5 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white/5 group-hover:scale-110 transition-transform ${call.status === 'live' ? 'text-emerald-500' : 'text-blue-500'}`}>
                      <Phone size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{call.caller}</span>
                      <span className="text-xs text-muted font-medium">{call.type}</span>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-4 font-medium">
                  <div className="flex items-center gap-2 text-muted-foreground group-hover:text-white transition-colors">
                    <MapPin size={14} className="text-blue-500" />
                    <span>{call.location}</span>
                  </div>
                </td>
                <td className="py-5 px-4">
                  <span className={`status-pill ${call.status === 'live' ? 'status-live' : 'status-completed'}`}>
                    {call.status}
                  </span>
                </td>
                <td className="py-5 px-4">
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                    <Shield size={14} />
                    <span>{call.intel}</span>
                  </div>
                </td>
                <td className="py-5 px-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-blue-500/10 rounded-lg text-muted hover:text-blue-500 transition-all">
                      <ExternalLink size={16} />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-lg text-muted transition-all">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallMonitor;
