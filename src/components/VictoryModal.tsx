import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, PackageOpen, Sparkles, Award, Star } from 'lucide-react';
import { soundManager } from '../services/soundManager';
import { GodRaysOverlay } from './GodRaysOverlay';
import { Card } from '../types/game';

interface VictoryModalProps {
  winnerName: string;
  isLeviWinner: boolean;
  onPlayAgain: () => void;
  onOpenBooster?: () => void;
  winningPokemon?: Card | null;
  playerStars?: number;
  opponentStars?: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winnerName,
  isLeviWinner,
  onPlayAgain,
  onOpenBooster,
  winningPokemon,
  playerStars = 2,
  opponentStars = 0
}) => {
  const [starsRevealed, setStarsRevealed] = useState<number>(0);

  useEffect(() => {
    soundManager.stopBgm();

    if (isLeviWinner) {
      // Fire celebratory confetti shower!
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#fbbf24', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6']
      });

      // Second wave of confetti
      setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 120,
          origin: { y: 0.4 },
          colors: ['#fbbf24', '#facc15', '#ffffff']
        });
      }, 600);

      soundManager.playSfx('victory');
      soundManager.playVoice(
        'win_game',
        `Glückwunsch ${winnerName}! Du hast gewonnen! Du bist ein wahrer Pokémon-Meister!`
      );

      // Staggered star pop-in sound & animation
      const starTimers = [
        setTimeout(() => {
          setStarsRevealed(1);
          soundManager.playSfx('ok');
        }, 500),
        setTimeout(() => {
          setStarsRevealed(2);
          soundManager.playSfx('ok');
        }, 900),
        setTimeout(() => {
          setStarsRevealed(3);
          soundManager.playSfx('star_rare');
        }, 1300)
      ];

      return () => {
        starTimers.forEach(clearTimeout);
      };
    } else {
      soundManager.playSfx('defeat');
      soundManager.playVoice(
        'cheer_loss',
        'Schade, fast geschafft! Nächstes Mal gewinnst du bestimmt!'
      );
      setStarsRevealed(1);
    }
  }, [winnerName, isLeviWinner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-safe select-none overflow-y-auto font-sans">
      {/* 1. Authentic God Rays Sunburst Background */}
      {isLeviWinner && <GodRaysOverlay variant="victory" showShockwave={true} />}

      {/* 2. Backdrop Tint */}
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md pointer-events-none" />

      {/* 3. Victory Stage Container */}
      <div className="relative z-50 max-w-lg w-full max-h-[94dvh] bg-gradient-to-b from-slate-900/95 via-slate-900/98 to-amber-950/70 border-3 border-amber-400 rounded-3xl p-4 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col items-center text-center gap-3.5 sm:gap-5 my-auto overflow-y-auto animate-in zoom-in-95 duration-300">
        
        {/* Glow Halo behind Trophy */}
        <div className="relative flex items-center justify-center mt-2">
          <div className="absolute w-36 h-36 rounded-full bg-amber-400/30 blur-2xl animate-pulse pointer-events-none" />
          
          {/* Trophy Icon */}
          <div className="relative w-20 h-20 sm:w-26 sm:h-26 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center shadow-[0_0_35px_rgba(251,191,36,0.9)] border-4 border-white animate-bounce">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-slate-950 drop-shadow" />
            <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-200 animate-spin" />
          </div>

          {/* Champion Pokémon Avatar Thumbnail */}
          {winningPokemon && (
            <div
              className="absolute -bottom-2 -right-2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900 border-2 border-amber-300 shadow-xl overflow-hidden p-1 flex items-center justify-center animate-in zoom-in duration-500"
              title={`Sieger-Pokémon: ${winningPokemon.name}`}
            >
              <img
                src={winningPokemon.artworkUrl}
                alt={winningPokemon.name}
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
          )}
        </div>

        {/* 3D Gold "SIEG!" Header Banner */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-300 text-xs font-black uppercase tracking-widest">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Match Beendet</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-300 to-yellow-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            {isLeviWinner ? 'SIEG! 🏆' : 'GUTES MATCH!'}
          </h2>

          <p className="text-base sm:text-lg font-bold text-white drop-shadow">
            {isLeviWinner
              ? `${winnerName} gewinnt das Pokémon-Match!`
              : `${winnerName} hat dieses Mal gewonnen.`}
          </p>

          {winningPokemon && isLeviWinner && (
            <p className="text-xs sm:text-sm font-extrabold text-amber-300">
              ⭐ Mit {winningPokemon.name} als Sieger-Pokémon! ⭐
            </p>
          )}
        </div>

        {/* Sequentially Popping Win Stars */}
        <div className="flex flex-col items-center gap-1.5 py-1">
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
            Erreichte Sieges-Sterne
          </span>
          <div className="flex items-center gap-3 sm:gap-4">
            {[1, 2, 3].map((starIdx) => {
              const isFilled = starIdx <= (isLeviWinner ? 3 : 1);
              const isPopped = starIdx <= starsRevealed;

              return (
                <div
                  key={starIdx}
                  style={{
                    transform: isPopped ? 'scale(1)' : 'scale(0.3)',
                    opacity: isPopped ? 1 : 0.2,
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-3 shadow-xl ${
                    isFilled && isPopped
                      ? 'bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 border-white text-slate-950 shadow-[0_0_20px_#fbbf24]'
                      : 'bg-slate-800 border-slate-600 text-slate-500'
                  }`}
                >
                  <Star className={`w-7 h-7 sm:w-8 sm:h-8 ${isFilled && isPopped ? 'fill-slate-950' : 'fill-slate-700'}`} />
                  {isPopped && isFilled && (
                    <div className="absolute inset-0 rounded-full border-2 border-white animate-ping pointer-events-none opacity-40" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Reward Card Banner */}
        {isLeviWinner && onOpenBooster && (
          <div className="w-full bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 rounded-2xl border-2 border-amber-300/60 p-3 sm:p-4 flex items-center justify-between gap-3 shadow-lg animate-pulse">
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-md border border-white shrink-0">
                🎁
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-black uppercase text-amber-300 tracking-wider block">
                  Match-Belohnung Freigeschaltet!
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-white block">
                  1x Neuer Booster-Pack verfügbar
                </span>
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin shrink-0" />
          </div>
        )}

        {/* Action Buttons with Apple Safe Area Insets */}
        <div className="w-full flex flex-col gap-2.5 sm:gap-3 pt-1">
          {onOpenBooster && isLeviWinner && (
            <button
              onClick={onOpenBooster}
              className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base sm:text-lg border-2 border-white shadow-[0_10px_30px_rgba(251,191,36,0.7)] flex items-center justify-center gap-2.5 transition-transform active:scale-95 animate-bounce cursor-pointer"
            >
              <PackageOpen className="w-6 h-6" />
              <span>BOOSTER-PACK JETZT ÖFFNEN! 🎁</span>
            </button>
          )}

          <button
            onClick={onPlayAgain}
            className="w-full py-3 sm:py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm sm:text-base border border-slate-600 shadow flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 text-amber-400" />
            <span>Neues Spiel starten / Zur Arena</span>
          </button>
        </div>
      </div>
    </div>
  );
};
