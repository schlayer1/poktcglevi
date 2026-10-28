import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, CheckCircle2, Gift, X, PackageOpen, ArrowRight } from 'lucide-react';
import { storageService, ResearchQuest } from '../services/storageService';
import { soundManager } from '../services/soundManager';

interface ResearchQuestsModalProps {
  onClose: () => void;
  onOpenBoosters?: () => void;
}

export const ResearchQuestsModal: React.FC<ResearchQuestsModalProps> = ({
  onClose,
  onOpenBoosters
}) => {
  const [profile, setProfile] = useState(() => storageService.loadProfile([]));
  const quests = profile.quests || [];

  useEffect(() => {
    soundManager.playSfx('ok');
    soundManager.playVoice(
      'quest_eich_welcome',
      'Hallo Levi! Hier im Pokémon-Labor erforschen wir gemeinsam neue Karten! Hilf mir bei meinen Forschungs-Aufgaben!'
    );
  }, []);

  const handleClaim = (questId: string) => {
    const success = storageService.claimQuestReward(questId);
    if (success) {
      soundManager.playSfx('star_rare');
      soundManager.playVoice(
        'quest_complete',
        'Großartig geforscht, Levi! Du hast die Forschungs-Aufgabe gemeistert! Hier ist dein neuer Belohnungs-Booster!'
      );

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']
      });

      // Reload fresh profile
      setProfile({ ...storageService.loadProfile([]) });
    }
  };

  const claimableCount = quests.filter((q) => !q.isClaimed && q.progress >= q.target).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-safe select-none overflow-y-auto font-sans">
      {/* 1. Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity cursor-pointer"
      />

      {/* 2. Modal Card */}
      <div className="relative z-50 max-w-xl w-full max-h-[92dvh] bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 border-3 border-emerald-400/80 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(16,185,129,0.35)] flex flex-col justify-between my-auto overflow-y-auto animate-in zoom-in-95 duration-200 text-white gap-4">
        
        {/* Header with Professor Eich Avatar */}
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-950 border-2 border-emerald-400 p-1 flex items-center justify-center shadow-lg shrink-0">
              <img
                src="/images/trainers/eich.png"
                alt="Professor Eich"
                className="w-full h-full object-contain filter drop-shadow"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border border-white flex items-center justify-center text-[10px]">
                🔬
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Pokémon-Forschungslabor
                </span>
                {claimableCount > 0 && (
                  <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full animate-pulse">
                    {claimableCount} Belohnung!
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white">
                Professor Eichs Aufgaben
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-300">
                Erfülle Aufgaben im Duell & verdiene neue Booster-Packs!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quest List */}
        <div className="flex flex-col gap-3 my-1">
          {quests.map((quest) => {
            const isCompleted = quest.progress >= quest.target;
            const progressPercent = Math.min(100, Math.round((quest.progress / quest.target) * 100));

            return (
              <div
                key={quest.id}
                className={`relative rounded-2xl border-2 p-3 sm:p-4 transition-all flex flex-col gap-2.5 overflow-hidden ${
                  quest.isClaimed
                    ? 'bg-slate-950/60 border-slate-800 opacity-60'
                    : isCompleted
                    ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-amber-950/50 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)]'
                    : 'bg-slate-950/80 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl sm:text-2xl shrink-0 shadow-inner">
                      {quest.icon}
                    </div>
                    <div>
                      <h3 className="font-black text-sm sm:text-base text-white">
                        {quest.title}
                      </h3>
                      <p className="text-xs text-slate-300 font-medium leading-snug">
                        {quest.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black text-amber-300 block">
                      {quest.progress} / {quest.target}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">
                      {isCompleted ? (quest.isClaimed ? 'Eingelöst' : 'Bereit!') : 'Fortschritt'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted
                        ? 'bg-gradient-to-r from-emerald-400 to-amber-400'
                        : 'bg-gradient-to-r from-sky-400 to-emerald-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Claim Reward Button */}
                {isCompleted && !quest.isClaimed && (
                  <button
                    onClick={() => handleClaim(quest.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_15px_rgba(251,191,36,0.6)] flex items-center justify-center gap-2 transition-transform active:scale-95 animate-bounce cursor-pointer border border-white"
                  >
                    <Gift className="w-4 h-4" />
                    <span>BELOHNUNG ABHOLEN! (+1 BOOSTER-PACK) 🎁</span>
                  </button>
                )}

                {quest.isClaimed && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 justify-end pt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Erledigt & Belohnung erhalten</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer info & Booster shortcut */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span>🎁</span>
            <span>Jede gelöste Aufgabe schenkt dir ein neues Booster-Pack!</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {profile.unopenedBoosters > 0 && onOpenBoosters && (
              <button
                onClick={() => {
                  onClose();
                  onOpenBoosters();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow transition-transform active:scale-95 cursor-pointer"
              >
                <PackageOpen className="w-4 h-4" />
                <span>Packs öffnen ({profile.unopenedBoosters})</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
