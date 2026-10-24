import React from 'react';
import { StatusCondition } from '../types/game';
import { soundManager } from '../services/soundManager';
import { Moon, Zap, Skull } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusCondition;
  pokemonName: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  pokemonName,
  className = ''
}) => {
  if (!status || status === 'none') return null;

  const handleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playSfx('toast');

    if (status === 'asleep') {
      soundManager.speakText(`${pokemonName} schläft friedlich und kann sich kurz ausruhen!`);
    } else if (status === 'poisoned') {
      soundManager.speakText(`${pokemonName} ist vergiftet und verliert jede Runde 10 Kraftpunkte!`);
    } else if (status === 'paralyzed') {
      soundManager.speakText(`${pokemonName} ist paralysiert und kann diese Runde nicht angreifen!`);
    }
  };

  return (
    <div
      onClick={handleTap}
      className={`relative cursor-pointer transition-transform hover:scale-110 active:scale-95 group select-none z-30 ${className}`}
      title="Tippen zum Vorlesen"
    >
      {/* ========================================================================= */}
      {/* 1. SCHLAF (TRAUMBLASE MIT ZZZ)                                            */}
      {/* ========================================================================= */}
      {status === 'asleep' && (
        <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-sky-950/90 via-indigo-900/90 to-blue-950/90 border-2 border-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.85)] animate-pulse">
          {/* Pulsing Dream Bubble */}
          <div className="w-5 h-5 rounded-full bg-sky-400 flex items-center justify-center text-slate-950 shadow-md">
            <Moon className="w-3.5 h-3.5 fill-slate-950" />
          </div>

          <span className="text-xs font-black text-sky-200 tracking-wider">
            SCHLAF 💤
          </span>

          {/* Floating Zzz particles */}
          <span className="absolute -top-3.5 right-1 text-xs font-black text-sky-300 animate-bounce">
            Zzz
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. GIFT (BLUBBERNDER VIOLETTER TROPFEN)                                   */}
      {/* ========================================================================= */}
      {status === 'poisoned' && (
        <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-950/90 via-fuchsia-950/90 to-purple-900/90 border-2 border-purple-400 shadow-[0_0_20px_rgba(192,38,211,0.85)] animate-pulse">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white shadow-md">
            <Skull className="w-3.5 h-3.5 fill-white/80" />
          </div>

          <span className="text-xs font-black text-purple-200 tracking-wider">
            GIFT ☠️
          </span>

          {/* Floating poison drip badge */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-fuchsia-400 border border-white animate-ping" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PARALYSE (KNISTERNDER BLITZ)                                          */}
      {/* ========================================================================= */}
      {status === 'paralyzed' && (
        <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-950/90 via-yellow-950/90 to-orange-950/90 border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.85)] animate-bounce">
          <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-slate-950 shadow-md">
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
          </div>

          <span className="text-xs font-black text-yellow-200 tracking-wider">
            PARALYSE ⚡
          </span>
        </div>
      )}
    </div>
  );
};
