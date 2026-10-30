import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Card } from '../types/game';
import { soundManager } from '../services/soundManager';
import { storageService } from '../services/storageService';
import { Sparkles, Trophy, X, RotateCcw, PackageOpen, Volume2 } from 'lucide-react';
import { EnergyBadge } from './EnergyBadge';

interface MemoMinigameModalProps {
  allCards: Card[];
  onClose: () => void;
  onOpenBoosters?: () => void;
}

export type MemoDifficulty = 'easy' | 'medium' | 'hard' | 'pro';

interface DifficultyConfig {
  id: MemoDifficulty;
  pairs: number;
  label: string;
  badge: string;
  cols: string;
  maxW: string;
  cardMaxH: string;
  artSize: string;
  nameSize: string;
  hpSize: string;
  boosters: number;
  voiceDesc: string;
}

const MEMO_DIFFICULTIES: Record<MemoDifficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    pairs: 4,
    label: 'Leicht',
    badge: '4 🌱',
    cols: 'grid-cols-4',
    maxW: 'max-w-xl',
    cardMaxH: 'max-h-[30dvh]',
    artSize: 'w-16 h-16 sm:w-22 sm:h-22',
    nameSize: 'text-xs sm:text-sm',
    hpSize: 'text-[11px] sm:text-xs',
    boosters: 1,
    voiceDesc: 'Schwierigkeit Leicht: Finde vier Pärchen!'
  },
  medium: {
    id: 'medium',
    pairs: 6,
    label: 'Mittel',
    badge: '6 ⭐',
    cols: 'grid-cols-4',
    maxW: 'max-w-2xl',
    cardMaxH: 'max-h-[21dvh]',
    artSize: 'w-12 h-12 sm:w-16 sm:h-16',
    nameSize: 'text-[11px] sm:text-xs',
    hpSize: 'text-[10px] sm:text-[11px]',
    boosters: 1,
    voiceDesc: 'Schwierigkeit Mittel: Finde sechs Pärchen!'
  },
  hard: {
    id: 'hard',
    pairs: 8,
    label: 'Schwer',
    badge: '8 🏆',
    cols: 'grid-cols-4',
    maxW: 'max-w-2xl',
    cardMaxH: 'max-h-[16dvh]',
    artSize: 'w-10 h-10 sm:w-13 sm:h-13',
    nameSize: 'text-[10px] sm:text-[11px]',
    hpSize: 'text-[9px] sm:text-[10px]',
    boosters: 1,
    voiceDesc: 'Schwierigkeit Schwer: Finde acht Pärchen!'
  },
  pro: {
    id: 'pro',
    pairs: 10,
    label: 'Profi',
    badge: '10 👑',
    cols: 'grid-cols-5',
    maxW: 'max-w-3xl',
    cardMaxH: 'max-h-[16dvh]',
    artSize: 'w-9 h-9 sm:w-12 sm:h-12',
    nameSize: 'text-[9px] sm:text-[10px]',
    hpSize: 'text-[8px] sm:text-[9px]',
    boosters: 2,
    voiceDesc: 'Schwierigkeit Profi: Finde zehn Pärchen!'
  }
};

interface MemoCardItem {
  uid: string;
  card: Card;
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoMinigameModal: React.FC<MemoMinigameModalProps> = ({
  allCards,
  onClose,
  onOpenBoosters
}) => {
  const [difficulty, setDifficulty] = useState<MemoDifficulty>('medium');
  const [deck, setDeck] = useState<MemoCardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const [turns, setTurns] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const cfg = MEMO_DIFFICULTIES[difficulty];

  // Initialize pairs based on selected difficulty
  const initGame = (targetDiff: MemoDifficulty = difficulty) => {
    const targetCfg = MEMO_DIFFICULTIES[targetDiff];
    const pairCount = targetCfg.pairs;

    const profile = storageService.loadProfile(allCards);
    const ownedIds = Object.keys(profile.unlockedCards).filter((id) => (profile.unlockedCards[id] || 0) > 0);
    
    // Pick from Levi's cards if enough owned, otherwise fall back to any Basis cards
    const candidateCards = allCards.filter(
      (c) => c.stage === 'Basis' && (ownedIds.length >= pairCount ? ownedIds.includes(c.id) : true)
    );

    // Pick pairCount distinct Pokémon
    const shuffledCandidates = [...candidateCards].sort(() => Math.random() - 0.5);
    const picked = shuffledCandidates.slice(0, pairCount);

    // Duplicate each card into a pair
    const items: MemoCardItem[] = [];
    picked.forEach((c, idx) => {
      items.push({
        uid: `${c.id}_a_${idx}`,
        card: c,
        isFlipped: false,
        isMatched: false
      });
      items.push({
        uid: `${c.id}_b_${idx}`,
        card: c,
        isFlipped: false,
        isMatched: false
      });
    });

    // Shuffle the items
    items.sort(() => Math.random() - 0.5);

    setDeck(items);
    setFlippedIndices([]);
    setMatchedCount(0);
    setTurns(0);
    setIsWon(false);
    setIsLocked(false);
  };

  useEffect(() => {
    soundManager.playVoice(
      'memo_welcome',
      'Willkommen beim Poké-Memo! Finde alle passenden Pokémon-Pärchen!'
    );
    initGame('medium');
  }, [allCards]);

  const handleDifficultyChange = (newDiff: MemoDifficulty) => {
    if (newDiff === difficulty && deck.length > 0) return;
    soundManager.playSfx('button');
    setDifficulty(newDiff);
    const newCfg = MEMO_DIFFICULTIES[newDiff];
    soundManager.speakText(newCfg.voiceDesc);
    initGame(newDiff);
  };

  const handleCardClick = (index: number) => {
    if (isLocked) return;
    const item = deck[index];
    if (item.isMatched || item.isFlipped) return;

    soundManager.playSfx('card_flip');

    // Flip this card
    const nextDeck = [...deck];
    nextDeck[index].isFlipped = true;
    setDeck(nextDeck);

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setIsLocked(true);
      setTurns((prev) => prev + 1);

      const [firstIdx, secondIdx] = nextFlipped;
      const firstCard = deck[firstIdx].card;
      const secondCard = deck[secondIdx].card;

      if (firstCard.id === secondCard.id) {
        // MATCH!
        setTimeout(() => {
          soundManager.playSfx('star_rare');
          soundManager.playVoice('memo_pair', `Ein Treffer! Du hast ${firstCard.name} gefunden!`, () => {
            setTimeout(() => {
              soundManager.playCry(firstCard.dexId);
            }, 120);
          });

          const matchedDeck = [...deck];
          matchedDeck[firstIdx].isMatched = true;
          matchedDeck[secondIdx].isMatched = true;
          setDeck(matchedDeck);

          setFlippedIndices([]);
          setIsLocked(false);
          const nextMatched = matchedCount + 1;
          setMatchedCount(nextMatched);

          // All pairs found?
          if (nextMatched === cfg.pairs) {
            setIsWon(true);
            storageService.addBooster(cfg.boosters);
            soundManager.playSfx('victory');
            soundManager.speakText(
              `Klasse Gedächtnis, Levi! Du hast alle ${cfg.pairs} Pärchen auf ${cfg.label} gefunden! Hier ist deine Belohnung!`
            );
            confetti({
              particleCount: 180,
              spread: 110,
              origin: { y: 0.5 },
              colors: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ffffff']
            });
          }
        }, 450);
      } else {
        // MISMATCH -> Flip back after delay
        setTimeout(() => {
          soundManager.playSfx('card_slide');
          const resetDeck = [...deck];
          resetDeck[firstIdx].isFlipped = false;
          resetDeck[secondIdx].isFlipped = false;
          setDeck(resetDeck);

          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 select-none overflow-hidden font-sans">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/85 backdrop-blur-md cursor-pointer" />

      {/* Main Container - Optimized for FireTab 11 landscape without vertical overflow */}
      <div className={`relative z-50 ${cfg.maxW} w-full max-h-[96dvh] bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 border-3 border-sky-400 rounded-3xl p-3 sm:p-4 shadow-[0_0_50px_rgba(56,189,248,0.35)] flex flex-col justify-between my-auto text-white gap-2.5`}>
        
        {/* Header with Integrated Difficulty Pills & Actions */}
        <div className="flex flex-wrap items-center justify-between border-b border-sky-500/20 pb-2 gap-2">
          {/* Title & Vorlesen Button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-lg shrink-0">
              🃏
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-sky-400 tracking-wider block leading-none">
                Trainingscamp
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <h2 className="text-sm sm:text-base font-black text-white leading-tight">
                  Poké-Memo
                </h2>
                <button
                  onClick={() => soundManager.speakText(`Poké-Memo! Finde alle passenden Pokémon-Pärchen. Aktuelle Schwierigkeit: ${cfg.label}. Du hast ${matchedCount} von ${cfg.pairs} Pärchen in ${turns} Versuchen gefunden.`)}
                  className="p-1 rounded-full bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 border border-sky-400/50 shadow active:scale-90 transition-transform cursor-pointer"
                  title="Anleitung vorlesen"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Difficulty Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-700/80 shadow-inner">
            {(['easy', 'medium', 'hard', 'pro'] as MemoDifficulty[]).map((d) => {
              const active = difficulty === d;
              const c = MEMO_DIFFICULTIES[d];
              return (
                <button
                  key={d}
                  onClick={() => handleDifficultyChange(d)}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 shadow-md scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={c.voiceDesc}
                >
                  {c.badge}
                </button>
              );
            })}
          </div>

          {/* Right Status Counter & Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-800 text-[11px] font-bold">
              <span className="text-amber-300 font-black">{matchedCount}/{cfg.pairs}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-300">{turns} V</span>
            </div>

            <button
              onClick={() => initGame(difficulty)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 active:scale-95 transition-all cursor-pointer"
              title="Neu mischen"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Responsive Cards Grid - Sized to fit screen perfectly */}
        {!isWon ? (
          <div className="flex-1 min-h-0 flex items-center justify-center py-0.5 overflow-hidden">
            <div className={`grid ${cfg.cols} gap-1.5 sm:gap-2.5 w-full items-center justify-center`}>
              {deck.map((item, idx) => {
                const isShowing = item.isFlipped || item.isMatched;

                return (
                  <div
                    key={item.uid}
                    onClick={() => handleCardClick(idx)}
                    style={{ perspective: '1000px' }}
                    className={`aspect-[3/4] ${cfg.cardMaxH} w-full relative cursor-pointer group active:scale-95 transition-transform duration-200 mx-auto ${
                      item.isMatched ? 'pointer-events-none' : ''
                    }`}
                  >
                    <div
                      style={{
                        transform: isShowing ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transformStyle: 'preserve-3d',
                        transition: 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      className="w-full h-full relative"
                    >
                      {/* BACK FACE (Card Back) */}
                      <div
                        style={{ backfaceVisibility: 'hidden' }}
                        className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 p-1 shadow-md hover:border-sky-400 transition-colors"
                      >
                        <img
                          src="/images/cards/card_back.webp"
                          alt="Kartenrücken"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>

                      {/* FRONT FACE (Revealed Pokemon) */}
                      <div
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                        className={`absolute inset-0 rounded-2xl overflow-hidden border-2 p-1 sm:p-1.5 flex flex-col items-center justify-between text-center shadow-xl ${
                          item.isMatched
                            ? 'border-amber-400 bg-gradient-to-b from-amber-950/70 via-slate-900 to-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                            : 'border-sky-400 bg-slate-950'
                        }`}
                      >
                        <div className="w-full flex items-center justify-between px-0.5 sm:px-1">
                          <EnergyBadge type={item.card.types[0] || 'Farblos'} size="sm" />
                          <span className={`${cfg.hpSize} font-black text-amber-300`}>
                            {item.card.hp} KP
                          </span>
                        </div>

                        <div className={`${cfg.artSize} flex items-center justify-center p-0.5`}>
                          <img
                            src={item.card.artworkUrl}
                            alt={item.card.name}
                            className="w-full h-full object-contain filter drop-shadow"
                          />
                        </div>

                        <span className={`${cfg.nameSize} font-black text-white truncate max-w-full px-0.5`}>
                          {item.card.name}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* WIN SCREEN */
          <div className="flex flex-col items-center text-center gap-3 py-3 my-auto">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center border-3 border-white shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-bounce">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-slate-950" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Super Gedächtnis, Levi! 🌟
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Du hast alle {cfg.pairs} Pärchen auf Stufe <span className="text-sky-300 font-black">{cfg.label}</span> in {turns} Versuchen gefunden!
              </p>
            </div>

            <div className="w-full max-w-md bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 rounded-2xl border-2 border-amber-300/60 p-3 sm:p-4 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-black shrink-0">
                  🎁
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-300 block">
                    Memo-Meister Belohnung!
                  </span>
                  <span className="text-xs font-bold text-white block">
                    +{cfg.boosters} Kostenlose{cfg.boosters > 1 ? 'r' : ''} Booster-Pack{cfg.boosters > 1 ? 's' : ''} freigeschaltet!
                  </span>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin shrink-0" />
            </div>

            <div className="w-full max-w-md flex flex-col sm:flex-row gap-2 pt-1">
              {onOpenBoosters && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenBoosters();
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <PackageOpen className="w-4 h-4" />
                  <span>Booster jetzt öffnen! 🎁</span>
                </button>
              )}
              <button
                onClick={() => initGame(difficulty)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 active:scale-95 cursor-pointer"
              >
                Noch eine Runde spielen!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
