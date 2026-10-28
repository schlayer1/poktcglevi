import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Card } from '../types/game';
import { soundManager } from '../services/soundManager';
import { storageService } from '../services/storageService';
import { Sparkles, Trophy, X, RotateCcw, CheckCircle2, PackageOpen } from 'lucide-react';
import { EnergyBadge } from './EnergyBadge';

interface MemoMinigameModalProps {
  allCards: Card[];
  onClose: () => void;
  onOpenBoosters?: () => void;
}

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
  const [deck, setDeck] = useState<MemoCardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const [turns, setTurns] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Initialize 6 pairs (12 cards) using Levi's owned cards
  const initGame = () => {
    const profile = storageService.loadProfile(allCards);
    const ownedIds = Object.keys(profile.unlockedCards).filter((id) => (profile.unlockedCards[id] || 0) > 0);
    
    // Fallback candidates if few cards owned
    const candidateCards = allCards.filter(
      (c) => c.stage === 'Basis' && (ownedIds.length >= 6 ? ownedIds.includes(c.id) : true)
    );

    // Pick 6 distinct Pokémon
    const shuffledCandidates = [...candidateCards].sort(() => Math.random() - 0.5);
    const picked = shuffledCandidates.slice(0, 6);

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

    // Shuffle the 12 items
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
    initGame();
  }, [allCards]);

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
          soundManager.playVoice('memo_pair', 'Ein Treffer! Du hast ein Pärchen gefunden!');
          soundManager.playCry(firstCard.dexId);

          const matchedDeck = [...deck];
          matchedDeck[firstIdx].isMatched = true;
          matchedDeck[secondIdx].isMatched = true;
          setDeck(matchedDeck);

          setFlippedIndices([]);
          setIsLocked(false);
          const nextMatched = matchedCount + 1;
          setMatchedCount(nextMatched);

          // All 6 pairs found?
          if (nextMatched === 6) {
            setIsWon(true);
            storageService.addBooster(1);
            soundManager.playSfx('victory');
            soundManager.playVoice(
              'memo_victory',
              'Klasse Gedächtnis, Levi! Du hast alle Pärchen gefunden! Hier ist dein neuer Booster-Pack!'
            );
            confetti({
              particleCount: 180,
              spread: 110,
              origin: { y: 0.5 },
              colors: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#ffffff']
            });
          }
        }, 500);
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
        }, 1100);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-safe select-none overflow-y-auto font-sans">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-slate-950/85 backdrop-blur-md cursor-pointer" />

      {/* Main Container */}
      <div className="relative z-50 max-w-2xl w-full max-h-[94dvh] bg-gradient-to-b from-slate-900 via-slate-900/98 to-slate-950 border-3 border-sky-400 rounded-3xl p-4 sm:p-6 shadow-[0_0_50px_rgba(56,189,248,0.35)] flex flex-col justify-between my-auto overflow-y-auto text-white gap-3.5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sky-500/20 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/50 flex items-center justify-center text-xl shrink-0">
              🃏
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider block">
                Professor Eichs Trainingscamp
              </span>
              <h2 className="text-base sm:text-xl font-black text-white">
                Poké-Memo • Karten-Suchspiel
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={initGame}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 active:scale-95 transition-all cursor-pointer"
              title="Neu mischen"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Gefundene Pärchen:</span>
            <span className="text-amber-300 font-black text-sm">{matchedCount} / 6</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Versuche:</span>
            <span className="text-white font-black">{turns}</span>
          </div>
        </div>

        {/* 12 Cards Grid (4 columns x 3 rows) */}
        {!isWon ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3 py-1">
            {deck.map((item, idx) => {
              const isShowing = item.isFlipped || item.isMatched;

              return (
                <div
                  key={item.uid}
                  onClick={() => handleCardClick(idx)}
                  style={{ perspective: '1000px' }}
                  className={`aspect-[3/4] relative cursor-pointer group active:scale-95 transition-transform duration-200 ${
                    item.isMatched ? 'pointer-events-none' : ''
                  }`}
                >
                  <div
                    style={{
                      transform: isShowing ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'
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
                      className={`absolute inset-0 rounded-2xl overflow-hidden border-2 p-1.5 flex flex-col items-center justify-between text-center shadow-xl ${
                        item.isMatched
                          ? 'border-amber-400 bg-gradient-to-b from-amber-950/70 via-slate-900 to-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                          : 'border-sky-400 bg-slate-950'
                      }`}
                    >
                      <div className="w-full flex items-center justify-between px-1">
                        <EnergyBadge type={item.card.types[0] || 'Farblos'} size="sm" />
                        <span className="text-[10px] font-black text-amber-300">{item.card.hp} KP</span>
                      </div>

                      <div className="w-14 h-14 sm:w-18 sm:h-18 flex items-center justify-center p-0.5">
                        <img
                          src={item.card.artworkUrl}
                          alt={item.card.name}
                          className="w-full h-full object-contain filter drop-shadow"
                        />
                      </div>

                      <span className="text-[11px] sm:text-xs font-black text-white truncate max-w-full px-1">
                        {item.card.name}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* WIN SCREEN */
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center border-3 border-white shadow-[0_0_30px_rgba(251,191,36,0.8)] animate-bounce">
              <Trophy className="w-10 h-10 text-slate-950" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">
                Super Gedächtnis, Levi! 🌟
              </h3>
              <p className="text-sm text-slate-300 mt-1">
                Du hast alle 6 Pärchen in {turns} Versuchen gefunden!
              </p>
            </div>

            <div className="w-full bg-gradient-to-r from-amber-500/20 via-yellow-400/25 to-amber-500/20 rounded-2xl border-2 border-amber-300/60 p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-black shrink-0">
                  🎁
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-300 block">
                    Memo-Meister Belohnung!
                  </span>
                  <span className="text-xs font-bold text-white block">
                    1x Kostenloser Booster-Pack freigeschaltet!
                  </span>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin shrink-0" />
            </div>

            <div className="w-full flex flex-col sm:flex-row gap-2 pt-2">
              {onOpenBoosters && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenBoosters();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <PackageOpen className="w-4 h-4" />
                  <span>Booster jetzt öffnen! 🎁</span>
                </button>
              )}
              <button
                onClick={initGame}
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
