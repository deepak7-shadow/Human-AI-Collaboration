import React from 'react';
import { Sparkles, CheckCircle2, Flame, AlertCircle, BarChart3, HelpCircle } from 'lucide-react';

interface DemoControlsProps {
  activeScenario: string;
  onSelectScenario: (scenario: string) => void;
  isLoading: boolean;
  onOpenFeedback: () => void;
  onOpenReview: () => void;
  humanVerificationRequired: boolean;
}

export const DemoControls: React.FC<DemoControlsProps> = ({
  activeScenario,
  onSelectScenario,
  isLoading,
  onOpenFeedback,
  onOpenReview,
  humanVerificationRequired,
}) => {
  return (
    <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-md">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Section Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase m-0 flex items-center gap-2">
              Interactive Hackathon Demo Controller
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-1.5 py-0.5 rounded border border-indigo-500/40">1-CLICK SCENARIOS</span>
            </h2>
            <p className="text-xs text-slate-400 m-0">
              Trigger real-time telemetry, feature extraction, ML inference, and uncertainty escalation:
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Scenario 1: Normal */}
          <button
            disabled={isLoading}
            onClick={() => onSelectScenario('normal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeScenario === 'normal'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 border border-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            Normal Operation
          </button>

          {/* Scenario 2: Known Bearing Fault */}
          <button
            disabled={isLoading}
            onClick={() => onSelectScenario('bearing_fault')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeScenario === 'bearing_fault'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 border border-amber-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-amber-300" />
            Known Bearing Fault
          </button>

          {/* Scenario 3: Known Motor Overheat */}
          <button
            disabled={isLoading}
            onClick={() => onSelectScenario('motor_overheat')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeScenario === 'motor_overheat'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30 border border-orange-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-300" />
            Known Motor Overheat
          </button>

          {/* Scenario 4: UNKNOWN FAILURE PATTERN - HERO DEMO */}
          <button
            disabled={isLoading}
            onClick={() => onSelectScenario('unknown_failure')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeScenario === 'unknown_failure'
                ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/50 border border-purple-300 ring-2 ring-purple-400/50'
                : 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 text-purple-200 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/50 shadow-md'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-purple-300 animate-spin" style={{ animationDuration: '4s' }} />
            ⚡ UNKNOWN FAILURE PATTERN (HERO DEMO)
          </button>

          {/* Human Review Trigger Button */}
          {humanVerificationRequired && (
            <button
              onClick={onOpenReview}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold rounded-lg border border-rose-400 shadow-lg shadow-rose-600/40 animate-pulse cursor-pointer"
            >
              <AlertCircle className="w-4 h-4" />
              Human Review Required
            </button>
          )}

          {/* Feedback Stats Trigger */}
          <button
            onClick={onOpenFeedback}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-lg border border-slate-700 cursor-pointer ml-auto"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            Feedback & Retraining DB
          </button>
        </div>
      </div>
    </section>
  );
};
