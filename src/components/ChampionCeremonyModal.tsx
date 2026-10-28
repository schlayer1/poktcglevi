import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, Award, Star, PackageOpen, RotateCcw, ShieldCheck } from 'lucide-react';
import { soundManager } from '../services/soundManager';
import { GodRaysOverlay } from './GodRaysOverlay';
import { Card } from '../types/game';
import { HoloCard } from './HoloCard';

interface ChampionCeremonyModalProps {
  winnerName: string;
  winningPokemon?: Card | null;
  onOpenBoosters: () => void;
  onContinue: () => void;
}

export const ChampionCeremonyModal: React.FC<ChampionCeremonyModalProps> = ({
  winnerName,
  winningPokemon,
  onOpenBoosters,
  onContinue
}) => {
  const [step, setStep] = useState<'intro' | 'trophy' | 'pichu_reveal'>('intro');
  const [isPichuFlipped, setIsPichuFlipped] = useState<boolean>(false);

  useEffect(() => {
    soundManager.stopBgm();

    // 1. Initial Confetti Cannon
    confetti({
      particleCount: 220,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#fbbf24', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#ffffff']
    });

    // 2. Play Victory Fanfare & Amala Voice
    soundManager.playSfx('victory');
    soundManager.playVoice(
      'champion_victory',
      'Unglaublich, Levi! Du hast die Pokémon-Liga gewonnen und bist der neue Champ von Kanto!'
    );

    // Stagger steps
    const timer1 = setTimeout(() => {
      setStep('trophy');
      confetti({
        particleCount: 150,
        spread: 160,
        origin: { y: 0.35 },
        colors: ['#fbbf24', '#fde047', '#ffffff']
      });
    }, 1200);

    const timer2 = setTimeout(() => {
      setStep('pichu_reveal');
      soundManager.playVoice(
        'pichu_gift',
        'Eine riesige Überraschung! Professor Eich schenkt dir ein ganz besonderes Baby-Pokémon aus der Johto-Region: Pichu!'
      );
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-safe select-none overflow-y-auto font-sans">
      {/* 1. Dramatic God Rays Overlay */}
      <GodRaysOverlay variant="victory" showShockwave={true} />

      {/* 2. Dark backdrop */}
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md pointer-events-none" />

      {/* 3. Main Stage Container */}
      <div className="relative z-50 max-w-xl w-full max-h-[94dvh] bg-gradient-to-b from-amber-950/90 via-slate-900/98 to-slate-950/95 border-3 border-amber-400 rounded-3xl p-5 sm:p-7 shadow-[0_0_80px_rgba(251,191,36,0.6)] flex flex-col items-center text-center gap-4 my-auto overflow-y-auto animate-in zoom-in-95 duration-500 text-white">
        
        {/* Top Trophy & Glow */}
        <div className="relative flex items-center justify-center mt-1">
          <div className="absolute w-44 h-44 rounded-full bg-amber-400/40 blur-3xl animate-pulse pointer-events-none" />
          
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,1)] border-4 border-white animate-bounce">
            <Trophy className="w-14 h-14 sm:w-16 sm:h-16 text-slate-950 drop-shadow-md" />
            <Sparkles className="absolute -top-2 -right-2 w-9 h-9 text-amber-100 animate-spin" />
          </div>

          {winningPokemon && (
            <div
              className="absolute -bottom-2 -right-3 w-14 h-14 rounded-full bg-slate-900 border-2 border-amber-300 shadow-2xl overflow-hidden p-1 flex items-center justify-center"
              title={`Champion-Partner: ${winningPokemon.name}`}
            >
              <img
                src={winningPokemon.artworkUrl}
                alt={winningPokemon.name}
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
          )}
        </div>

        {/* Title Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/30 border border-amber-300/60 text-amber-300 text-xs font-black uppercase tracking-widest shadow-md">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Offizielle Krönungs-Zeremonie</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-500 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            KANTO-CHAMPION! 🏆
          </h1>

          <p className="text-sm sm:text-base font-bold text-amber-100/90 drop-shadow">
            Glückwunsch {winnerName}! Du hast Champ Gary und alle Meister der Liga besiegt!
          </p>
        </div>

        {/* Hall of Fame Badge */}
        <div className="w-full bg-gradient-to-r from-amber-950/60 via-slate-900/80 to-amber-950/60 rounded-2xl border border-amber-400/40 p-3 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 text-xl font-black shrink-0">
              🏛️
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                Ruhmeshalle freigeschaltet
              </span>
              <span className="text-xs font-bold text-slate-200 block">
                Dein Sieger-Deck ist jetzt für immer in der Pokémon-Liga verewigt!
              </span>
            </div>
          </div>
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
        </div>

        {/* Surprise Pichu Card Reward */}
        <div className="w-full bg-gradient-to-b from-yellow-500/15 to-amber-600/10 rounded-2xl border-2 border-amber-400/60 p-3.5 sm:p-4 flex flex-col items-center gap-3 shadow-lg">
          <div className="flex items-center gap-2 text-center">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <h3 className="text-xs sm:text-sm font-black uppercase text-amber-300 tracking-wider">
              🌟 Geheimes Geschenk von Professor Eich 🌟
            </h3>
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          </div>

          <p className="text-[11px] sm:text-xs text-amber-100/80 max-w-md">
            Als erster Trainer in Kanto erhältst du die brandneue Sonderkarte aus der Johto-Region:
          </p>

          {/* Interactive Pichu Card Preview */}
          <div
            onClick={() => {
              setIsPichuFlipped(!isPichuFlipped);
              soundManager.playSfx('star_rare');
              soundManager.playVoice('card_A4-171', 'Pichu! Das süße Elektro-Maus-Baby!');
            }}
            className="relative w-36 h-50 sm:w-44 sm:h-60 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.6)] cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-300 group"
            title="Tippe auf Pichu für Details!"
          >
            <img
              src="/images/cards/A4-171.webp"
              alt="Pichu Sonderkarte"
              className="w-full h-full object-cover filter contrast-105"
            />
            {/* Holographic light sweep */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="absolute bottom-1 inset-x-1 bg-slate-950/80 rounded-lg py-0.5 text-[10px] font-black text-amber-300 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>★ Johto-Sonderkarte ★</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 pt-1">
          <button
            onClick={onOpenBoosters}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base border-2 border-white shadow-[0_10px_35px_rgba(251,191,36,0.8)] flex items-center justify-center gap-2.5 transition-transform active:scale-95 animate-bounce cursor-pointer"
          >
            <PackageOpen className="w-5 h-5" />
            <span>2x MEISTER-BOOTERPACKS ÖFFNEN! 🎁</span>
          </button>

          <button
            onClick={onContinue}
            className="w-full py-2.5 sm:py-3 px-5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-600 shadow flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Zurück zum Hauptmenü (Champion-Status)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
