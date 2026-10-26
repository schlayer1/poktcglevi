import React, { useState, useEffect } from 'react';
import { Card } from '../types/game';
import { ArenaBackground, ArenaType } from './ArenaBackground';
import { EnergyBadge } from './EnergyBadge';
import { soundManager } from '../services/soundManager';
import { Sparkles, Swords, CheckCircle2 } from 'lucide-react';

interface StarterSelectionModalProps {
  playerName: string;
  playerAvatar: string;
  basisCards: Card[];
  currentActiveCard: Card;
  arena: ArenaType;
  onConfirm: (chosenCard: Card) => void;
}

export const StarterSelectionModal: React.FC<StarterSelectionModalProps> = ({
  playerName,
  playerAvatar,
  basisCards,
  currentActiveCard,
  arena,
  onConfirm
}) => {
  // Pre-select current active or first basis card
  const [selectedCardId, setSelectedCardId] = useState<string>(
    currentActiveCard?.id || basisCards[0]?.id || ''
  );

  const isPapa = playerName === 'Papa';

  useEffect(() => {
    // Play voiceover prompt
    const voiceKey = isPapa ? 'prompt_choose_active_papa' : 'prompt_choose_active';
    const text = isPapa
      ? 'Papa, wähle dein Start-Pokémon für den Kampf!'
      : 'Wähle dein Start-Pokémon für den Kampf!';
    soundManager.playVoice(voiceKey, text);
  }, [isPapa]);

  const selectedCard = basisCards.find((c) => c.id === selectedCardId) || basisCards[0];

  const handleSelect = (card: Card) => {
    soundManager.playSfx('click');
    soundManager.playCry(card.dexId);
    setSelectedCardId(card.id);
  };

  const handleConfirm = () => {
    if (!selectedCard) return;
    soundManager.playSfx('card_slide');
    soundManager.playVoice('starter_selected', 'Gute Wahl! Auf in den Kampf!');
    onConfirm(selectedCard);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-safe select-none overflow-hidden font-sans">
      {/* 1. Arena Backdrop */}
      <ArenaBackground arena={arena} />

      {/* 2. Top Header Bar */}
      <div className="relative z-20 w-full max-w-4xl flex items-center justify-between px-3 pt-2 sm:pt-4">
        <div className="flex items-center gap-2.5 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 sm:py-2 rounded-2xl border-2 border-amber-400 shadow-xl">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-white bg-slate-950 overflow-hidden flex items-center justify-center shadow shrink-0">
            <img
              src={`/images/trainers/${playerAvatar}.png`}
              alt={playerName}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-black uppercase text-amber-300 tracking-wider block">
              {isPapa ? 'Zweiter Spieler' : 'Pokémontrainer'}
            </span>
            <span className="text-base sm:text-xl font-black text-white drop-shadow">
              {playerName}
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-amber-400/20 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/50 shadow">
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
          <span className="text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-widest">
            Runde 1 Vorbereitung
          </span>
        </div>
      </div>

      {/* 3. Center: Title & Basis Cards Lineup */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto w-full max-w-4xl px-2 gap-3 sm:gap-5">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            Wähle dein Start-Pokémon! ⚡
          </h2>
          <p className="text-xs sm:text-sm font-bold text-amber-200 drop-shadow">
            Tippe auf das Pokémon, das als Erstes vorne in den Kampfring steigen soll:
          </p>
        </div>

        {/* Cards Row (Horizontally centered and responsive) */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-5 flex-wrap max-w-full px-2 py-2">
          {basisCards.map((card) => {
            const isSelected = card.id === selectedCardId;
            return (
              <div
                key={card.id}
                onClick={() => handleSelect(card)}
                className={`relative w-32 xs:w-36 sm:w-44 md:w-48 aspect-[5/7] rounded-2xl cursor-pointer transition-all duration-300 transform ${
                  isSelected
                    ? '-translate-y-3 sm:-translate-y-4 scale-105 shadow-[0_0_35px_rgba(251,191,36,0.95)] z-20'
                    : 'opacity-85 hover:opacity-100 hover:scale-102 hover:-translate-y-1 z-10'
                }`}
              >
                {/* Selection Badge */}
                {isSelected && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-lg border border-white flex items-center gap-1 animate-bounce">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>START-POKÉMON</span>
                  </div>
                )}

                {/* Card Frame */}
                <div
                  className={`w-full h-full rounded-2xl overflow-hidden border-3 bg-slate-900 transition-all ${
                    isSelected
                      ? 'border-amber-300 ring-4 ring-amber-400/80'
                      : 'border-slate-600 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={card.artworkUrl}
                    alt={card.name}
                    className="w-full h-full object-cover rounded-2xl pointer-events-none"
                  />

                  {/* Top Bar: HP and Energy Type */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none">
                    <span className="bg-slate-950/85 text-emerald-400 font-black text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md border border-slate-700">
                      {card.hp} KP
                    </span>
                    <EnergyBadge type={card.types[0] || 'Farblos'} size="sm" />
                  </div>

                  {/* Bottom Bar: Name & Attacks Preview */}
                  <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-xs p-1.5 sm:p-2 border-t border-slate-700 text-center">
                    <span className="font-black text-xs sm:text-sm text-white block truncate">
                      {card.name}
                    </span>
                    {card.attacks[0] && (
                      <span className="text-[10px] sm:text-[11px] text-amber-300 font-extrabold truncate block">
                        ⚔️ {card.attacks[0].name} ({card.attacks[0].damage || 0})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Bottom Action Button */}
      <div className="relative z-20 w-full max-w-md px-4 pb-4 sm:pb-6 flex flex-col items-center gap-2">
        {selectedCard && (
          <button
            onClick={handleConfirm}
            className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base sm:text-lg border-2 border-white shadow-[0_10px_30px_rgba(251,191,36,0.7)] flex items-center justify-center gap-2.5 transition-transform active:scale-95 animate-bounce cursor-pointer"
          >
            <Swords className="w-5 h-5 sm:w-6 sm:h-6" />
            <span>MIT {selectedCard.name.toUpperCase()} KÄMPFEN! ⚡</span>
          </button>
        )}
      </div>
    </div>
  );
};
