import React, { useState } from 'react';
import type { IncidentDetail } from '../types';
import { X, UserCheck, AlertCircle, CheckCircle, HelpCircle, FileText, Send } from 'lucide-react';

interface HumanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: IncidentDetail;
  onSubmitDecision: (action: string, reason: string, notes: string) => Promise<void>;
  isSubmitting: boolean;
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  isOpen,
  onClose,
  incident,
  onSubmitDecision,
  isSubmitting,
}) => {
  const [selectedAction, setSelectedAction] = useState<string>(
    incident.status === 'UNKNOWN_FAILURE_PATTERN' ? 'MARK_UNKNOWN' : 'CONFIRM'
  );
  const [selectedReason, setSelectedReason] = useState<string>(
    incident.status === 'UNKNOWN_FAILURE_PATTERN' ? 'Unknown failure' : 'Consistent with physical inspection'
  );
  const [notes, setNotes] = useState<string>('');

  if (!isOpen) return null;

  const PREDEFINED_REASONS = [
    'Unknown failure',
    'Recent maintenance',
    'Sensor issue',
    'Environmental condition',
    'Operating condition changed',
    'AI missed contextual information',
    'Consistent with physical inspection',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmitDecision(selectedAction, selectedReason, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide m-0">
                Human-in-the-Loop Verification & Decision Escalation
              </h3>
              <span className="text-xs text-slate-400 font-mono">Incident {incident.id} • {incident.machine_id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* "WHY AM I BEING ASKED?" Callout */}
        <div className="mb-5 p-3.5 rounded-xl bg-slate-950/60 border border-indigo-500/30">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
            <AlertCircle className="w-4 h-4 text-indigo-400" />
            Why Am I Being Asked?
          </div>
          <p className="text-xs text-slate-300 m-0 leading-relaxed">
            {incident.status === 'UNKNOWN_FAILURE_PATTERN'
              ? 'The observed sensor pattern does not sufficiently match known failure modes (Novelty score: ' + incident.novelty_score.toFixed(2) + '). AI refused confident diagnosis and requests human domain expertise.'
              : 'Diagnostic confidence is ' + Math.round(incident.confidence_score * 100) + '%. Human sign-off is required prior to executing work orders.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Action Buttons Grid */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
              Select Human Action:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => { setSelectedAction('CONFIRM'); setSelectedReason('Consistent with physical inspection'); }}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedAction === 'CONFIRM'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Diagnosis
              </button>

              <button
                type="button"
                onClick={() => { setSelectedAction('REJECT'); setSelectedReason('Sensor issue'); }}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedAction === 'REJECT'
                    ? 'bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <X className="w-4 h-4" />
                Reject Diagnosis
              </button>

              <button
                type="button"
                onClick={() => { setSelectedAction('MARK_UNKNOWN'); setSelectedReason('Unknown failure'); }}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedAction === 'MARK_UNKNOWN'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-lg shadow-purple-600/40'
                    : 'bg-purple-950/30 text-purple-300 border-purple-500/40 hover:bg-purple-900/40'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-purple-300" />
                Mark as Unknown
              </button>

              <button
                type="button"
                onClick={() => { setSelectedAction('REQUEST_EVIDENCE'); setSelectedReason('AI missed contextual information'); }}
                className={`p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  selectedAction === 'REQUEST_EVIDENCE'
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                Request Evidence
              </button>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Primary Engineering Reason:
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-indigo-500 cursor-pointer"
            >
              {PREDEFINED_REASONS.map((r) => (
                <option key={r} value={r} className="bg-slate-900">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
              Engineer Rationale & Diagnostic Notes:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Stator casing is cool to touch despite severe vibration. Shaft grounding brush shows intermittent sparking. Suspect VFD resonance or slurry cavitation surging."
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500 resize-none font-mono"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              Operator: <strong className="text-slate-400">ENG-402 (Lead Reliability Eng)</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmitting ? 'Recording...' : 'Commit Human Decision'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
