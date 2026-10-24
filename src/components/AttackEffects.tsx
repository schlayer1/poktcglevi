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
  speed?: 'cinematic' | 'fast';
}

export const AttackEffects: React.FC<AttackEffectsProps> = ({ animData, speed = 'cinematic' }) => {
  const [phase, setPhase] = useState<'lunge' | 'projectile' | 'impact' | 'faint' | null>(null);

  useEffect(() => {
    if (!animData) {
      setPhase(null);
      return;
    }

    const isFast = speed === 'fast';

    // 1. Whoosh & Launch Projectile
    soundManager.playSfx('attack_whoosh');
    if (animData.type === 'Feuer') soundManager.playSfx('fire_attack');
    else if (animData.type === 'Wasser') soundManager.playSfx('water_attack');
    else if (animData.type === 'Elektro') soundManager.playSfx('electric_attack');
    else if (animData.type === 'Pflanze') soundManager.playSfx('grass_attack');

    setPhase('projectile');

    // In cinematic mode, announce the attack name via TTS
    if (!isFast && animData.attackName) {
      soundManager.speakText(`${animData.attackName}!`);
    }

    // 2. Impact timing
    const projectileDuration = isFast ? 180 : 380;
    const impactTimer = setTimeout(() => {
      setPhase('impact');
      soundManager.playSfx('attack_hit');

      // 3. Faint sequence or completion
      const impactDuration = isFast ? 240 : 480;
      if (animData.isKo) {
        setTimeout(() => {
          setPhase('faint');
          soundManager.playSfx('ko');
          setTimeout(() => {
            animData.onComplete();
          }, isFast ? 400 : 750);
        }, impactDuration);
      } else {
        setTimeout(() => {
          animData.onComplete();
        }, impactDuration);
      }
    }, projectileDuration);

    return () => clearTimeout(impactTimer);
  }, [animData, speed]);

  if (!animData || !phase) return null;

  const isPlayerAttacking = animData.attackerSide === 'player';
  const isFast = speed === 'fast';

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center select-none overflow-hidden">
      {/* ========================================================================= */}
      {/* 1. PROJECTILE FLYING ACROSS STADIUM                                       */}
      {/* ========================================================================= */}
      {phase === 'projectile' && (
        <div
          className={`absolute transition-all ease-out flex items-center justify-center ${
            isFast ? 'duration-180' : 'duration-380'
          } ${
            isPlayerAttacking
              ? 'animate-[flyUp_0.38s_cubic-bezier(0.2,0.8,0.2,1)_forwards]'
              : 'animate-[flyDown_0.38s_cubic-bezier(0.2,0.8,0.2,1)_forwards]'
          }`}
        >
          {/* FEUER: Lodernder Flammenmeteor mit glühendem Schweif */}
          {animData.type === 'Feuer' && (
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600 shadow-[0_0_50px_rgba(239,68,68,1)] animate-spin" />
              <div className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-amber-300/60 animate-ping" />
              <div className="absolute text-4xl sm:text-5xl animate-bounce">🔥</div>
            </div>
          )}

          {/* WASSER: Hydro-Kugel mit Schaumkronen */}
          {animData.type === 'Wasser' && (
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-cyan-200 via-sky-400 to-blue-700 shadow-[0_0_50px_rgba(14,165,233,1)] animate-pulse" />
              <div className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-cyan-200/80 animate-spin" />
              <div className="absolute text-4xl sm:text-5xl">🌊</div>
            </div>
          )}

          {/* ELEKTRO: Zickzack-Plasmablitz */}
          {animData.type === 'Elektro' && (
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-yellow-400/30 blur-md animate-ping" />
              <div className="text-6xl sm:text-7xl font-black text-yellow-300 drop-shadow-[0_0_35px_#facc15] animate-bounce">
                ⚡
              </div>
            </div>
          )}

          {/* PFLANZE: Rasierblatt-Wirbel */}
          {animData.type === 'Pflanze' && (
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-500 to-lime-300 shadow-[0_0_45px_rgba(16,185,129,0.9)] animate-spin" />
              <div className="absolute text-5xl sm:text-6xl">🍃</div>
            </div>
          )}

          {/* PSYCHO: Kosmische Verzerrungs-Sphäre */}
          {animData.type === 'Psycho' && (
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-700 shadow-[0_0_50px_rgba(192,38,211,1)] animate-pulse" />
              <div className="absolute text-4xl sm:text-5xl">🔮</div>
            </div>
          )}

          {/* FARBLOS / KAMPF / ANDERE: Schneller Energie-Projektilstoß */}
          {!['Feuer', 'Wasser', 'Elektro', 'Pflanze', 'Psycho'].includes(animData.type) && (
            <div className="relative flex items-center justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white bg-gradient-to-r from-amber-200 via-orange-400 to-red-500 shadow-[0_0_40px_rgba(255,255,255,0.95)] animate-spin" />
              <div className="absolute text-4xl sm:text-5xl">💥</div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. IMPACT BURST & VISUAL SHOCKWAVE                                       */}
      {/* ========================================================================= */}
      {(phase === 'impact' || phase === 'faint') && (
        <div
          className={`absolute flex flex-col items-center justify-center z-40 ${
            isPlayerAttacking ? 'top-[22%]' : 'bottom-[22%]'
          }`}
        >
          {/* A. TYP-SPEZIFISCHE IMPACT EFFEKTE */}

          {/* FEUER: Gewaltige Flammenexplosion */}
          {animData.type === 'Feuer' && (
            <div className="relative flex items-center justify-center">
              <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 blur-sm animate-ping" />
              <div className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full border-4 border-amber-300 shadow-[0_0_60px_#ef4444] animate-spin" />
            </div>
          )}

          {/* WASSER: Wuchtige Hydro-Druckwelle */}
          {animData.type === 'Wasser' && (
            <div className="relative flex items-center justify-center">
              <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-300 to-blue-600 blur-sm animate-ping" />
              <div className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full border-4 border-cyan-300 shadow-[0_0_60px_#0ea5e9] animate-pulse" />
            </div>
          )}

          {/* ELEKTRO: Hochspannungs-Blitzkrachen */}
          {animData.type === 'Elektro' && (
            <div className="relative flex items-center justify-center">
              <div className="w-44 h-44 sm:w-60 sm:h-60 rounded-full bg-yellow-300/40 blur-md animate-ping" />
              <div className="absolute text-7xl sm:text-8xl text-yellow-300 drop-shadow-[0_0_40px_#fde047] animate-bounce">
                ⚡
              </div>
            </div>
          )}

          {/* PFLANZE: Schneidender Blatt-Wirbelsturm */}
          {animData.type === 'Pflanze' && (
            <div className="relative flex items-center justify-center">
              <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-emerald-400/40 blur-sm animate-ping" />
              <div className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full border-4 border-lime-300 shadow-[0_0_50px_#10b981] animate-spin" />
            </div>
          )}

          {/* PSYCHO: Hypnotische Dimensions-Schockwelle */}
          {animData.type === 'Psycho' && (
            <div className="relative flex items-center justify-center">
              <div className="w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-fuchsia-600 to-indigo-600 blur-sm animate-ping" />
              <div className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full border-4 border-fuchsia-300 shadow-[0_0_60px_#c026d3] animate-spin" />
            </div>
          )}

          {/* KAMPF / FARBLOS / ANDERE: TCG Pocket 3-Klauen-Hieb / Schockwelle */}
          {!['Feuer', 'Wasser', 'Elektro', 'Pflanze', 'Psycho'].includes(animData.type) && (
            <div className="relative flex items-center justify-center">
              {/* Triple Claw Scratch marks */}
              <div className="relative w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center rotate-[-25deg]">
                <div className="absolute h-1 sm:h-1.5 w-36 sm:w-48 bg-gradient-to-r from-transparent via-white to-amber-300 shadow-[0_0_20px_#fbbf24] -translate-y-4" />
                <div className="absolute h-1.5 sm:h-2 w-40 sm:w-52 bg-gradient-to-r from-transparent via-white to-red-500 shadow-[0_0_25px_#ef4444]" />
                <div className="absolute h-1 sm:h-1.5 w-36 sm:w-48 bg-gradient-to-r from-transparent via-white to-amber-300 shadow-[0_0_20px_#fbbf24] translate-y-4" />
              </div>
              <div className="absolute w-36 h-36 sm:w-48 sm:h-48 rounded-full border-4 border-white/80 animate-ping" />
            </div>
          )}

          {/* B. SCHWEBENDE BOMBIG-GROSSE SCHADENSZAHL */}
          <div className="absolute -top-8 flex items-center gap-1 animate-bounce z-50">
            <span className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-rose-500 to-red-600 drop-shadow-[0_6px_16px_rgba(0,0,0,0.95)] stroke-white stroke-2">
              -{animData.damage}
            </span>
          </div>

          {/* C. ATTACKEN-NAME BANNER */}
          {animData.attackName && (
            <div className="absolute top-14 bg-slate-950/95 text-amber-300 px-5 py-1.5 rounded-full border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.7)] font-black text-xs sm:text-sm uppercase tracking-wider animate-in fade-in zoom-in duration-200">
              {animData.attackName}!
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. KO FAINTING RED BEAM SEQUENCE                                          */}
      {/* ========================================================================= */}
      {phase === 'faint' && (
        <div
          className={`absolute flex flex-col items-center justify-center z-50 ${
            isPlayerAttacking ? 'top-[22%]' : 'bottom-[22%]'
          }`}
        >
          {/* Rotierender, konischer Energie-Rückrufstrahl */}
          <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-gradient-to-t from-red-600 via-rose-500/40 to-transparent blur-md animate-pulse" />
          <div className="absolute w-44 h-44 sm:w-60 sm:h-60 rounded-full border-4 border-red-500 animate-ping" />

          {/* K.O. Badge */}
          <div className="absolute text-2xl sm:text-4xl font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 px-6 py-2 rounded-full border-3 border-white shadow-[0_0_40px_rgba(244,63,94,0.9)] animate-bounce">
            K.O.! ⭐
          </div>
        </div>
      )}
    </div>
  );
};
