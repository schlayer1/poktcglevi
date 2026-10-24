import React, { useState, useEffect } from 'react';
import { Card } from '../types/game';
import { CardView } from './CardView';
import { storageService } from '../services/storageService';
import { soundManager } from '../services/soundManager';
import confetti from 'canvas-confetti';
import { PackageOpen, Sparkles, ArrowRight, RotateCcw, X } from 'lucide-react';

interface BoosterOpeningScreenProps {
  allCards: Card[];
  onFinish: () => void;
}

export const BoosterOpeningScreen: React.FC<BoosterOpeningScreenProps> = ({
  allCards,
  onFinish
}) => {
  const [phase, setPhase] = useState<'sealed' | 'tearing' | 'revealing' | 'summary'>('sealed');
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [currentRevealIdx, setCurrentRevealIdx] = useState<number>(0);
  const [boosterArt, setBoosterArt] = useState<number>(6); // Glurak (6) or Turtok (9) or Bisaflor (3)

  useEffect(() => {
    soundManager.playBgm('menu');
  }, []);

  const handleTearBooster = () => {
    if (phase !== 'sealed') return;
    setPhase('tearing');
    soundManager.playSfx('button');

    const cards = storageService.generateBoosterCards(allCards);
    setPulledCards(cards);

    // Tearing sound + reveal transition
    setTimeout(() => {
      soundManager.playSfx('energy_attach');
      setPhase('revealing');
      setCurrentRevealIdx(0);
      setRevealedIndices([]);
    }, 700);
  };

  const handleRevealCard = (idx: number) => {
    if (revealedIndices.includes(idx)) return;

    const nextRevealed = [...revealedIndices, idx];
    setRevealedIndices(nextRevealed);

    const card = pulledCards[idx];
    if (card) {
      soundManager.playSfx('card_play');
      soundManager.playCry(card.dexId);
      soundManager.speakText(`${card.name}!`);

      if (card.isEx) {
        soundManager.playSfx('victory');
        soundManager.playVoice('cheer_super', 'Super gemacht, Levi!');
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }

    if (nextRevealed.length === pulledCards.length) {
      setTimeout(() => {
        setPhase('summary');
        soundManager.playSfx('victory');
      }, 1200);
    } else {
      setCurrentRevealIdx(idx + 1);
    }
  };

  const profile = storageService.loadProfile(allCards);
  const remainingBoosters = profile.unopenedBoosters;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-8 select-none overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/40 via-indigo-950/70 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fbbf24_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 w-full flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-700 shadow-lg">
          <PackageOpen className="w-5 h-5 text-amber-400" />
          <span className="font-extrabold text-sm text-white">
            Noch {remainingBoosters} Booster übrig
          </span>
        </div>

        <button
          onClick={onFinish}
          className="p-3 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white shadow-xl transition-transform active:scale-90"
          title="Schließen"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* 1. PHASE: SEALED BOOSTER PACK */}
      {phase === 'sealed' && (
        <div className="relative z-10 flex flex-col items-center gap-6 my-auto">
          {/* Shimmering Foil Booster Pack */}
          <div
            onClick={handleTearBooster}
            className="group relative w-64 sm:w-72 aspect-[5/8] rounded-3xl p-4 bg-gradient-to-b from-amber-500 via-orange-600 to-red-700 border-4 border-yellow-300 shadow-[0_0_50px_rgba(251,191,36,0.7)] flex flex-col items-center justify-between cursor-pointer transition-transform duration-300 transform hover:scale-105 active:scale-95 animate-pulse"
          >
            {/* Holographic Sheen */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-3xl pointer-events-none" />

            {/* Pack Header */}
            <div className="text-center">
              <span className="text-[11px] font-black uppercase tracking-widest text-yellow-200 block drop-shadow">
                Pokémon Sammelkartenspiel
              </span>
              <h2 className="text-2xl font-black text-white drop-shadow">
                Unschlagbare Gene
              </h2>
            </div>

            {/* Cover Pokémon Artwork */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              <img
                src={`/images/pokemon/${boosterArt}.png`}
                alt="Booster Cover"
                className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* Tear Hint at Top */}
            <div className="w-full bg-slate-950/80 py-2 rounded-xl text-center border border-yellow-300/60 shadow">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                ✂️ Tippen zum Öffnen!
              </span>
            </div>
          </div>

          <button
            onClick={handleTearBooster}
            className="py-4 px-8 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xl border-3 border-white shadow-2xl flex items-center gap-3 transition-transform active:scale-95 animate-bounce"
          >
            <PackageOpen className="w-6 h-6" />
            <span>BOOSTER AUFREISSEN! 🎁</span>
          </button>
        </div>
      )}

      {/* 2. PHASE: TEARING ANIMATION */}
      {phase === 'tearing' && (
        <div className="relative z-10 flex flex-col items-center justify-center my-auto">
          <div className="w-72 aspect-[5/8] rounded-3xl bg-gradient-to-b from-amber-400 to-orange-600 border-4 border-white shadow-[0_0_60px_#f59e0b] flex items-center justify-center animate-ping">
            <Sparkles className="w-20 h-20 text-white animate-spin" />
          </div>
        </div>
      )}

      {/* 3. PHASE: REVEALING CARDS ONE BY ONE */}
      {phase === 'revealing' && (
        <div className="relative z-10 flex flex-col items-center gap-6 my-auto max-w-4xl w-full">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow">
              Karte {currentRevealIdx + 1} von {pulledCards.length}
            </h3>
            <p className="text-sm font-bold text-slate-300">
              Tippe auf die Karte, um sie aufzudecken!
            </p>
          </div>

          {/* Cards Stack / Current Card Focus */}
          <div className="relative flex items-center justify-center min-h-[340px]">
            {pulledCards.map((card, idx) => {
              const isRevealed = revealedIndices.includes(idx);
              const isCurrent = idx === currentRevealIdx;

              if (!isCurrent && !isRevealed) return null;

              return (
                <div
                  key={idx}
                  onClick={() => handleRevealCard(idx)}
                  className={`transition-all duration-500 transform cursor-pointer ${
                    isCurrent ? 'scale-115 z-30 shadow-[0_0_40px_rgba(251,191,36,0.8)]' : 'opacity-40 scale-90'
                  }`}
                >
                  {isRevealed ? (
                    <CardView card={card} size="active" />
                  ) : (
                    /* Facedown Card Back */
                    <div className="w-44 sm:w-52 aspect-[5/7] rounded-2xl bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 border-3 border-amber-300 shadow-2xl flex flex-col items-center justify-center gap-3 p-4 animate-bounce">
                      <div className="w-16 h-16 rounded-full border-3 border-white bg-rose-500 flex items-center justify-center shadow-lg">
                        <div className="w-6 h-6 rounded-full bg-white border-2 border-slate-900" />
                      </div>
                      <span className="text-xs font-black uppercase text-amber-300 tracking-widest text-center">
                        Tippen zum Aufdecken! ⭐
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Card Indicator Dots */}
          <div className="flex items-center gap-2">
            {pulledCards.map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  revealedIndices.includes(i)
                    ? 'bg-amber-400 scale-110 shadow-[0_0_8px_#f59e0b]'
                    : i === currentRevealIdx
                    ? 'bg-white animate-pulse'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. PHASE: SUMMARY OF ALL 5 CARDS */}
      {phase === 'summary' && (
        <div className="relative z-10 flex flex-col items-center gap-5 my-auto max-w-5xl w-full">
          <div className="text-center space-y-1">
            <h2 className="text-3xl sm:text-4xl font-black text-amber-300 drop-shadow">
              Neue Karten für dein Album! 🎉
            </h2>
            <p className="text-sm font-bold text-slate-300">
              Alle 5 Karten wurden deiner Sammlung hinzugefügt.
            </p>
          </div>

          {/* 5 Cards Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2">
            {pulledCards.map((card, i) => (
              <div key={i} className="transform hover:scale-105 transition-transform">
                <CardView card={card} size="bench" />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-md justify-center">
            {remainingBoosters > 0 && (
              <button
                onClick={() => {
                  setPhase('sealed');
                  setBoosterArt(boosterArt === 6 ? 9 : boosterArt === 9 ? 3 : 6);
                }}
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <PackageOpen className="w-5 h-5" />
                <span>Nächsten Booster öffnen ({remainingBoosters})</span>
              </button>
            )}

            <button
              onClick={onFinish}
              className="py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-base border border-slate-600 shadow flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>Fertig</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Spacer */}
      <div className="h-4" />
    </div>
  );
};
