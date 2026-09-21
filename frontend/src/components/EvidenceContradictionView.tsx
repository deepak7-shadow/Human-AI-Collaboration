import React from 'react';
import type { EvidenceItem } from '../types';
import { CheckCircle, AlertTriangle, HelpCircle, Layers } from 'lucide-react';

interface EvidenceContradictionViewProps {
  evidences: EvidenceItem[];
}

export const EvidenceContradictionView: React.FC<EvidenceContradictionViewProps> = ({ evidences }) => {
  const supporting = evidences.filter((e) => e.evidence_type === 'SUPPORTING');
  const contradicting = evidences.filter((e) => e.evidence_type === 'CONTRADICTORY');
  const unknownFactors = evidences.filter((e) => e.evidence_type === 'UNKNOWN_FACTOR');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
        <Layers className="w-4 h-4 text-cyan-400" />
        <h2 className="text-sm font-bold text-white tracking-wide uppercase m-0">
          Cross-Sensor Evidence & Physics Contradiction Analysis
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Supporting Evidence Column */}
        <div className="p-4 rounded-lg bg-slate-950/40 border border-emerald-500/20">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">
            <CheckCircle className="w-4 h-4" />
            Supporting Evidence ({supporting.length})
          </div>
          {supporting.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No significant supporting evidence found for current hypothesis.</p>
          ) : (
            <div className="space-y-2.5">
              {supporting.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded bg-emerald-950/10 border border-emerald-500/20 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <div className="flex-1">
                      <p className="m-0 font-medium text-slate-200">{item.description}</p>
                      {item.observed_value && (
                        <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-slate-400">
                          <span>Observed: <strong className="text-emerald-300">{item.observed_value}</strong></span>
                          {item.expected_value && <span>Expected: <span className="text-slate-500">{item.expected_value}</span></span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contradicting Evidence Column */}
        <div className="p-4 rounded-lg bg-slate-950/40 border border-rose-500/30">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Contradicting Evidence ({contradicting.length})
          </div>
          {contradicting.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No contradictory signals detected. Sensor data is physically consistent.</p>
          ) : (
            <div className="space-y-2.5">
              {contradicting.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded bg-rose-950/20 border border-rose-500/30 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">⚠</span>
                    <div className="flex-1">
                      <p className="m-0 font-medium text-slate-200">{item.description}</p>
                      {item.observed_value && (
                        <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-slate-400">
                          <span>Observed: <strong className="text-rose-300">{item.observed_value}</strong></span>
                          {item.expected_value && <span>Expected: <span className="text-slate-500">{item.expected_value}</span></span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unknown Factors */}
      {unknownFactors.length > 0 && (
        <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-500/40">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">
            <HelpCircle className="w-4 h-4 text-purple-400" />
            Unmodeled Physical Interactions / Novel Dynamics ({unknownFactors.length})
          </div>
          <div className="space-y-1.5">
            {unknownFactors.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-purple-200/90">
                <span className="text-purple-400 font-bold">?</span>
                <p className="m-0">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
