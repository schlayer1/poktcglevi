import React, { useState, useEffect } from 'react';
import { Card, PokemonType } from '../types/game';
import { CardView } from './CardView';
import { CardDetailModal } from './CardDetailModal';
import { EnergyBadge } from './EnergyBadge';
import { storageService } from '../services/storageService';
import { soundManager } from '../services/soundManager';
import { ArrowLeft, BookOpen, Sparkles, Filter, PackageOpen, ShieldCheck } from 'lucide-react';

interface AlbumScreenProps {
  allCards: Card[];
  onBack: () => void;
  onOpenBooster: () => void;
  onOpenSettings?: () => void;
}

export const AlbumScreen: React.FC<AlbumScreenProps> = ({
  allCards,
  onBack,
  onOpenBooster,
  onOpenSettings
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);

  useEffect(() => {
    soundManager.playBgm('menu');
  }, []);

  const profile = storageService.loadProfile(allCards);
  const unlockedMap = profile.unlockedCards;

  // Group all card variants by dexId (e.g. dexId 150 has normal Mewtu, Mewtu-ex, etc.)
  const dexVariantsMap: Record<number, Card[]> = {};
  allCards.forEach((c) => {
    if (c.dexId >= 1 && c.dexId <= 151) {
      if (!dexVariantsMap[c.dexId]) dexVariantsMap[c.dexId] = [];
      dexVariantsMap[c.dexId].push(c);
    }
  });

  interface DexSlotItem {
    dexId: number;
    displayCard: Card;
    totalCount: number;
    isOwned: boolean;
    variants: Card[];
  }

  const kantoDexSlots: DexSlotItem[] = Object.entries(dexVariantsMap)
    .map(([dexIdStr, variants]) => {
      const dexId = Number(dexIdStr);
      const totalCount = variants.reduce((sum, v) => sum + (unlockedMap[v.id] || 0), 0);
      const isOwned = totalCount > 0;

      // Choose the best card to display:
      // 1. If owned, pick the highest rarity/ex owned variant!
      // 2. Otherwise default to the first base variant
      let displayCard = variants[0];
      if (isOwned) {
        const ownedVariants = variants.filter((v) => (unlockedMap[v.id] || 0) > 0);
        ownedVariants.sort((a, b) => {
          if (a.isEx && !b.isEx) return -1;
          if (!a.isEx && b.isEx) return 1;
          return b.hp - a.hp;
        });
        displayCard = ownedVariants[0];
      }

      return {
        dexId,
        displayCard,
        totalCount,
        isOwned,
        variants
      };
    })
    .sort((a, b) => a.dexId - b.dexId);

  const totalOwnedCount = kantoDexSlots.filter((s) => s.isOwned).length;
  const progressPercent = Math.round((totalOwnedCount / 151) * 100);

  // Apply filter
  const filteredList = kantoDexSlots.filter((slot) => {
    if (selectedType === 'all') return true;
    if (selectedType === 'ex') return slot.variants.some((v) => v.isEx && (unlockedMap[v.id] || 0) > 0);
    if (selectedType === 'missing') return !slot.isOwned;
    return slot.displayCard.types.includes(selectedType as PokemonType);
  });

  return (
    <div className="relative w-full h-full h-dvh bg-slate-950 overflow-hidden flex flex-col justify-between p-safe select-none">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/arenas/stadium.webp"
          alt="Archiv Backdrop"
          className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/80 via-slate-900/90 to-slate-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,6,23,0.85)_85%)]" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header Bar */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 bg-slate-900/85 backdrop-blur-md p-2.5 sm:p-4 rounded-3xl border border-slate-700 shadow-xl">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-black text-xs sm:text-sm transition-transform active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>Zurück</span>
          </button>

          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            <h1 className="text-base sm:text-xl font-black text-white">
              Levis Sammelalbum
            </h1>
          </div>
        </div>

        {/* Progress Bar & Booster Button & Eltern */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-2xl border border-slate-800">
            <span className="text-[11px] sm:text-xs font-black text-amber-300">
              {totalOwnedCount} / 151
            </span>
            <div className="w-20 sm:w-36 h-2 sm:h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400">{progressPercent}%</span>
          </div>

          {profile.unopenedBoosters > 0 && (
            <button
              onClick={onOpenBooster}
              className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 transition-transform active:scale-95 animate-bounce cursor-pointer shrink-0"
            >
              <PackageOpen className="w-3.5 h-3.5" />
              <span>{profile.unopenedBoosters} Booster!</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              onClick={() => {
                soundManager.playSfx('button');
                onOpenSettings();
              }}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white transition-transform active:scale-95 cursor-pointer shrink-0"
              title="Elternmodus"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto py-1.5 px-1 scrollbar-none touch-pan-x">
        {[
          { id: 'all', label: 'Alle (151)' },
          { id: 'Feuer', label: 'Feuer 🔥' },
          { id: 'Wasser', label: 'Wasser 💧' },
          { id: 'Pflanze', label: 'Pflanze 🍃' },
          { id: 'Elektro', label: 'Elektro ⚡' },
          { id: 'Psycho', label: 'Psycho 🔮' },
          { id: 'Kampf', label: 'Kampf 🥊' },
          { id: 'Farblos', label: 'Farblos ⭐' },
          { id: 'ex', label: 'Nur EX ✨' },
          { id: 'missing', label: 'Noch gesucht ❓' }
        ].map((tab) => {
          const isSelected = selectedType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundManager.playSfx('button');
                setSelectedType(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl font-black text-xs whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-700/80'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Center: 151 Binder Grid */}
      <div className="relative z-10 flex-1 overflow-y-auto pr-1 py-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
        {filteredList.map((slot) => {
          const card = slot.displayCard;
          const countOwned = slot.totalCount;
          const isOwned = slot.isOwned;

          return (
            <div
              key={card.id}
              onClick={() => {
                if (isOwned) {
                  setInspectedCard(card);
                } else {
                  soundManager.playSfx('button');
                  soundManager.playVoice('album_locked', 'Dieses Pokémon hast du noch nicht entdeckt! Öffne Booster-Packs, um es zu finden!');
                }
              }}
              className={`relative aspect-[5/7] rounded-2xl border-2 flex flex-col items-center justify-between p-2 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                isOwned
                  ? 'bg-slate-900/90 border-amber-400/70 shadow-lg hover:shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                  : 'bg-slate-950/80 border-slate-800 opacity-50 grayscale'
              }`}
            >
              {/* Header: Dex ID & Name / Mystery */}
              <div className="w-full flex items-center justify-between text-[11px] font-black">
                <span className="text-amber-400">#{card.dexId.toString().padStart(3, '0')}</span>
                <span className="text-white truncate max-w-[70%]">
                  {isOwned ? card.name : '???'}
                </span>
              </div>

              {/* Artwork / Silhouette */}
              <div className="relative w-full flex-1 flex items-center justify-center p-1 overflow-hidden">
                <img
                  src={card.artworkUrl}
                  alt={card.name}
                  className={`w-full h-full object-contain filter ${
                    isOwned
                      ? 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]'
                      : 'brightness-0 opacity-20'
                  }`}
                  loading="lazy"
                />

                {!isOwned && (
                  <span className="absolute text-2xl font-black text-slate-600">
                    ?
                  </span>
                )}
              </div>

              {/* Bottom: Count Owned Badge or Type Icon */}
              <div className="w-full flex items-center justify-between pt-1 border-t border-slate-800">
                <EnergyBadge type={card.types[0] || 'Farblos'} size="sm" />
                {isOwned ? (
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                    x{countOwned}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-bold">Fehlt</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Detail Inspector Modal */}
      <CardDetailModal
        card={inspectedCard}
        onClose={() => setInspectedCard(null)}
      />
    </div>
  );
};
