import React, { useEffect, useState } from 'react';
import { soundManager } from '../services/soundManager';

interface VsIntroProps {
  p1Name: string;
  p1Avatar: string;
  p2Name: string;
  p2Avatar: string;
  onFinish: () => void;
}

export const VsIntro: React.FC<VsIntroProps> = ({
  p1Name,
  p1Avatar,
  p2Name,
  p2Avatar,
  onFinish
}) => {
  const [coinResult, setCoinResult] = useState<'p1' | 'p2'>('p1');
  const [flipped, setFlipped] = useState<boolean>(false);

  useEffect(() => {
    soundManager.playSfx('coin_flip');

    // Simulate coin toss
    const timer1 = setTimeout(() => {
      setFlipped(true);
      soundManager.playSfx('button');
      soundManager.speakText(`Münzwurf! ${p1Name} darf als Erster ziehen!`);
    }, 1200);

    const timer2 = setTimeout(() => {
      onFinish();
    }, 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [p1Name, onFinish]);

  return (
    <div
      onClick={onFinish}
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-8 select-none cursor-pointer overflow-hidden"
    >
      {/* Background Stadium Grid & Lasers */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-950/60 via-slate-950 to-blue-950/60 pointer-events-none" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Banner (Opponent) */}
      <div className="relative z-10 w-full flex items-center justify-end animate-[slideDown_0.6s_ease-out]">
        <div className="flex items-center gap-4 bg-gradient-to-l from-blue-900/90 via-indigo-950/90 to-transparent p-4 pr-8 rounded-l-3xl border-r-4 border-sky-400 shadow-2xl">
          <div className="text-right">
            <span className="text-xs font-bold text-sky-300 uppercase tracking-widest block">
              Herausforderer
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white drop-shadow">
              {p2Name}
            </h2>
          </div>
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-sky-400 bg-slate-950 p-2 shadow-[0_0_25px_rgba(56,189,248,0.7)] flex items-center justify-center">
            <img
              src={`/images/trainers/${p2Avatar}.png`}
              alt={p2Name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Center: HUGE "VS" Lightning Emblem & Coin Toss */}
      <div className="relative z-20 flex flex-col items-center justify-center gap-3">
        {/* Lightning "VS" Logo */}
        <div className="relative">
          <div className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-amber-400 via-yellow-300 to-white drop-shadow-[0_0_35px_rgba(251,191,36,0.9)] animate-pulse">
            VS
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-1 bg-amber-300/80 blur-sm rotate-45" />
          </div>
        </div>

        {/* 3D Pokéball Coin Flip */}
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white bg-gradient-to-b from-rose-600 via-rose-600 to-white shadow-[0_0_20px_rgba(244,63,94,0.8)] flex items-center justify-center ${
              !flipped ? 'animate-spin' : 'scale-110 transition-transform'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white border-3 border-slate-900" />
          </div>
          <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-widest bg-slate-900/90 px-3 py-1 rounded-full border border-amber-400/50">
            {flipped ? `${p1Name} beginnt! ⭐` : 'Münzwurf...'}
          </span>
        </div>
      </div>

      {/* Bottom Banner (Levi) */}
      <div className="relative z-10 w-full flex items-center justify-start animate-[slideUp_0.6s_ease-out]">
        <div className="flex items-center gap-4 bg-gradient-to-r from-amber-900/90 via-orange-950/90 to-transparent p-4 pl-8 rounded-r-3xl border-l-4 border-amber-400 shadow-2xl">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-amber-400 bg-slate-950 p-2 shadow-[0_0_25px_rgba(251,191,36,0.7)] flex items-center justify-center">
            <img
              src={`/images/trainers/${p1Avatar}.png`}
              alt={p1Name}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block">
              Pokémontrainer
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white drop-shadow">
              {p1Name}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};
