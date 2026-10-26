import React, { useState } from 'react';
import { Card, PokemonType } from '../types/game';
import { CardView } from './CardView';
import { EnergyBadge } from './EnergyBadge';
import { CardDetailModal } from './CardDetailModal';
import { storageService, UserDeck } from '../services/storageService';
import { soundManager } from '../services/soundManager';
import { ArrowLeft, Wand2, Plus, Minus, Save, Play, Sparkles, Info, ShieldCheck } from 'lucide-react';

interface DeckBuilderScreenProps {
  allCards: Card[];
  onBack: () => void;
  onPlayWithDeck: (deckCards: Card[]) => void;
  onOpenSettings?: () => void;
}

export const DeckBuilderScreen: React.FC<DeckBuilderScreenProps> = ({
  allCards,
  onBack,
  onPlayWithDeck,
  onOpenSettings
}) => {
  const profile = storageService.loadProfile(allCards);
  const unlocked = profile.unlockedCards;
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);

  const cardMap = React.useMemo(() => {
    const map: Record<string, Card> = {};
    allCards.forEach((c) => (map[c.id] = c));
    return map;
  }, [allCards]);

  // Initial deck setup
  const [deckCardIds, setDeckCardIds] = useState<string[]>(() => {
    if (profile.customDecks.length > 0) {
      return [...profile.customDecks[0].cards];
    }
    // Default to first 20 owned basis cards
    const initial: string[] = [];
    allCards.forEach((c) => {
      if ((unlocked[c.id] || 0) > 0 && initial.length < 20) {
        initial.push(c.id);
        if ((unlocked[c.id] || 0) > 1 && initial.length < 20) {
          initial.push(c.id);
        }
      }
    });
    return initial;
  });

  const [deckName, setDeckName] = useState<string>('Levis Meisterdeck');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  const deckCards = deckCardIds.map((id) => cardMap[id]).filter((c): c is Card => !!c);
  const isComplete = deckCards.length === 20;

  // Add card to deck
  const handleAddCard = (card: Card) => {
    if (deckCardIds.length >= 20) {
      soundManager.playVoice('deck_limit', 'Dein Deck hat schon zwanzig Karten!');
      return;
    }
    const currentCount = deckCardIds.filter((id) => id === card.id).length;
    const maxOwned = unlocked[card.id] || 0;
    if (currentCount >= 2) {
      soundManager.playVoice('deck_max_copies', 'Du darfst höchstens zwei gleiche Karten in deinem Deck haben!');
      return;
    }
    if (currentCount >= maxOwned) {
      soundManager.playVoice('deck_no_more_copies', 'Du hast keine weiteren Kopien dieser Karte!');
      return;
    }

    soundManager.playSfx('card_play');
    setDeckCardIds([...deckCardIds, card.id]);
  };

  // Remove card from deck
  const handleRemoveCard = (index: number) => {
    soundManager.playSfx('button');
    const next = [...deckCardIds];
    next.splice(index, 1);
    setDeckCardIds(next);
  };

  // Auto-Build Deck (Zauber-Deck)
  const handleAutoBuild = (type: PokemonType) => {
    soundManager.playSfx('energy_attach');
    const matching = allCards.filter(
      (c) => (unlocked[c.id] || 0) > 0 && c.types.includes(type)
    );
    const colorless = allCards.filter(
      (c) => (unlocked[c.id] || 0) > 0 && c.types.includes('Farblos')
    );

    const newDeck: string[] = [];
    matching.forEach((c) => {
      if (newDeck.length < 14) newDeck.push(c.id);
      if (newDeck.length < 14 && (unlocked[c.id] || 0) > 1) newDeck.push(c.id);
    });
    colorless.forEach((c) => {
      if (newDeck.length < 20) newDeck.push(c.id);
    });

    // Fill remaining if needed
    allCards.forEach((c) => {
      if ((unlocked[c.id] || 0) > 0 && newDeck.length < 20) {
        newDeck.push(c.id);
      }
    });

    setDeckCardIds(newDeck.slice(0, 20));
    setDeckName(`Levis ${type}-Deck`);
    soundManager.playVoice('deck_saved', 'Super gemacht, Levi! Dein neues Zauber-Deck ist bereit!');
  };

  const handleSaveAndPlay = () => {
    if (!isComplete) return;

    soundManager.playSfx('button');
    // Save to profile
    const customDeck: UserDeck = {
      id: 'custom_deck_1',
      name: deckName,
      type: deckCards[0]?.types[0] || 'Feuer',
      aceName: deckCards[0]?.name || 'Glumanda',
      coverCardId: deckCards[0]?.id || '',
      cards: deckCardIds
    };
    profile.customDecks = [customDeck];
    profile.activeDeckId = customDeck.id;
    storageService.saveProfile(profile);

    onPlayWithDeck(deckCards);
  };

  // Owned cards available
  const availableCards = allCards.filter((c) => {
    const owned = (unlocked[c.id] || 0) > 0;
    if (!owned) return false;
    if (selectedTypeFilter === 'all') return true;
    return c.types.includes(selectedTypeFilter as PokemonType);
  });

  return (
    <div className="relative w-full h-full h-dvh bg-slate-950 overflow-hidden flex flex-col justify-between p-safe select-none">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/arenas/stadium.webp"
          alt="Deckbau Backdrop"
          className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-[1.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/70 via-slate-900/90 to-slate-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,6,23,0.85)_85%)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header */}
      <div className="relative z-20 flex items-center justify-between bg-slate-900/90 backdrop-blur-md p-2 sm:p-3 rounded-2xl border border-slate-700 shadow-xl flex-wrap sm:flex-nowrap gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs sm:text-sm border border-slate-600 transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          <span>Zurück</span>
        </button>

        {/* Deck Title & Count Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="bg-slate-950 text-amber-300 font-black text-xs sm:text-base px-2.5 py-1 rounded-xl border border-slate-700 text-center max-w-[150px] sm:max-w-none"
          />
          <div
            className={`px-2.5 py-1 rounded-xl font-black text-xs sm:text-sm border-2 whitespace-nowrap ${
              isComplete
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'bg-rose-500/20 text-rose-300 border-rose-400'
            }`}
          >
            {deckCardIds.length} / 20 Karten
          </div>
        </div>

        {/* Magic Auto-Build Buttons & Eltern */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {(['Feuer', 'Wasser', 'Pflanze', 'Elektro'] as PokemonType[]).map((t) => (
            <button
              key={t}
              onClick={() => handleAutoBuild(t)}
              className="p-1 sm:p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 shadow cursor-pointer active:scale-90"
              title={`Zauber-Deck: ${t}`}
            >
              <EnergyBadge type={t} size="sm" />
            </button>
          ))}

          {onOpenSettings && (
            <button
              onClick={() => {
                soundManager.playSfx('button');
                onOpenSettings();
              }}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white transition-transform active:scale-95 cursor-pointer shrink-0"
              title="Elternmodus"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </button>
          )}
        </div>
      </div>

      {/* Center Top: Cards in Deck (20 Slots) */}
      <div className="relative z-10 flex flex-col gap-1.5 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider">
          Dein 20-Karten-Deck (Tippe auf eine Karte zum Entfernen):
        </span>
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none min-h-[110px]">
          {deckCards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => handleRemoveCard(idx)}
              className="relative group shrink-0 w-20 aspect-[5/7] rounded-xl border-2 border-amber-400 bg-slate-950 p-1 flex flex-col items-center justify-between cursor-pointer hover:border-rose-400 hover:scale-105 transition-all shadow"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setInspectedCard(card);
                }}
                className="absolute -top-1.5 -right-1.5 z-20 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow hover:scale-110 active:scale-90"
                title="Karte ansehen & vorlesen"
              >
                <Info className="w-3 h-3 stroke-[3]" />
              </button>
              <span className="text-[9px] font-black text-white truncate w-full text-center">
                {card.name}
              </span>
              <img
                src={card.artworkUrl}
                alt={card.name}
                className="w-10 h-10 object-contain filter drop-shadow"
              />
              <div className="w-full flex items-center justify-between text-[9px] font-black">
                <span className="text-emerald-400">{card.hp} KP</span>
                <EnergyBadge type={card.types[0] || 'Farblos'} size="sm" />
              </div>
            </div>
          ))}

          {/* Empty Placeholders */}
          {Array.from({ length: Math.max(0, 20 - deckCards.length) }).map((_, i) => (
            <div
              key={i}
              className="shrink-0 w-20 aspect-[5/7] rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/30 flex items-center justify-center text-slate-700 font-black text-xs"
            >
              +
            </div>
          ))}
        </div>
      </div>

      {/* Center Bottom: Owned Collection to pick from */}
      <div className="relative z-10 flex-1 flex flex-col gap-2 overflow-hidden bg-slate-900/40 p-3 rounded-2xl border border-slate-800/80 my-1">
        {/* Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
          <span className="text-[10px] font-black uppercase text-slate-400 mr-1">Filter:</span>
          {['all', 'Feuer', 'Wasser', 'Pflanze', 'Elektro', 'Farblos'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                selectedTypeFilter === t
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'Alle' : t}
            </button>
          ))}
        </div>

        {/* Collection Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 pr-1">
          {availableCards.map((card) => {
            const inDeckCount = deckCardIds.filter((id) => id === card.id).length;
            const maxOwned = unlocked[card.id] || 0;
            const canAdd = inDeckCount < 2 && inDeckCount < maxOwned && deckCardIds.length < 20;

            return (
              <div
                key={card.id}
                onClick={() => canAdd && handleAddCard(card)}
                className={`relative group aspect-[5/7] rounded-xl border-2 p-1 flex flex-col items-center justify-between cursor-pointer transition-all ${
                  canAdd
                    ? 'border-slate-700 bg-slate-900/90 hover:border-amber-400 hover:scale-105 shadow'
                    : 'border-slate-800 bg-slate-950/60 opacity-40 cursor-not-allowed'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectedCard(card);
                  }}
                  className="absolute -top-1.5 -right-1.5 z-20 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow hover:scale-110 active:scale-90"
                  title="Karte ansehen & vorlesen"
                >
                  <Info className="w-3 h-3 stroke-[3]" />
                </button>
                <span className="text-[9px] font-black text-white truncate w-full text-center">
                  {card.name}
                </span>
                <img
                  src={card.artworkUrl}
                  alt={card.name}
                  className="w-10 h-10 object-contain filter drop-shadow"
                />
                <div className="w-full flex items-center justify-between text-[9px] font-bold">
                  <span className="text-amber-400">{inDeckCount}/{maxOwned}</span>
                  <EnergyBadge type={card.types[0] || 'Farblos'} size="sm" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Save & Play Button */}
      <div className="relative z-20 flex justify-center pt-1 pb-safe">
        <button
          disabled={!isComplete}
          onClick={handleSaveAndPlay}
          className={`py-2.5 sm:py-3.5 px-6 sm:px-8 rounded-2xl font-black text-sm sm:text-lg border-2 shadow-2xl flex items-center gap-2 sm:gap-3 transition-transform active:scale-95 ${
            isComplete
              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 border-white shadow-[0_0_25px_rgba(251,191,36,0.8)] animate-bounce cursor-pointer'
              : 'bg-slate-800 text-slate-500 border-slate-700 opacity-40 cursor-not-allowed'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>DECK SPEICHERN & KÄMPFEN! ⚡</span>
        </button>
      </div>

      {/* Card Detail Modal */}
      <CardDetailModal card={inspectedCard} onClose={() => setInspectedCard(null)} />
    </div>
  );
};
