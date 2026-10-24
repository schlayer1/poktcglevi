import React, { useEffect, useState } from 'react';
import { soundManager } from '../services/soundManager';

export interface PikachuCoinProps {
  isFlipping?: boolean;
  result?: 'heads' | 'tails';
  onFlipEnd?: (result: 'heads' | 'tails') => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showLabel?: boolean;
}

export const PikachuCoin: React.FC<PikachuCoinProps> = ({
  isFlipping = false,
  result = 'heads',
  onFlipEnd,
  size = 'md',
  interactive = true,
  showLabel = true
}) => {
  const [internalFlipping, setInternalFlipping] = useState<boolean>(isFlipping);
  const [currentResult, setCurrentResult] = useState<'heads' | 'tails'>(result);
  const [rotationAngle, setRotationAngle] = useState<number>(result === 'heads' ? 0 : 180);

  const sizeClasses = {
    sm: 'w-16 h-16 sm:w-20 sm:h-20',
    md: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32',
    lg: 'w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48'
  }[size];

  // Trigger flip externally or internally
  const triggerFlip = (forcedResult?: 'heads' | 'tails') => {
    if (internalFlipping) return;

    soundManager.playSfx('coin_flip');
    setInternalFlipping(true);

    const outcome = forcedResult || (Math.random() > 0.5 ? 'heads' : 'tails');
    setCurrentResult(outcome);

    // 5 full spins (1800deg) + 0 for heads, 180 for tails
    const spins = 1800;
    const finalDeg = outcome === 'heads' ? spins * 2 : spins * 2 + 180;
    setRotationAngle((prev) => prev + finalDeg);

    setTimeout(() => {
      setInternalFlipping(false);
      soundManager.playSfx('attack_hit');
      if (onFlipEnd) onFlipEnd(outcome);
    }, 1200);
  };

  useEffect(() => {
    if (isFlipping) {
      triggerFlip(result);
    }
  }, [isFlipping, result]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 select-none">
      {/* 3D Coin Stage */}
      <div
        className={`relative ${sizeClasses} cursor-pointer group`}
        style={{ perspective: '1200px' }}
        onClick={() => {
          if (interactive && !internalFlipping) triggerFlip();
        }}
        title={interactive ? 'Tippe, um die Münze zu werfen!' : undefined}
      >
        {/* Dynamic Shadow underneath */}
        <div
          className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-full bg-black/60 blur-md transition-all duration-300 pointer-events-none ${
            internalFlipping ? 'scale-50 opacity-20' : 'scale-100 opacity-80'
          }`}
        />

        {/* 3D Tumbling Coin Body */}
        <div
          className="relative w-full h-full transition-transform ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotationAngle}deg) ${internalFlipping ? 'translateY(-60px)' : 'translateY(0px)'}`,
            transitionDuration: internalFlipping ? '1.2s' : '0.4s'
          }}
        >
          {/* ========================================================================= */}
          {/* VORDERSEITE: KOPF (PIKACHU RELIEF)                                       */}
          {/* ========================================================================= */}
          <div
            className="absolute inset-0 rounded-full border-4 border-amber-200/90 shadow-[0_0_25px_rgba(251,191,36,0.85)] flex items-center justify-center overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              background: 'radial-gradient(circle at 35% 30%, #fef08a 0%, #f59e0b 50%, #d97706 80%, #78350f 100%)'
            }}
          >
            {/* Milled Grooved Coin Rim */}
            <div className="absolute inset-1 rounded-full border-2 border-dashed border-amber-900/60 pointer-events-none" />
            <div className="absolute inset-2.5 rounded-full border border-amber-300/80 pointer-events-none" />

            {/* Embossed Pikachu Vector Art */}
            <svg
              viewBox="0 0 100 100"
              className="w-4/5 h-4/5 drop-shadow-[1px_2px_2px_rgba(120,53,15,0.9)]"
            >
              {/* Pikachu Ears */}
              <polygon points="25,40 10,12 35,28" fill="#ca8a04" stroke="#78350f" strokeWidth="2" />
              <polygon points="10,12 18,18 12,25" fill="#451a03" />

              <polygon points="75,40 90,12 65,28" fill="#ca8a04" stroke="#78350f" strokeWidth="2" />
              <polygon points="90,12 82,18 88,25" fill="#451a03" />

              {/* Head Base */}
              <ellipse cx="50" cy="55" rx="32" ry="28" fill="#eab308" stroke="#78350f" strokeWidth="2.5" />

              {/* Rosy Cheeks */}
              <circle cx="28" cy="62" r="7" fill="#dc2626" opacity="0.9" />
              <circle cx="72" cy="62" r="7" fill="#dc2626" opacity="0.9" />

              {/* Eyes with Highlights */}
              <ellipse cx="36" cy="48" rx="4.5" ry="5.5" fill="#292524" />
              <circle cx="37.5" cy="46" r="1.8" fill="#ffffff" />

              <ellipse cx="64" cy="48" rx="4.5" ry="5.5" fill="#292524" />
              <circle cx="65.5" cy="46" r="1.8" fill="#ffffff" />

              {/* Cute Nose & Mouth */}
              <polygon points="50,54 48,56 52,56" fill="#451a03" />
              <path
                d="M 44 60 Q 50 64 56 60"
                fill="none"
                stroke="#78350f"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Gold League Stars */}
              <path d="M 50 18 L 52 23 L 57 23 L 53 26 L 55 31 L 50 28 L 45 31 L 47 26 L 43 23 L 48 23 Z" fill="#fef08a" />
            </svg>

            {/* Specular Light Sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/35 to-transparent pointer-events-none" />
          </div>

          {/* ========================================================================= */}
          {/* RÜCKSEITE: ZAHL (POKÉBALL RELIEF)                                        */}
          {/* ========================================================================= */}
          <div
            className="absolute inset-0 rounded-full border-4 border-amber-200/90 shadow-[0_0_25px_rgba(251,191,36,0.85)] flex items-center justify-center overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateX(180deg)',
              background: 'radial-gradient(circle at 35% 30%, #fef08a 0%, #f59e0b 50%, #d97706 80%, #78350f 100%)'
            }}
          >
            {/* Milled Grooved Coin Rim */}
            <div className="absolute inset-1 rounded-full border-2 border-dashed border-amber-900/60 pointer-events-none" />
            <div className="absolute inset-2.5 rounded-full border border-amber-300/80 pointer-events-none" />

            {/* Embossed Pokéball Vector Art */}
            <svg
              viewBox="0 0 100 100"
              className="w-4/5 h-4/5 drop-shadow-[1px_2px_2px_rgba(120,53,15,0.9)]"
            >
              {/* Outer Pokéball Sphere */}
              <circle cx="50" cy="50" r="32" fill="#ca8a04" stroke="#78350f" strokeWidth="2.5" />

              {/* Upper Gold Dome */}
              <path
                d="M 19 48 A 32 32 0 0 1 81 48 Z"
                fill="#eab308"
                stroke="#78350f"
                strokeWidth="2"
              />

              {/* Center Dividing Band */}
              <line x1="18" y1="50" x2="82" y2="50" stroke="#451a03" strokeWidth="5" />

              {/* Center Ring & Button */}
              <circle cx="50" cy="50" r="11" fill="#78350f" />
              <circle cx="50" cy="50" r="7.5" fill="#fef08a" stroke="#451a03" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="3.5" fill="#ffffff" />

              {/* Corner Star Emblems */}
              <path d="M 22 22 L 23 25 L 26 25 L 24 27 L 25 30 L 22 28 L 19 30 L 20 27 L 18 25 L 21 25 Z" fill="#fef08a" />
              <path d="M 78 22 L 79 25 L 82 25 L 80 27 L 81 30 L 78 28 L 75 30 L 76 27 L 74 25 L 77 25 Z" fill="#fef08a" />
            </svg>

            {/* Specular Light Sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/35 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Label under Coin */}
      {showLabel && (
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-widest bg-slate-900/90 px-3.5 py-1 rounded-full border border-amber-400/60 shadow-lg">
            {internalFlipping
              ? 'Wirbeln... ⚡'
              : currentResult === 'heads'
              ? 'KOPF (Pikachu) ⭐'
              : 'ZAHL (Pokéball) ⚪'}
          </span>
          {interactive && !internalFlipping && (
            <span className="text-[10px] text-slate-400 font-bold">
              Tippe auf die Münze zum Werfen
            </span>
          )}
        </div>
      )}
    </div>
  );
};
