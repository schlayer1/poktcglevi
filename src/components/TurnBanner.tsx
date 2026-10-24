import React from 'react';
import { Sparkles, Swords } from 'lucide-react';

interface TurnBannerProps {
  banner: 'player' | 'opponent' | null;
  playerName?: string;
  opponentName?: string;
}

export const TurnBanner: React.FC<TurnBannerProps> = ({
  banner,
  playerName = 'Levi',
  opponentName = 'Gegner'
}) => {
  if (!banner) return null;

  const isPlayer = banner === 'player';

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center select-none overflow-hidden">
      {/* Background Energy Horizon Ray */}
      <div
        className={`absolute w-[140%] h-24 sm:h-32 -rotate-1 blur-xl opacity-80 transition-all duration-700 animate-pulse ${
          isPlayer
            ? 'bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent'
            : 'bg-gradient-to-r from-transparent via-rose-600/60 to-transparent'
        }`}
      />

      {/* Main Sliding Banner Plaque */}
      <div
        className={`relative w-full max-w-xl sm:max-w-2xl py-4 sm:py-5 px-8 flex items-center justify-between border-y-4 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-md animate-in slide-in-from-left fade-in duration-300 ${
          isPlayer
            ? 'bg-gradient-to-r from-emerald-950/95 via-slate-950/95 to-teal-950/95 border-emerald-400'
            : 'bg-gradient-to-r from-rose-950/95 via-slate-950/95 to-indigo-950/95 border-rose-500'
        }`}
      >
        {/* Top Gloss Highlight Line */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

        {/* Left Side: Animated Emblem */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 shadow-xl ${
              isPlayer
                ? 'bg-gradient-to-br from-emerald-400 to-teal-600 border-white text-slate-950'
                : 'bg-gradient-to-br from-rose-500 to-red-700 border-white text-white'
            }`}
          >
            {isPlayer ? (
              <Sparkles className="w-7 h-7 sm:w-9 sm:h-9 animate-spin" />
            ) : (
              <Swords className="w-7 h-7 sm:w-9 sm:h-9" />
            )}
          </div>

          <div>
            <span
              className={`text-[10px] sm:text-xs font-black uppercase tracking-widest block ${
                isPlayer ? 'text-emerald-300' : 'text-rose-300'
              }`}
            >
              {isPlayer ? `${playerName} ist am Zug` : `${opponentName} ist am Zug`}
            </span>
            <h2
              className={`text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] text-transparent bg-clip-text ${
                isPlayer
                  ? 'bg-gradient-to-r from-emerald-300 via-yellow-200 to-white'
                  : 'bg-gradient-to-r from-rose-400 via-amber-200 to-white'
              }`}
            >
              {isPlayer ? 'DEIN ZUG!' : 'GEGNER ZUG!'}
            </h2>
          </div>
        </div>

        {/* Right Side: Quick Action Prompt */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs sm:text-sm font-black text-white/90">
            {isPlayer ? 'Energie legen & angreifen! ⭐' : 'Verteidigung vorbereiten... 🛡️'}
          </span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Pokémon TCG Pocket
          </span>
        </div>
      </div>
    </div>
  );
};
