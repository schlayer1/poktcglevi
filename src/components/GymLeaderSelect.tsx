import React, { useState } from 'react';
import { Card, PokemonType } from '../types/game';
import { EnergyBadge } from './EnergyBadge';
import { ArrowLeft, Play, Sparkles } from 'lucide-react';
import { soundManager } from '../services/soundManager';
import { DeckInfo } from './DeckSelectionModal';

interface GymLeaderSelectProps {
  decks: DeckInfo[];
  allCards: Record<string, Card>;
  onBack: () => void;
  onConfirm: (config: {
    p1DeckId: string;
    p2DeckId: string;
    opponentName: string;
    opponentAvatar: string;
    arena: 'rocko' | 'misty' | 'majorbob' | 'erika' | 'gary';
  }) => void;
}

export const GymLeaderSelect: React.FC<GymLeaderSelectProps> = ({
  decks,
  allCards,
  onBack,
  onConfirm
}) => {
  const [selectedP1Deck, setSelectedP1Deck] = useState<string>(decks[0]?.id || 'deck_feuer');
  const [selectedLeaderIdx, setSelectedLeaderIdx] = useState<number>(0);

  const leaders = [
    {
      id: 'rocko',
      name: 'Rocko',
      title: 'Marmoria City Arena',
      avatar: 'rocko',
      type: 'Kampf' as PokemonType,
      aceDexId: 95, // Onix
      deckId: 'deck_pflanze',
      arena: 'rocko' as const,
      voiceKey: 'vs_rocko',
      desc: 'Felsen-Pokémon'
    },
    {
      id: 'misty',
      name: 'Misty',
      title: 'Azuria City Arena',
      avatar: 'misty',
      type: 'Wasser' as PokemonType,
      aceDexId: 120, // Sterndu
      deckId: 'deck_wasser',
      arena: 'misty' as const,
      voiceKey: 'vs_misty',
      desc: 'Wasser-Pokémon'
    },
    {
      id: 'majorbob',
      name: 'Major Bob',
      title: 'Orania City Arena',
      avatar: 'majorbob',
      type: 'Elektro' as PokemonType,
      aceDexId: 26, // Raichu
      deckId: 'deck_elektro',
      arena: 'majorbob' as const,
      voiceKey: 'vs_majorbob',
      desc: 'Elektro-Pokémon'
    },
    {
      id: 'erika',
      name: 'Erika',
      title: 'Prismania City Arena',
      avatar: 'erika',
      type: 'Pflanze' as PokemonType,
      aceDexId: 44, // Duflor
      deckId: 'deck_pflanze',
      arena: 'erika' as const,
      voiceKey: 'vs_erika',
      desc: 'Pflanzen-Pokémon'
    },
    {
      id: 'gary',
      name: 'Gary',
      title: 'Indigo Plateau Champion',
      avatar: 'gary',
      type: 'Farblos' as PokemonType,
      aceDexId: 9, // Turtok
      deckId: 'deck_wasser',
      arena: 'gary' as const,
      voiceKey: 'vs_gary',
      desc: 'Rivale'
    }
  ];

  const currentLeader = leaders[selectedLeaderIdx];

  const handleSelectLeader = (idx: number) => {
    setSelectedLeaderIdx(idx);
    const l = leaders[idx];
    soundManager.playSfx('button');
    soundManager.playVoice(l.voiceKey, `${l.name} fordert dich heraus!`);
  };

  const handleStart = () => {
    soundManager.playSfx('button');
    onConfirm({
      p1DeckId: selectedP1Deck,
      p2DeckId: currentLeader.deckId,
      opponentName: currentLeader.name,
      opponentAvatar: currentLeader.avatar,
      arena: currentLeader.arena
    });
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-slate-900 to-slate-950 pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-20 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 border-2 border-slate-700 text-white font-extrabold text-sm hover:bg-slate-800 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-amber-400" />
          <span>Zurück</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-black text-amber-300 drop-shadow">
          Arenaleiter herausfordern
        </h1>

        <div className="w-20" />
      </div>

      {/* Center: Gym Leader Showcase Carousel */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center gap-4">
        {/* Active Gym Leader Card Showcase */}
        <div className="w-full bg-slate-900/90 border-3 border-amber-400/80 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Trainer Portrait & Emblem */}
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-3 border-amber-400 bg-slate-950 p-2 shadow-xl flex items-center justify-center">
              <img
                src={`/images/trainers/${currentLeader.avatar}.png`}
                alt={currentLeader.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {currentLeader.name}
                </h2>
                <EnergyBadge type={currentLeader.type} size="md" />
              </div>
              <span className="text-sm font-bold text-amber-300/90 block">
                {currentLeader.title}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Spezialität: {currentLeader.desc}
              </span>
            </div>
          </div>

          {/* Ace Pokémon Preview */}
          <div className="flex items-center gap-3 bg-slate-950/70 px-4 py-2.5 rounded-2xl border border-slate-700">
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
              <img
                src={`/images/pokemon/${currentLeader.aceDexId}.png`}
                alt="Partner-Pokémon"
                className="w-full h-full object-contain filter drop-shadow"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black block">
                Partner-Pokémon
              </span>
              <span className="font-extrabold text-white text-sm">
                Stufe 1 Deck
              </span>
            </div>
          </div>
        </div>

        {/* Carousel Thumbnails */}
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1 px-2 w-full justify-center">
          {leaders.map((leader, idx) => {
            const isSelected = idx === selectedLeaderIdx;
            return (
              <div
                key={leader.id}
                onClick={() => handleSelectLeader(idx)}
                className={`p-2.5 rounded-2xl border-2 flex flex-col items-center cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105'
                    : 'bg-slate-900/60 border-slate-700 hover:border-slate-500 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-950 p-1 flex items-center justify-center">
                  <img
                    src={`/images/trainers/${leader.avatar}.png`}
                    alt={leader.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-black text-xs text-white mt-1">
                  {leader.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Levi Deck Choice Pills */}
        <div className="w-full bg-slate-900/70 p-3.5 rounded-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-amber-300">
            Dein Starterdeck:
          </span>
          <div className="flex flex-wrap gap-2 justify-center">
            {decks.map((deck) => {
              const isSelected = selectedP1Deck === deck.id;
              return (
                <button
                  key={deck.id}
                  onClick={() => {
                    soundManager.playSfx('button');
                    setSelectedP1Deck(deck.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-white shadow-md scale-105'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <EnergyBadge type={deck.type} size="sm" />
                  <span>{deck.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="relative z-20 flex justify-center pb-2">
        <button
          onClick={handleStart}
          className="w-full max-w-md py-4 px-8 rounded-3xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xl border-3 border-white shadow-[0_0_25px_rgba(251,191,36,0.8)] flex items-center justify-center gap-3 transition-transform active:scale-95 animate-bounce"
        >
          <Play className="w-7 h-7 fill-current" />
          <span>HERAUSFORDERN! ⚡</span>
        </button>
      </div>
    </div>
  );
};
