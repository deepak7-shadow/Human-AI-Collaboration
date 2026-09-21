import React from 'react';
import type { Machine } from '../types';
import { ShieldCheck, AlertTriangle, HelpCircle, Activity, Cpu, Wrench } from 'lucide-react';

interface HeaderProps {
  machines: Machine[];
  selectedMachineId: string;
  onSelectMachine: (id: string) => void;
  status: 'NORMAL' | 'KNOWN_FAULT' | 'UNKNOWN_FAILURE_PATTERN';
  trustLevel: 'HIGH_TRUST' | 'MEDIUM_TRUST' | 'LOW_TRUST' | 'UNKNOWN';
}

export const Header: React.FC<HeaderProps> = ({
  machines,
  selectedMachineId,
  onSelectMachine,
  status,
  trustLevel,
}) => {
  const currentMachine = machines.find((m) => m.id === selectedMachineId) || machines[0];

  const getStatusBadge = () => {
    switch (status) {
      case 'NORMAL':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-full tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            Normal Baseline
          </span>
        );
      case 'KNOWN_FAULT':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-semibold rounded-full tracking-wide uppercase">
            <AlertTriangle className="w-3.5 h-3.5" />
            Known Fault Detected
          </span>
        );
      case 'UNKNOWN_FAILURE_PATTERN':
        return (
          <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-500/20 border border-purple-500/60 text-purple-300 text-xs font-bold rounded-full tracking-wide uppercase glow-unknown">
            <HelpCircle className="w-4 h-4 text-purple-400 animate-pulse" />
            UNKNOWN FAILURE PATTERN
          </span>
        );
    }
  };

  const getTrustBadge = () => {
    switch (trustLevel) {
      case 'HIGH_TRUST':
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded">HIGH TRUST</span>;
      case 'MEDIUM_TRUST':
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded">MEDIUM TRUST</span>;
      case 'LOW_TRUST':
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 rounded">LOW TRUST</span>;
      case 'UNKNOWN':
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-purple-500/30 text-purple-300 border border-purple-500/60 rounded animate-pulse">UNKNOWN TRUST</span>;
    }
  };

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-6 py-4 sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Branding & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-wider m-0">UNKNOWN-X</h1>
              <span className="text-xs bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 px-2 py-0.5 rounded font-mono font-medium">v1.0-PROTOTYPE</span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-tight m-0">
              <span className="text-indigo-400 font-semibold">"Don't just detect failure.</span> Detect when AI doesn't understand the failure."
            </p>
          </div>
        </div>

        {/* Machine Metadata & Status */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-lg">
            <Activity className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedMachineId}
              onChange={(e) => onSelectMachine(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-200 outline-none cursor-pointer"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                  {m.id} — {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {getTrustBadge()}
          </div>
        </div>
      </div>

      {/* Asset Info Strip */}
      {currentMachine && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-4">
            <span><strong className="text-slate-300 font-medium">Type:</strong> {currentMachine.machine_type}</span>
            <span><strong className="text-slate-300 font-medium">Rating:</strong> {currentMachine.rated_power_kw} kW @ {currentMachine.rated_rpm} RPM</span>
            <span><strong className="text-slate-300 font-medium">Bearing:</strong> {currentMachine.bearing_type}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-800/40 px-2.5 py-0.5 rounded border border-slate-800">
            <Wrench className="w-3 h-3 text-cyan-400" />
            <span>Last Service ({currentMachine.last_service_date}): <span className="text-slate-300">{currentMachine.last_service_notes}</span></span>
          </div>
        </div>
      )}
    </header>
  );
};
