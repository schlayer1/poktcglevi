import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, PackageOpen, Sparkles } from 'lucide-react';
import { soundManager } from '../services/soundManager';

interface VictoryModalProps {
  winnerName: string;
  isLeviWinner: boolean;
  onPlayAgain: () => void;
  onOpenBooster?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winnerName,
  isLeviWinner,
  onPlayAgain,
  onOpenBooster
}) => {
  useEffect(() => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    soundManager.playSfx('victory');

    if (isLeviWinner) {
      soundManager.playVoice(
        'win_game',
        `Glückwunsch ${winnerName}! Du hast gewonnen! Du bist ein wahrer Pokémon-Meister!`
      );
    } else {
      soundManager.playVoice(
        'cheer_loss',
        'Schade, fast geschafft! Nächstes Mal gewinnst du bestimmt!'
      );
    }
  }, [winnerName, isLeviWinner]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="relative max-w-md w-full bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border-3 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-5">
        {/* Glowing Trophy Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.8)] border-4 border-white animate-bounce">
            <Trophy className="w-14 h-14 text-slate-950 drop-shadow" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-300 animate-spin" />
        </div>

        {/* Victory Text */}
        <div className="space-y-1">
          <h2 className="text-3xl sm:text-4xl font-black text-amber-300 drop-shadow">
            {isLeviWinner ? 'SIEG!' : 'GUTES MATCH!'}
          </h2>
          <p className="text-xl font-bold text-white">
            {winnerName} gewinnt das Pokémon-Match!
          </p>
        </div>

        {/* 3 PokeBall Stars */}
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((star) => (
            <div
              key={star}
              className="w-12 h-12 rounded-full bg-rose-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-black text-lg"
            >
              ⭐
            </div>
          ))}
        </div>

        {/* Reward & Action Buttons */}
        <div className="w-full flex flex-col gap-3 pt-2">
          {onOpenBooster && (
            <button
              onClick={onOpenBooster}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
              <PackageOpen className="w-6 h-6" />
              <span>Booster-Pack öffnen! 🎁</span>
            </button>
          )}

          <button
            onClick={onPlayAgain}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-base border border-slate-600 shadow flex items-center justify-center gap-2.5 transition-transform active:scale-95"
          >
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <span>Neues Spiel starten</span>
          </button>
        </div>
      </div>
    </div>
  );
};
