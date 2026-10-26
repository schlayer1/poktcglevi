import React, { useState } from 'react';
import { Card, PokemonType } from '../types/game';
import { EnergyBadge } from './EnergyBadge';
import { Users, User, Play, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react';
import { soundManager } from '../services/soundManager';

export interface DeckInfo {
  id: string;
  name: string;
  trainer: string;
  type: PokemonType;
  aceName: string;
  coverCardId: string;
  cards: string[];
}

interface DeckSelectionModalProps {
  decks: DeckInfo[];
  allCards: Record<string, Card>;
  onStartMatch: (config: {
    mode: 'solo' | 'pvp';
    p1DeckId: string;
    p2DeckId: string;
    opponentName: string;
    opponentAvatar: string;
  }) => void;
  onBack?: () => void;
  onOpenSettings?: () => void;
}

export const DeckSelectionModal: React.FC<DeckSelectionModalProps> = ({
  decks,
  allCards,
  onStartMatch,
  onBack,
  onOpenSettings
}) => {
  const [mode, setMode] = useState<'solo' | 'pvp'>('solo');
  const [selectedP1Deck, setSelectedP1Deck] = useState<string>(decks[0]?.id || 'deck_feuer');
  const [selectedP2Deck, setSelectedP2Deck] = useState<string>(decks[1]?.id || 'deck_wasser');
  const [selectedOpponent, setSelectedOpponent] = useState<{
    id: string;
    name: string;
    avatar: string;
    voiceKey: string;
    deckId: string;
  }>({
    id: 'rocko',
    name: 'Rocko',
    avatar: 'rocko',
    voiceKey: 'vs_rocko',
    deckId: 'deck_pflanze'
  });

  const opponents = [
    { id: 'rocko', name: 'Rocko', avatar: 'rocko', voiceKey: 'vs_rocko', deckId: 'deck_pflanze' },
    { id: 'misty', name: 'Misty', avatar: 'misty', voiceKey: 'vs_misty', deckId: 'deck_wasser' },
    { id: 'majorbob', name: 'Major Bob', avatar: 'majorbob', voiceKey: 'vs_majorbob', deckId: 'deck_elektro' },
    { id: 'erika', name: 'Erika', avatar: 'erika', voiceKey: 'vs_erika', deckId: 'deck_pflanze' },
    { id: 'gary', name: 'Gary', avatar: 'gary', voiceKey: 'vs_gary', deckId: 'deck_wasser' }
  ];

  const handleStart = () => {
    soundManager.playSfx('button');
    if (mode === 'solo') {
      soundManager.playVoice(selectedOpponent.voiceKey, `${selectedOpponent.name} fordert dich heraus!`);
      onStartMatch({
        mode: 'solo',
        p1DeckId: selectedP1Deck,
        p2DeckId: selectedOpponent.deckId,
        opponentName: selectedOpponent.name,
        opponentAvatar: selectedOpponent.avatar
      });
    } else {
      soundManager.playVoice('turn_start', 'Das Spiel beginnt!');
      onStartMatch({
        mode: 'pvp',
        p1DeckId: selectedP1Deck,
        p2DeckId: selectedP2Deck,
        opponentName: 'Papa',
        opponentAvatar: 'papa'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex items-center justify-center p-3 sm:p-safe select-none overflow-y-auto">
      {/* Dynamic Arena Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src={mode === 'pvp' ? '/images/arenas/papa.webp' : '/images/arenas/stadium.webp'}
          alt="Arena Backdrop"
          className="w-full h-full object-cover object-center filter brightness-[0.65] contrast-[1.1] transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-slate-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(2,6,23,0.8)_85%)]" />
      </div>

      <div className="relative z-10 max-w-4xl w-full max-h-[92dvh] bg-slate-900/95 backdrop-blur-md border-3 border-amber-400 rounded-3xl p-3.5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col gap-4 sm:gap-5 my-auto overflow-y-auto">
        {/* Navigation Bar inside modal */}
        {(onBack || onOpenSettings) && (
          <div className="flex items-center justify-between w-full">
            {onBack ? (
              <button
                onClick={() => {
                  soundManager.playSfx('button');
                  onBack();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-black text-xs sm:text-sm shadow transition-transform active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span>Zurück</span>
              </button>
            ) : <div />}

            {onOpenSettings && (
              <button
                onClick={() => {
                  soundManager.playSfx('button');
                  onOpenSettings();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-black text-xs sm:text-sm shadow transition-transform active:scale-95 cursor-pointer"
                title="Elternmodus"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden xs:inline">Eltern</span>
              </button>
            )}
          </div>
        )}

        {/* Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/40">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              Pokémon Sammelkartenspiel
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow">
            Wähle dein Deck & Gegner
          </h1>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setMode('solo')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm sm:text-base border-2 transition-all ${
              mode === 'solo'
                ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-105'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Allein spielen (gegen Arena)</span>
          </button>

          <button
            onClick={() => setMode('pvp')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm sm:text-base border-2 transition-all ${
              mode === 'pvp'
                ? 'bg-sky-400 text-slate-950 border-white shadow-[0_0_15px_rgba(56,189,248,0.5)] scale-105'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Zusammen spielen (mit Papa)</span>
          </button>
        </div>

        {/* Section 1: Levi's Deck */}
        <div className="space-y-2">
          <h3 className="text-sm font-extrabold text-amber-300 uppercase tracking-wide flex items-center gap-2">
            <span>🔥 Levis Starterdeck</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {decks.map((deck) => {
              const coverCard = allCards[deck.coverCardId];
              const isSelected = selectedP1Deck === deck.id;

              return (
                <div
                  key={deck.id}
                  onClick={() => {
                    soundManager.playSfx('button');
                    setSelectedP1Deck(deck.id);
                  }}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-102'
                      : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 relative flex items-center justify-center">
                    {coverCard && (
                      <img
                        src={coverCard.artworkUrl}
                        alt={deck.name}
                        className="w-full h-full object-contain filter drop-shadow"
                      />
                    )}
                    <div className="absolute -top-1 -right-1">
                      <EnergyBadge type={deck.type} size="sm" />
                    </div>
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm text-white truncate w-full">
                    {deck.name}
                  </span>
                  <span className="text-[11px] text-amber-300/80 font-bold">
                    {deck.aceName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Opponent / Papa Deck */}
        {mode === 'solo' ? (
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-cyan-300 uppercase tracking-wide flex items-center gap-2">
              <span>🥊 Dein Gegner (Arenaleiter)</span>
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              {opponents.map((opp) => {
                const isSelected = selectedOpponent.id === opp.id;
                return (
                  <div
                    key={opp.id}
                    onClick={() => {
                      soundManager.playSfx('button');
                      setSelectedOpponent(opp);
                    }}
                    className={`p-2.5 rounded-2xl border-2 flex flex-col items-center text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-400/20 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-102'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mb-1.5 flex items-center justify-center overflow-hidden rounded-full bg-slate-950 p-1 border border-slate-700">
                      <img
                        src={`/images/trainers/${opp.avatar}.png`}
                        alt={opp.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="font-extrabold text-xs text-white truncate w-full">
                      {opp.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-cyan-300 uppercase tracking-wide flex items-center gap-2">
              <span>👨 Papas Deck (Zweiter Spieler)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {decks.map((deck) => {
                const coverCard = allCards[deck.coverCardId];
                const isSelected = selectedP2Deck === deck.id;

                return (
                  <div
                    key={deck.id}
                    onClick={() => {
                      soundManager.playSfx('button');
                      setSelectedP2Deck(deck.id);
                    }}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-400/20 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)] scale-102'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 relative flex items-center justify-center">
                      {coverCard && (
                        <img
                          src={coverCard.artworkUrl}
                          alt={deck.name}
                          className="w-full h-full object-contain filter drop-shadow"
                        />
                      )}
                      <div className="absolute -top-1 -right-1">
                        <EnergyBadge type={deck.type} size="sm" />
                      </div>
                    </div>
                    <span className="font-extrabold text-xs sm:text-sm text-white truncate w-full">
                      {deck.name}
                    </span>
                    <span className="text-[11px] text-sky-300/80 font-bold">
                      {deck.aceName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Start Button */}
        <div className="pt-2">
          <button
            onClick={handleStart}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-lg sm:text-xl shadow-2xl flex items-center justify-center gap-3 transition-transform active:scale-95"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>KAMPF STARTEN! ⚡</span>
          </button>
        </div>
      </div>
    </div>
  );
};
