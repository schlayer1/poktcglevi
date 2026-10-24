import React, { useState } from 'react';
import { Card, PokemonType } from '../types/game';
import { CardView } from './CardView';
import { CardDetailModal } from './CardDetailModal';
import { EnergyBadge } from './EnergyBadge';
import { storageService } from '../services/storageService';
import { soundManager } from '../services/soundManager';
import { ArrowLeft, BookOpen, Sparkles, Filter, PackageOpen } from 'lucide-react';

interface AlbumScreenProps {
  allCards: Card[];
  onBack: () => void;
  onOpenBooster: () => void;
}

export const AlbumScreen: React.FC<AlbumScreenProps> = ({
  allCards,
  onBack,
  onOpenBooster
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);

  const profile = storageService.loadProfile(allCards);
  const unlockedMap = profile.unlockedCards;

  // Filter out duplicate card entries for the 151 dex binder (pick first card per dexId)
  const dexMap: Record<number, Card> = {};
  allCards.forEach((c) => {
    if (c.dexId >= 1 && c.dexId <= 151 && !dexMap[c.dexId]) {
      dexMap[c.dexId] = c;
    }
  });

  const kantoDexList = Object.values(dexMap).sort((a, b) => a.dexId - b.dexId);
  const totalOwnedCount = kantoDexList.filter((c) => (unlockedMap[c.id] || 0) > 0).length;
  const progressPercent = Math.round((totalOwnedCount / 151) * 100);

  // Apply filter
  const filteredList = kantoDexList.filter((c) => {
    if (selectedType === 'all') return true;
    if (selectedType === 'ex') return c.isEx;
    if (selectedType === 'missing') return (unlockedMap[c.id] || 0) === 0;
    return c.types.includes(selectedType as PokemonType);
  });

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col justify-between p-3 sm:p-6 select-none">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-slate-900 to-slate-950 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-20 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 sm:p-4 rounded-3xl border border-slate-700 shadow-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-black text-xs sm:text-sm transition-transform active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Zurück</span>
          </button>

          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h1 className="text-lg sm:text-xl font-black text-white">
              Levis Sammelalbum
            </h1>
          </div>
        </div>

        {/* Progress Bar & Booster Button */}
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800">
            <span className="text-xs font-black text-amber-300">
              {totalOwnedCount} / 151
            </span>
            <div className="w-24 sm:w-36 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400">{progressPercent}%</span>
          </div>

          {profile.unopenedBoosters > 0 && (
            <button
              onClick={onOpenBooster}
              className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-1.5 transition-transform active:scale-95 animate-bounce"
            >
              <PackageOpen className="w-4 h-4" />
              <span>{profile.unopenedBoosters} Booster!</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto py-2 px-1 scrollbar-none">
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
        {filteredList.map((card) => {
          const countOwned = unlockedMap[card.id] || 0;
          const isOwned = countOwned > 0;

          return (
            <div
              key={card.id}
              onClick={() => {
                if (isOwned) {
                  soundManager.playCry(card.dexId);
                  soundManager.speakText(`${card.name}! Du besitzt diese Karte ${countOwned} Mal!`);
                  setInspectedCard(card);
                } else {
                  soundManager.playSfx('button');
                  soundManager.speakText(`Pokémon Nummer ${card.dexId}. Noch nicht entdeckt! Öffne Booster-Packs, um es zu finden!`);
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
