import React, { useEffect, useState } from 'react';
import { PokemonType } from '../types/game';
import { soundManager } from '../services/soundManager';

export interface AttackAnimationData {
  attackerSide: 'player' | 'opponent';
  type: PokemonType;
  damage: number;
  attackName: string;
  isKo: boolean;
  onComplete: () => void;
}

interface AttackEffectsProps {
  animData: AttackAnimationData | null;
}

export const AttackEffects: React.FC<AttackEffectsProps> = ({ animData }) => {
  const [phase, setPhase] = useState<'projectile' | 'impact' | 'faint' | null>(null);

  useEffect(() => {
    if (!animData) {
      setPhase(null);
      return;
    }

    // 1. Play projectile sound & launch
    if (animData.type === 'Feuer') soundManager.playSfx('fire_attack');
    else if (animData.type === 'Wasser') soundManager.playSfx('water_attack');
    else if (animData.type === 'Elektro') soundManager.playSfx('electric_attack');
    else if (animData.type === 'Pflanze') soundManager.playSfx('grass_attack');
    else soundManager.playSfx('attack_hit');

    setPhase('projectile');

    // 2. Impact after 450ms
    const impactTimer = setTimeout(() => {
      setPhase('impact');
      soundManager.playSfx('attack_hit');

      // 3. Faint sequence if K.O.
      if (animData.isKo) {
        setTimeout(() => {
          setPhase('faint');
          soundManager.playSfx('ko');
          setTimeout(() => {
            animData.onComplete();
          }, 900);
        }, 500);
      } else {
        setTimeout(() => {
          animData.onComplete();
        }, 650);
      }
    }, 450);

    return () => clearTimeout(impactTimer);
  }, [animData]);

  if (!animData || !phase) return null;

  const isPlayerAttacking = animData.attackerSide === 'player';

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center select-none overflow-hidden">
      {/* 1. PROJECTILE FLYING ACROSS STADIUM */}
      {phase === 'projectile' && (
        <div
          className={`absolute transition-all duration-400 ease-out flex items-center justify-center ${
            isPlayerAttacking
              ? 'animate-[flyUp_0.45s_cubic-bezier(0.2,0.8,0.2,1)_forwards]'
              : 'animate-[flyDown_0.45s_cubic-bezier(0.2,0.8,0.2,1)_forwards]'
          }`}
        >
          {animData.type === 'Feuer' && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600 shadow-[0_0_35px_rgba(239,68,68,0.9)] animate-spin" />
          )}
          {animData.type === 'Wasser' && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-600 shadow-[0_0_35px_rgba(14,165,233,0.9)] animate-pulse" />
          )}
          {animData.type === 'Elektro' && (
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-yellow-300 text-5xl font-black drop-shadow-[0_0_20px_#facc15] animate-bounce">
              ⚡
            </div>
          )}
          {animData.type === 'Pflanze' && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-emerald-400 text-5xl drop-shadow-[0_0_20px_#10b981] animate-spin">
              🍃
            </div>
          )}
          {(animData.type === 'Farblos' || !['Feuer', 'Wasser', 'Elektro', 'Pflanze'].includes(animData.type)) && (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white bg-slate-200/80 shadow-[0_0_30px_rgba(255,255,255,0.9)] animate-ping" />
          )}
        </div>
      )}

      {/* 2. IMPACT BURST & BOUNCING DAMAGE NUMBER */}
      {(phase === 'impact' || phase === 'faint') && (
        <div
          className={`absolute flex flex-col items-center justify-center ${
            isPlayerAttacking ? 'top-1/4' : 'bottom-1/4'
          }`}
        >
          {/* Flash Impact Ring */}
          <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full border-4 border-yellow-300 bg-white/20 animate-ping" />

          {/* Huge Bouncing Damage Number */}
          <div className="absolute -top-4 flex items-center gap-1 animate-bounce">
            <span className="text-4xl sm:text-6xl font-black text-rose-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] stroke-white stroke-2">
              -{animData.damage}
            </span>
          </div>

          {/* Attack Name Banner */}
          <div className="absolute top-12 bg-slate-950/90 text-amber-300 px-4 py-1 rounded-full border border-amber-400 shadow-xl font-black text-xs sm:text-sm uppercase tracking-wider">
            {animData.attackName}!
          </div>
        </div>
      )}

      {/* 3. KO FAINTING RED BEAM SEQUENCE */}
      {phase === 'faint' && (
        <div
          className={`absolute flex flex-col items-center justify-center ${
            isPlayerAttacking ? 'top-1/4' : 'bottom-1/4'
          }`}
        >
          {/* Red Capture Light Cone */}
          <div className="w-48 h-48 rounded-full bg-gradient-to-t from-red-600/80 via-red-500/40 to-transparent blur-md animate-pulse" />
          <div className="text-2xl sm:text-3xl font-black text-white bg-rose-600 px-4 py-1.5 rounded-full border-2 border-white shadow-2xl animate-bounce">
            K.O.! ⭐
          </div>
        </div>
      )}
    </div>
  );
};
