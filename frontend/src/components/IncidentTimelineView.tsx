import React from 'react';
import type { TimelineEvent } from '../types';
import { Clock, CheckCircle2, AlertTriangle, ShieldAlert, Cpu, UserCheck, HelpCircle } from 'lucide-react';

interface IncidentTimelineViewProps {
  timeline: TimelineEvent[];
}

export const IncidentTimelineView: React.FC<IncidentTimelineViewProps> = ({ timeline }) => {
  const getIcon = (stage: string) => {
    switch (stage) {
      case 'SENSOR':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'ML_INFERENCE':
        return <Cpu className="w-3.5 h-3.5 text-indigo-400" />;
      case 'NOVELTY':
        return <HelpCircle className="w-3.5 h-3.5 text-purple-400" />;
      case 'CONTRADICTION':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'ESCALATION':
        return <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />;
      case 'HUMAN_ACTION':
        return <UserCheck className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300';
      case 'WARNING':
        return 'border-amber-500/50 bg-amber-950/20 text-amber-300';
      case 'CRITICAL':
        return 'border-rose-500/50 bg-rose-950/20 text-rose-300';
      default:
        return 'border-slate-700 bg-slate-800/40 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
        <Clock className="w-4 h-4 text-cyan-400" />
        <h2 className="text-sm font-bold text-white tracking-wide uppercase m-0">
          Incident Chronological Audit Timeline
        </h2>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {timeline.map((event, idx) => (
          <div key={idx} className="relative flex items-start gap-3">
            {/* Timeline node */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow">
              {getIcon(event.stage)}
            </div>

            <div className={`flex-1 p-3 rounded-lg border text-xs ${getStatusColor(event.status)}`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold tracking-wide text-white">{event.title}</span>
                <span className="font-mono text-[11px] text-slate-400">{event.timestamp}</span>
              </div>
              <p className="m-0 text-slate-300/90 leading-relaxed font-sans">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
