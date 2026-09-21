import React from 'react';
import type { KnowledgeItem } from '../types';
import { BookOpen, FileCheck, Shield } from 'lucide-react';

interface MaintenanceKnowledgeViewProps {
  items: KnowledgeItem[];
}

export const MaintenanceKnowledgeView: React.FC<MaintenanceKnowledgeViewProps> = ({ items }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white tracking-wide uppercase m-0">
            Retrieved Maintenance Knowledge & Standards (RAG)
          </h2>
        </div>
        <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded border border-slate-700 flex items-center gap-1 font-mono">
          <Shield className="w-3 h-3 text-emerald-400" /> Verifiable Plant Sources
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-500 italic">No matching maintenance documents retrieved for this state.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {items.map((doc, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                    {doc.document_code}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    {doc.category}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-200 mb-1 leading-snug">
                  {doc.title}
                </h3>
                <h4 className="text-[11px] font-mono text-cyan-400/90 mb-2">
                  {doc.section}
                </h4>
                <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-5 m-0">
                  {doc.guidance}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <FileCheck className="w-3 h-3 text-emerald-400" /> Grounded Source
                </span>
                <span>Relevance: {Math.round(doc.relevance_score * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
