import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../types/game';
import { CardView } from './CardView';
import { HoloCard } from './HoloCard';
import { storageService } from '../services/storageService';
import { soundManager } from '../services/soundManager';
import confetti from 'canvas-confetti';
import { PackageOpen, Sparkles, ArrowRight, X, Scissors, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface BoosterOpeningScreenProps {
  allCards: Card[];
  onFinish: () => void;
}

interface PackInfo {
  id: 'glurak' | 'pikachu' | 'mewtu' | 'mew';
  name: string;
  themeColor: string;
  accentBg: string;
  image: string;
  badge: string;
  subtitle: string;
}

const PACKS: PackInfo[] = [
  {
    id: 'glurak',
    name: 'Glurak-Pack',
    themeColor: '#ef4444',
    accentBg: 'from-amber-500/25 via-orange-600/30 to-red-950/90',
    image: '/images/packs/pack_glurak.png',
    badge: 'Feuer & Drachen',
    subtitle: 'Unschlagbare Gene'
  },
  {
    id: 'pikachu',
    name: 'Pikachu-Pack',
    themeColor: '#eab308',
    accentBg: 'from-yellow-400/25 via-amber-500/30 to-amber-950/90',
    image: '/images/packs/pack_pikachu.png',
    badge: 'Elektro & Blitz',
    subtitle: 'Unschlagbare Gene'
  },
  {
    id: 'mewtu',
    name: 'Mewtu-Pack',
    themeColor: '#a855f7',
    accentBg: 'from-purple-500/25 via-indigo-600/30 to-slate-950/90',
    image: '/images/packs/pack_mewtu.png',
    badge: 'Psycho & Mystik',
    subtitle: 'Unschlagbare Gene'
  },
  {
    id: 'mew',
    name: 'Mew-Pack',
    themeColor: '#06b6d4',
    accentBg: 'from-teal-500/25 via-cyan-600/30 to-pink-950/90',
    image: '/images/packs/pack_mew.png',
    badge: 'Insel-Serie',
    subtitle: 'Mysteriöse Insel'
  }
];

export const BoosterOpeningScreen: React.FC<BoosterOpeningScreenProps> = ({
  allCards,
  onFinish
}) => {
  const [phase, setPhase] = useState<'select' | 'ready_to_tear' | 'tearing' | 'sliding' | 'revealing' | 'summary'>('select');
  const [selectedPackIdx, setSelectedPackIdx] = useState<number>(0);
  const [pulledCards, setPulledCards] = useState<Card[]>([]);
  const [newCardIds, setNewCardIds] = useState<Set<string>>(new Set());
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [currentRevealIdx, setCurrentRevealIdx] = useState<number>(0);
  const [isRainbowActive, setIsRainbowActive] = useState<boolean>(false);

  // 3D Card / Pack tilt coordinates
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const tearTouchStart = useRef<number | null>(null);

  const activePack = PACKS[selectedPackIdx];

  // Start pack selection BGM on mount
  useEffect(() => {
    soundManager.playBgm('pack_menu');
    return () => {
      soundManager.stopBgm();
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 22;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -22;
    setTilt({ x: Math.max(-18, Math.min(18, x)), y: Math.max(-18, Math.min(18, y)) });
  };

  const handlePointerLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleSelectPackToOpen = () => {
    soundManager.playSfx('click');
    soundManager.playBgm('pack_open');
    setPhase('ready_to_tear');
  };

  const executeTear = () => {
    if (phase !== 'ready_to_tear') return;
    setPhase('tearing');
    soundManager.playSfx('pack_tear');

    // Pre-determine which cards are brand new for Levi
    const profile = storageService.loadProfile(allCards);
    const existingIds = new Set(Object.keys(profile.unlockedCards));

    const cards = storageService.generateBoosterCards(allCards);
    setPulledCards(cards);

    const newlyDiscovered = new Set<string>();
    cards.forEach((c) => {
      if (!existingIds.has(c.id)) {
        newlyDiscovered.add(c.id);
      }
    });
    setNewCardIds(newlyDiscovered);

    // After tear animation (650ms), slide the cards out
    setTimeout(() => {
      setPhase('sliding');
      soundManager.playSfx('card_slide');

      // After cards slide out (750ms), enter reveal ceremony
      setTimeout(() => {
        setPhase('revealing');
        setCurrentRevealIdx(0);
        setRevealedIndices([]);
      }, 750);
    }, 650);
  };

  // Touch swipe handling for tear strip
  const handleTearTouchStart = (e: React.TouchEvent) => {
    tearTouchStart.current = e.touches[0].clientX;
  };

  const handleTearTouchEnd = (e: React.TouchEvent) => {
    if (tearTouchStart.current === null) return;
    const diff = e.changedTouches[0].clientX - tearTouchStart.current;
    if (Math.abs(diff) > 40) {
      executeTear();
    }
    tearTouchStart.current = null;
  };

  const handleRevealCard = (idx: number) => {
    if (revealedIndices.includes(idx)) return;

    const nextRevealed = [...revealedIndices, idx];
    setRevealedIndices(nextRevealed);

    const card = pulledCards[idx];
    if (card) {
      soundManager.playSfx('card_flip');
      soundManager.playCry(card.dexId);
      soundManager.speakText(`${card.name}!`);

      // Special presentation for Rare / EX cards
      if (card.isEx || card.stage === 'Rang 2' || card.hp >= 120) {
        setIsRainbowActive(true);
        soundManager.playSfx('rainbow_rare');
        soundManager.playVoice('cheer_super', `Boah Levi! Ein seltenes ${card.name}!`);
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#f43f5e', '#8b5cf6', '#06b6d4', '#10b981']
        });

        setTimeout(() => {
          setIsRainbowActive(false);
        }, 3200);
      }
    }

    if (nextRevealed.length === pulledCards.length) {
      setTimeout(() => {
        setPhase('summary');
        soundManager.playSfx('achievement');
      }, 1400);
    } else {
      setCurrentRevealIdx(idx + 1);
    }
  };

  const profile = storageService.loadProfile(allCards);
  const remainingBoosters = profile.unopenedBoosters;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-3 sm:p-6 select-none overflow-hidden font-sans">
      {/* Dynamic Background Atmosphere */}
      <div className={`absolute inset-0 bg-gradient-to-b ${activePack.accentBg} pointer-events-none transition-all duration-700`} />
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* RAINBOW RAYS BURST OVERLAY FOR EX CARDS */}
      {isRainbowActive && (
        <div className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-500" />
          <div
            className="w-[180vw] h-[180vw] rounded-full opacity-65 animate-[spin_10s_linear_infinite]"
            style={{
              background: 'conic-gradient(from 0deg, #f43f5e, #fbbf24, #10b981, #06b6d4, #8b5cf6, #ec4899, #f43f5e)'
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(2,6,23,0.92)_70%)]" />
        </div>
      )}

      {/* Top Header Bar */}
      <div className="relative z-30 w-full max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-amber-400/50 shadow-xl">
          <PackageOpen className="w-5 h-5 text-amber-400 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider">
              Levis Booster-Vorrat
            </span>
            <span className="text-sm font-extrabold text-white">
              {remainingBoosters} {remainingBoosters === 1 ? 'Pack verfügbar' : 'Packs verfügbar'}
            </span>
          </div>
        </div>

        <button
          onClick={onFinish}
          className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-xl transition-all active:scale-95"
          title="Schließen"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. PHASE: 3D PACK SELECTION CAROUSEL                                     */}
      {/* ========================================================================= */}
      {phase === 'select' && (
        <div className="relative z-20 flex flex-col items-center justify-center gap-5 my-auto w-full max-w-4xl">
          <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-amber-300 bg-amber-400/15 px-3 py-1 rounded-full border border-amber-400/40 shadow-sm">
              Erweiterung: {activePack.subtitle} • {activePack.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              Wähle deinen Booster!
            </h2>
          </div>

          {/* 3D Pack Display Area */}
          <div className="relative flex items-center justify-center gap-4 sm:gap-10 w-full">
            {/* Previous Pack Arrow */}
            <button
              onClick={() => {
                soundManager.playSfx('click');
                setSelectedPackIdx((prev) => (prev === 0 ? PACKS.length - 1 : prev - 1));
              }}
              className="p-3.5 rounded-full bg-slate-900/85 border border-slate-700 text-amber-400 hover:bg-slate-800 shadow-2xl transition-transform active:scale-90"
              title="Vorheriges Pack"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Active 3D Booster Wrapper */}
            <div
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
              onClick={handleSelectPackToOpen}
              style={{ perspective: '1200px' }}
              className="relative cursor-pointer group"
            >
              <div
                style={{
                  transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
                  transition: 'transform 0.15s ease-out',
                  transformStyle: 'preserve-3d'
                }}
                className="relative w-56 sm:w-64 md:w-72 aspect-[334/644] flex items-center justify-center drop-shadow-[0_25px_35px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-all duration-300"
              >
                {/* Authentic Official Booster Pack Artwork */}
                <img
                  src={activePack.image}
                  alt={activePack.name}
                  className="w-full h-full object-contain pointer-events-none"
                />

                {/* Shimmering Holographic Foil Sheen */}
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-color-dodge opacity-50 group-hover:opacity-90 transition-opacity"
                  style={{
                    background: `linear-gradient(${115 + tilt.x * 2}deg, transparent 25%, rgba(255,255,255,0.7) 48%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.7) 52%, transparent 75%)`
                  }}
                />
              </div>

              {/* Glowing Floor Reflection Spotlight */}
              <div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-44 h-6 rounded-full blur-xl opacity-80"
                style={{ background: activePack.themeColor }}
              />
            </div>

            {/* Next Pack Arrow */}
            <button
              onClick={() => {
                soundManager.playSfx('click');
                setSelectedPackIdx((prev) => (prev === PACKS.length - 1 ? 0 : prev + 1));
              }}
              className="p-3.5 rounded-full bg-slate-900/85 border border-slate-700 text-amber-400 hover:bg-slate-800 shadow-2xl transition-transform active:scale-90"
              title="Nächstes Pack"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>

          {/* 4 Pack Switcher Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {PACKS.map((pack, idx) => (
              <button
                key={pack.id}
                onClick={() => {
                  soundManager.playSfx('click');
                  setSelectedPackIdx(idx);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border transition-all ${
                  idx === selectedPackIdx
                    ? 'bg-amber-400 text-slate-950 font-black border-white shadow-lg scale-105'
                    : 'bg-slate-900/80 text-slate-300 font-bold border-slate-700 hover:bg-slate-800'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: pack.themeColor }} />
                <span className="text-xs sm:text-sm">{pack.name}</span>
              </button>
            ))}
          </div>

          {/* Action Open Button */}
          <button
            onClick={handleSelectPackToOpen}
            className="py-4 px-10 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-xl border-2 border-white shadow-[0_10px_30px_rgba(251,191,36,0.6)] flex items-center gap-3 transition-transform active:scale-95 hover:scale-105"
          >
            <PackageOpen className="w-6 h-6" />
            <span>DIESEN BOOSTER ÖFFNEN! ✨</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PHASE: READY TO TEAR (SWIPE OR TAP)                                    */}
      {/* ========================================================================= */}
      {phase === 'ready_to_tear' && (
        <div className="relative z-20 flex flex-col items-center justify-center gap-6 my-auto w-full max-w-xl">
          <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              {activePack.name} • {activePack.subtitle}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Wische oben zum Aufreißen! ✂️
            </h3>
          </div>

          {/* Centered Pack with Tear Line Guide */}
          <div
            onTouchStart={handleTearTouchStart}
            onTouchEnd={handleTearTouchEnd}
            onClick={executeTear}
            className="relative w-56 sm:w-64 md:w-72 aspect-[334/644] drop-shadow-[0_25px_40px_rgba(0,0,0,0.9)] cursor-pointer group"
          >
            <img src={activePack.image} alt={activePack.name} className="w-full h-full object-contain pointer-events-none" />

            {/* Glowing Perforation Strip */}
            <div className="absolute top-[8%] left-2 right-2 h-10 -translate-y-1/2 flex items-center justify-between px-3 bg-amber-500/35 backdrop-blur-xs rounded-xl border-y-2 border-dashed border-amber-300 shadow-[0_0_15px_#fbbf24] animate-pulse">
              <Scissors className="w-5 h-5 text-amber-200 rotate-90" />
              <span className="text-[11px] font-black uppercase text-amber-200 tracking-wider">
                HIER ENTLANG WISCHEN ➔
              </span>
              <Scissors className="w-5 h-5 text-amber-200 -rotate-90" />
            </div>

            {/* Shimmer Sheen */}
            <div className="absolute inset-0 pointer-events-none mix-blend-color-dodge bg-gradient-to-tr from-transparent via-white/40 to-transparent" />
          </div>

          {/* Alternative Tap Button for 5-Year-Old Levi */}
          <button
            onClick={executeTear}
            className="py-4 px-10 rounded-3xl bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 text-white font-black text-xl border-3 border-white shadow-[0_10px_35px_rgba(244,63,94,0.6)] flex items-center gap-3 transition-transform active:scale-95 animate-bounce"
          >
            <Scissors className="w-6 h-6 rotate-90" />
            <span>JETZT AUFREISSEN! ✂️</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PHASE: TEARING & SLIDING ANIMATION                                     */}
      {/* ========================================================================= */}
      {(phase === 'tearing' || phase === 'sliding') && (
        <div className="relative z-20 flex flex-col items-center justify-center my-auto w-full">
          <div className="relative w-56 sm:w-64 md:w-72 aspect-[334/644] flex items-center justify-center">
            {/* Top Separated Foil Strip flying upwards */}
            <div
              className={`absolute top-0 left-0 right-0 h-[10%] overflow-hidden z-30 transition-all duration-700 ${
                phase === 'tearing'
                  ? 'translate-y-0 opacity-100'
                  : '-translate-y-24 rotate-[-18deg] opacity-0 scale-90'
              }`}
            >
              <img src={activePack.image} alt="Tear top" className="w-full h-[1000%] object-cover object-top" />
            </div>

            {/* Lower Foil Pouch */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-[90%] overflow-hidden z-10 transition-all duration-700 ${
                phase === 'sliding' ? 'translate-y-16 opacity-30 scale-95' : 'translate-y-0 opacity-100'
              }`}
            >
              <img src={activePack.image} alt="Tear body" className="w-full h-[111%] object-cover object-bottom" />
            </div>

            {/* 5 Cards Emerging Upwards */}
            <div
              className={`absolute z-20 transition-all duration-700 ease-out flex items-center justify-center ${
                phase === 'sliding' ? '-translate-y-20 scale-105 opacity-100' : 'translate-y-12 scale-90 opacity-0'
              }`}
            >
              <div className="relative w-48 sm:w-56 aspect-[5/7] rounded-2xl overflow-hidden border-2 border-amber-400 shadow-[0_0_40px_rgba(251,191,36,0.9)] flex flex-col items-center justify-center">
                <img src="/images/cards/card_back.webp" alt="Kartenstapel" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 gap-2">
                  <Sparkles className="w-10 h-10 text-amber-300 animate-spin" />
                  <span className="text-xs font-black uppercase text-amber-300 tracking-widest text-center drop-shadow">
                    5 KARTEN ENTHÜLLT! ⭐
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PHASE: 1-BY-1 CARD REVEAL CEREMONY                                     */}
      {/* ========================================================================= */}
      {phase === 'revealing' && (
        <div className="relative z-30 flex flex-col items-center gap-5 my-auto max-w-4xl w-full">
          <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              {activePack.name} • {activePack.subtitle}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow">
              Karte {currentRevealIdx + 1} von {pulledCards.length}
            </h3>
            <p className="text-sm font-bold text-slate-300">
              Tippe auf die verdeckte Karte, um sie umzudrehen!
            </p>
          </div>

          {/* Cards Focus Stage */}
          <div className="relative flex items-center justify-center min-h-[380px] w-full">
            {pulledCards.map((card, idx) => {
              const isRevealed = revealedIndices.includes(idx);
              const isCurrent = idx === currentRevealIdx;
              const isNew = newCardIds.has(card.id);

              if (!isCurrent && !isRevealed) return null;

              return (
                <div
                  key={idx}
                  onClick={() => handleRevealCard(idx)}
                  className={`transition-all duration-500 transform cursor-pointer ${
                    isCurrent
                      ? 'scale-110 z-30 shadow-[0_0_50px_rgba(251,191,36,0.9)]'
                      : 'opacity-30 scale-85 pointer-events-none'
                  }`}
                >
                  {isRevealed ? (
                    <div className="relative">
                      {isNew && (
                        <div className="absolute -top-3 -right-3 z-30 bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-xl border border-white animate-bounce">
                          NEU! ⭐
                        </div>
                      )}
                      <HoloCard card={card} interactive={true} className="w-48 sm:w-56 aspect-[5/7]" />
                    </div>
                  ) : (
                    /* Facedown Official TCG Pocket Card Back */
                    <div className="relative w-48 sm:w-56 aspect-[5/7] rounded-2xl overflow-hidden border-2 border-amber-300/80 shadow-[0_0_35px_rgba(251,191,36,0.6)] hover:scale-105 active:scale-95 transition-transform group">
                      <img
                        src="/images/cards/card_back.webp"
                        alt="Verdeckte Karte"
                        className="w-full h-full object-cover rounded-2xl pointer-events-none"
                      />
                      {/* Specular Shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent pointer-events-none group-hover:via-white/50 transition-all" />
                      {/* Interactive Prompt Badge */}
                      <div className="absolute bottom-4 left-3 right-3 bg-slate-950/90 py-1.5 px-3 rounded-full border border-amber-400 text-center shadow-lg animate-pulse">
                        <span className="text-xs font-black uppercase text-amber-300 tracking-wider block">
                          Tippen zum Aufdecken! ✂️
                        </span>
                        <span className="text-[10px] text-slate-300 font-bold">
                          Karte {idx + 1} von {pulledCards.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress Indicator Dots */}
          <div className="flex items-center gap-2.5">
            {pulledCards.map((_, i) => (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  revealedIndices.includes(i)
                    ? 'bg-amber-400 scale-110 shadow-[0_0_10px_#f59e0b]'
                    : i === currentRevealIdx
                    ? 'bg-white animate-ping'
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PHASE: SUMMARY OF ALL 5 CARDS                                          */}
      {/* ========================================================================= */}
      {phase === 'summary' && (
        <div className="relative z-30 flex flex-col items-center gap-5 my-auto max-w-5xl w-full">
          <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Erfolgreich geöffnet
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-amber-300 drop-shadow">
              Deine 5 neuen Karten! 🎉
            </h2>
            <p className="text-sm font-bold text-slate-300">
              Alle Karten wurden deinem Pokémon-Sammelalbum gutgeschrieben.
            </p>
          </div>

          {/* 5 Cards Trophy Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2">
            {pulledCards.map((card, i) => {
              const isNew = newCardIds.has(card.id);
              return (
                <div key={i} className="relative transform hover:scale-105 transition-transform">
                  {isNew && (
                    <div className="absolute -top-2 -right-2 z-20 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow border border-white">
                      NEU!
                    </div>
                  )}
                  <CardView card={card} size="bench" />
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-md justify-center">
            {remainingBoosters > 0 && (
              <button
                onClick={() => {
                  soundManager.playSfx('click');
                  soundManager.playBgm('pack_menu');
                  setPhase('select');
                }}
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-base shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-95 hover:scale-105"
              >
                <PackageOpen className="w-5 h-5" />
                <span>Nächsten Booster öffnen ({remainingBoosters})</span>
              </button>
            )}

            <button
              onClick={onFinish}
              className="py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-base border border-slate-600 shadow flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>Zurück zur Übersicht</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Spacer */}
      <div className="h-2" />
    </div>
  );
};
