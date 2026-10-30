import React, { useState } from 'react';
import { Card } from '../types/game';
import { QuizMinigameModal } from './QuizMinigameModal';
import { MemoMinigameModal } from './MemoMinigameModal';
import { soundManager } from '../services/soundManager';
import { Sparkles, Trophy, X, Play, Star, BookOpen, Volume2 } from 'lucide-react';

interface TrainingCampModalProps {
  allCards: Card[];
  onClose: () => void;
  onOpenBoosters?: () => void;
}

export const TrainingCampModal: React.FC<TrainingCampModalProps> = ({
  allCards,
  onClose,
  onOpenBoosters
}) => {
  const [activeMinigame, setActiveMinigame] = useState<'quiz' | 'memo' | null>(null);

  React.useEffect(() => {
    soundManager.playSfx('ok');
    soundManager.playVoice(
      'camp_welcome',
      'Willkommen im Pokémon-Trainingscamp! Wähle ein Spiel: Das Ruf-Quiz mit Professor Eich oder das Poké-Memo!'
    );
  }, []);

  if (activeMinigame === 'quiz') {
    return (
      <QuizMinigameModal
        allCards={allCards}
        onClose={() => setActiveMinigame(null)}
        onOpenBoosters={onOpenBoosters}
      />
    );
  }

  if (activeMinigame === 'memo') {
    return (
      <MemoMinigameModal
        allCards={allCards}
        onClose={() => setActiveMinigame(null)}
        onOpenBoosters={onOpenBoosters}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-safe select-none overflow-y-auto font-sans">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/85 backdrop-blur-md cursor-pointer" />

      {/* Main Hub Container */}
      <div className="relative z-50 max-w-xl w-full max-h-[92dvh] bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 border-3 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-[0_0_60px_rgba(251,191,36,0.4)] flex flex-col justify-between my-auto overflow-y-auto text-white gap-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 flex items-center justify-center text-2xl font-black shadow-lg shrink-0">
              🏕️
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Pausenspaß & Gehirntraining
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-white">
                Pokémon Trainingscamp
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minigame Cards Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-1">
          {/* Card 1: Quiz */}
          <div
            onClick={() => {
              soundManager.playSfx('button');
              setActiveMinigame('quiz');
            }}
            className="group relative rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-slate-950/90 via-amber-950/30 to-slate-950/90 p-4 flex flex-col justify-between text-left cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow font-black group-hover:scale-110 transition-transform">
                🎓
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundManager.speakText('Ruf- und Typen-Quiz! Erkenne Pokémon an ihren Rufen und teste dein Typen-Wissen mit Professor Eich!');
                  }}
                  className="p-1 rounded-full bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-slate-700 active:scale-90 shadow"
                  title="Vorlesen"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 uppercase tracking-wider">
                  Audio-Rätsel
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                Ruf- & Typen-Quiz
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-1 leading-snug">
                Erkenne Pokémon an ihren Rufen und teste dein Typen-Wissen mit Professor Eich!
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
              <span className="text-amber-300 font-bold">5 Fragen</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                🎁 +1 Booster
              </span>
            </div>
          </div>

          {/* Card 2: Memo */}
          <div
            onClick={() => {
              soundManager.playSfx('button');
              setActiveMinigame('memo');
            }}
            className="group relative rounded-2xl border-2 border-sky-400/80 bg-gradient-to-b from-slate-950/90 via-sky-950/30 to-slate-950/90 p-4 flex flex-col justify-between text-left cursor-pointer shadow-lg hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-sky-400 text-slate-950 flex items-center justify-center text-2xl shadow font-black group-hover:scale-110 transition-transform">
                🃏
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundManager.speakText('Poké-Memo! Finde passende Pärchen deiner eigenen Pokémon-Karten und trainiere dein Gedächtnis!');
                  }}
                  className="p-1 rounded-full bg-slate-800 hover:bg-sky-400 hover:text-slate-950 text-sky-300 border border-slate-700 active:scale-90 shadow"
                  title="Vorlesen"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-400/20 border border-sky-400/40 text-sky-300 uppercase tracking-wider">
                  Suchspiel
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-white group-hover:text-sky-300 transition-colors">
                Poké-Memo
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-1 leading-snug">
                Finde 6 passende Karten-Pärchen aus deiner eigenen Pokémon-Sammlung!
              </p>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-xs">
              <span className="text-sky-300 font-bold">12 Karten</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                🎁 +1 Booster
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>✨</span>
            <span>Verdiene dir zusätzliche Booster-Packs für deine Sammlung!</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 active:scale-95 cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
