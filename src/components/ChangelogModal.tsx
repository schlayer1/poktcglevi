import React from 'react';
import { X, Sparkles, History, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CHANGELOG_DATA, APP_BUILD_TAG } from '../data/changelog';

interface ChangelogModalProps {
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ onClose }) => {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-2xl w-full max-h-[88vh] bg-slate-900 border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-white overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full flex items-center justify-center border border-slate-600 transition-transform active:scale-90"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/60 flex items-center justify-center shrink-0">
            <History className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">Versionsverlauf & Updates</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase">
                Live
              </span>
            </div>
            <p className="text-xs font-mono text-amber-300/80">{APP_BUILD_TAG}</p>
          </div>
        </div>

        {/* Scrollable Changelog List */}
        <div className="flex-1 overflow-y-auto pr-1.5 space-y-4">
          {CHANGELOG_DATA.map((entry, idx) => (
            <div
              key={entry.version}
              className={`p-4 rounded-2xl border transition-all ${
                idx === 0
                  ? 'bg-slate-850 border-amber-400/60 shadow-lg shadow-amber-400/5'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-amber-400">
                    Version {entry.version}
                  </span>
                  {entry.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                      {entry.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-400">{entry.date}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-200 mb-3">{entry.title}</h3>

              <div className="space-y-2">
                {entry.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="text-base shrink-0 leading-none pt-0.5">{feat.icon}</span>
                    <div>
                      <span className="font-extrabold text-white block">{feat.title}</span>
                      <span className="text-slate-400 leading-relaxed">{feat.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-bold">
          <span>Optimiert für Levi • Amazon Fire HD 11</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition-transform active:scale-95"
          >
            Fertig
          </button>
        </div>
      </div>
    </div>
  );
};
