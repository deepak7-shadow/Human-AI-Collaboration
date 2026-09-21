import React from 'react';
import type { IncidentDetail } from '../types';
import { AlertOctagon, HelpCircle, ChevronDown, ChevronUp, Bot, BrainCircuit } from 'lucide-react';

interface IncidentReasoningPanelProps {
  incident: IncidentDetail | null;
  onOpenReview: () => void;
}

export const IncidentReasoningPanel: React.FC<IncidentReasoningPanelProps> = ({
  incident,
  onOpenReview,
}) => {
  const [showExplanationDetails, setShowExplanationDetails] = React.useState(true);

  if (!incident) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <Bot className="w-10 h-10 mx-auto text-slate-600 mb-2 animate-bounce" />
        <p className="text-sm">Select an operating scenario above to view AI diagnostic reasoning.</p>
      </div>
    );
  }

  const isUnknown = incident.status === 'UNKNOWN_FAILURE_PATTERN';

  return (
    <div className={`bg-slate-900/90 border rounded-xl p-6 shadow-2xl backdrop-blur-md transition-all ${
      isUnknown ? 'border-purple-500/60 ring-1 ring-purple-500/40 shadow-purple-950/40' : 'border-slate-800'
    }`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isUnknown ? 'bg-purple-600/20 text-purple-400 border border-purple-500/50' : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/50'
          }`}>
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-400">{incident.id}</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">{incident.timestamp}</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-wide m-0">
              AI Diagnostic Assessment & Knowledge Boundary
            </h2>
          </div>
        </div>

        {/* Action Button */}
        {incident.human_verification_required && !incident.decision && (
          <button
            onClick={onOpenReview}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4" />
            Human Verification Required
          </button>
        )}
      </div>

      {/* Hero Refusal Banner for Unknown Cases */}
      {isUnknown && (
        <div className="mb-6 p-4 rounded-xl bg-purple-950/40 border border-purple-500/60 glow-unknown">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-lg bg-purple-600/30 text-purple-300 shrink-0">
              <HelpCircle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-extrabold uppercase tracking-wider bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded border border-purple-500/50">
                  REFUSAL POLICY ENFORCED
                </span>
                <span className="text-xs text-purple-400/80 font-mono">Uncertainty Engine Safe-Stop</span>
              </div>
              <p className="text-sm font-bold text-white mb-1.5">
                "I do not have sufficient evidence to confidently identify this failure."
              </p>
              <p className="text-xs text-purple-200/80 leading-relaxed m-0">
                The observed multi-sensor dynamics (chaotic vibration spike + nominal casing temperature + oscillating motor current) do not match any known failure class in the training manifold. Rather than guessing, UNKNOWN-X flags this as an <strong>Unfamiliar Anomaly</strong> and escalates to a human domain expert.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Uncertainty & Probabilities Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {/* Metric 1: Trust State */}
        <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Final Trust Level</span>
          <span className={`text-sm font-black tracking-wide ${
            incident.trust_level === 'HIGH_TRUST' ? 'text-emerald-400' :
            incident.trust_level === 'MEDIUM_TRUST' ? 'text-amber-400' :
            incident.trust_level === 'LOW_TRUST' ? 'text-orange-400' : 'text-purple-400'
          }`}>
            {incident.trust_level.replace('_', ' ')}
          </span>
          <div className="w-full bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${
                incident.trust_level === 'HIGH_TRUST' ? 'bg-emerald-400 w-full' :
                incident.trust_level === 'MEDIUM_TRUST' ? 'bg-amber-400 w-2/3' :
                incident.trust_level === 'LOW_TRUST' ? 'bg-orange-400 w-1/3' : 'bg-purple-400 w-1/6 animate-pulse'
              }`}
            />
          </div>
        </div>

        {/* Metric 2: Unknown Probability */}
        <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">P(Unknown Failure)</span>
          <span className={`text-base font-mono font-bold ${incident.unknown_probability > 0.5 ? 'text-purple-400 font-extrabold' : 'text-slate-200'}`}>
            {(incident.unknown_probability * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Novelty & Entropy</span>
        </div>

        {/* Metric 3: Known Probability */}
        <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">P(Known Domain)</span>
          <span className={`text-base font-mono font-bold ${incident.known_probability > 0.6 ? 'text-emerald-400' : 'text-slate-400'}`}>
            {(incident.known_probability * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Nearest Class Match</span>
        </div>

        {/* Metric 4: Novelty Score */}
        <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Novelty Score (OOD)</span>
          <span className={`text-base font-mono font-bold ${incident.novelty_score > 0.5 ? 'text-purple-400' : 'text-slate-200'}`}>
            {incident.novelty_score.toFixed(2)} / 1.00
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Centroid Separation</span>
        </div>

        {/* Metric 5: Calibrated Confidence */}
        <div className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-lg">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Model Confidence</span>
          <span className={`text-base font-mono font-bold ${incident.confidence_score > 0.7 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {(incident.confidence_score * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Risk Adjusted</span>
        </div>
      </div>

      {/* 8-Question Explainability Breakdown */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
        <button
          onClick={() => setShowExplanationDetails(!showExplanationDetails)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/60 hover:bg-slate-800 text-left text-xs font-bold text-slate-200 tracking-wide uppercase transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            AI Decision Transparency & Reasoning (8-Point Assessment)
          </span>
          {showExplanationDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showExplanationDetails && incident.explanation && (
          <div className="p-4 space-y-3.5 text-xs text-slate-300">
            <div>
              <strong className="text-cyan-400 font-semibold uppercase tracking-wider block mb-1">1. What happened?</strong>
              <p className="m-0 text-slate-300 leading-relaxed">{incident.explanation.what_happened}</p>
            </div>

            <div>
              <strong className="text-cyan-400 font-semibold uppercase tracking-wider block mb-1">2. What does the AI think?</strong>
              <p className="m-0 text-slate-300 leading-relaxed font-mono bg-slate-900/60 p-2 rounded border border-slate-800">
                {incident.explanation.ai_hypothesis}
              </p>
            </div>

            <div>
              <strong className="text-cyan-400 font-semibold uppercase tracking-wider block mb-1">3. Why does it think this?</strong>
              <p className="m-0 text-slate-300 leading-relaxed">{incident.explanation.why_ai_thinks_this}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <strong className="text-purple-400 font-semibold uppercase tracking-wider block mb-1">6. How familiar is this pattern?</strong>
                <p className="m-0 text-slate-300 leading-relaxed">{incident.explanation.pattern_familiarity}</p>
              </div>
              <div>
                <strong className="text-rose-400 font-semibold uppercase tracking-wider block mb-1">7. What does the AI NOT know?</strong>
                <p className="m-0 text-slate-300 leading-relaxed">{incident.explanation.what_ai_does_not_know}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60">
              <strong className="text-emerald-400 font-semibold uppercase tracking-wider block mb-1">8. Recommended Human Action:</strong>
              <p className="m-0 text-slate-200 font-medium leading-relaxed bg-emerald-950/20 p-2.5 rounded border border-emerald-500/30">
                {incident.explanation.recommended_action}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
