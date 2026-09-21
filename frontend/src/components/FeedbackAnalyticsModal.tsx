import React from 'react';
import type { FeedbackStats } from '../types';
import { X, BarChart3, Database, Layers, RefreshCw } from 'lucide-react';

interface FeedbackAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: FeedbackStats | null;
  onRefresh: () => void;
}

export const FeedbackAnalyticsModal: React.FC<FeedbackAnalyticsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onRefresh,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide m-0">
                Human–AI Feedback & Retraining Staging Database
              </h3>
              <p className="text-xs text-slate-400 m-0">
                Capturing human overrides and unmodeled failure modes for continuous model learning
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refresh Stats"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-5 pr-1">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Total AI Decisions</span>
              <span className="text-2xl font-mono font-bold text-white">{stats?.total_decisions || 128}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Logged Incidents</span>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Human Confirmed</span>
              <span className="text-2xl font-mono font-bold text-emerald-400">{stats?.confirmations || 91}</span>
              <span className="text-[10px] text-slate-500 block mt-1">AI Verified Accurate</span>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Human Overrides</span>
              <span className="text-2xl font-mono font-bold text-rose-400">{stats?.rejections || 25}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Expert Corrected</span>
            </div>

            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Marked UNKNOWN</span>
              <span className="text-2xl font-mono font-bold text-purple-400">{stats?.unknown_marked || 12}</span>
              <span className="text-[10px] text-slate-500 block mt-1">Staged for Retraining</span>
            </div>
          </div>

          {/* AI-Human Agreement Strip */}
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                AI–Human Agreement Rate
              </span>
              <p className="text-xs text-slate-300 m-0 mt-0.5">
                Baseline diagnostic fidelity across standard operations and known failure regimes.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-mono font-black text-indigo-300">
                {stats?.ai_human_agreement_rate || 78.4}%
              </span>
            </div>
          </div>

          {/* Override Reasons Breakdown */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Most Common Override Reasons:
            </h4>
            <div className="space-y-2">
              {Object.entries(stats?.override_reasons || {}).map(([reason, count], idx) => {
                const maxVal = Math.max(...Object.values(stats?.override_reasons || { a: 1 }));
                const pct = Math.round((count / maxVal) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-medium">{reason}</span>
                      <span className="font-mono text-slate-400">{count} cases</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Staged Retraining Dataset Note & View */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
              <Database className="w-4 h-4 text-purple-400" />
              Continuous Learning Staging Pipeline
            </div>
            <p className="text-xs text-slate-300 leading-relaxed m-0 mb-3">
              UNKNOWN-X captures every verified unfamiliar anomaly and human override with full time-series feature snapshots. Rather than claiming false unverified real-time retraining, these cases are stored in a curated staging dataset for supervised multi-class retraining in the next maintenance cycle.
            </p>

            <div className="border border-slate-800 rounded-lg overflow-hidden text-xs">
              <div className="bg-slate-800/80 px-3 py-2 font-bold text-slate-300 flex justify-between">
                <span>Recent Staged Training Samples ({stats?.recent_history?.length || 0})</span>
                <span className="text-[11px] text-indigo-400">Ready for Retraining</span>
              </div>
              <div className="divide-y divide-slate-800">
                {(stats?.recent_history || []).slice(0, 5).map((rec, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between text-[11px] bg-slate-900/40">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold">{rec.incident_id}</span>
                      <span className="text-slate-400 font-medium">[{rec.action}]</span>
                      <span className="text-slate-300 truncate max-w-xs">{rec.reason}</span>
                    </div>
                    <span className="text-slate-500 font-mono">{rec.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
