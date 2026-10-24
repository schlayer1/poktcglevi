import React, { useState, useEffect } from 'react';
import { Card, GameState } from './types/game';
import { createInitialGameState } from './engine/gameEngine';
import { BattleBoard } from './components/BattleBoard';
import { DeckSelectionModal, DeckInfo } from './components/DeckSelectionModal';
import { Sparkles, Loader2 } from 'lucide-react';
import { soundManager } from './services/soundManager';

export const App: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(10);
  const [cardsMap, setCardsMap] = useState<Record<string, Card>>({});
  const [decks, setDecks] = useState<DeckInfo[]>([]);
  const [currentMatch, setCurrentMatch] = useState<GameState | null>(null);

  // Load cards and decks data
  useEffect(() => {
    async function initData() {
      try {
        setLoadProgress(30);
        const [cardsRes, decksRes] = await Promise.all([
          fetch('/data/cards.json'),
          fetch('/data/decks.json')
        ]);

        setLoadProgress(60);
        const cardsList: Card[] = await cardsRes.json();
        const decksList: DeckInfo[] = await decksRes.json();

        const map: Record<string, Card> = {};
        cardsList.forEach((c) => {
          map[c.id] = c;
        });

        setCardsMap(map);
        setDecks(decksList);
        setLoadProgress(100);

        setTimeout(() => {
          setLoading(false);
          soundManager.playVoice('welcome', 'Hallo Levi! Bist du bereit für den Pokémon-Kampf?');
        }, 500);
      } catch (e) {
        console.error('Failed to load card data:', e);
        setLoading(false);
      }
    }

    initData();
  }, []);

  const handleStartMatch = (config: {
    mode: 'solo' | 'pvp';
    p1DeckId: string;
    p2DeckId: string;
    opponentName: string;
    opponentAvatar: string;
  }) => {
    const deck1 = decks.find((d) => d.id === config.p1DeckId) || decks[0];
    const deck2 = decks.find((d) => d.id === config.p2DeckId) || decks[1];

    const p1Cards: Card[] = deck1.cards
      .map((cid) => cardsMap[cid])
      .filter((c): c is Card => !!c);

    const p2Cards: Card[] = deck2.cards
      .map((cid) => cardsMap[cid])
      .filter((c): c is Card => !!c);

    const initial = createInitialGameState(p1Cards, p2Cards, {
      p1Name: 'Levi',
      p2Name: config.opponentName,
      p1Avatar: 'levi',
      p2Avatar: config.opponentAvatar,
      gameMode: config.mode
    });

    setCurrentMatch(initial);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center gap-5 p-4 text-white select-none">
        {/* Animated Pokéball */}
        <div className="relative w-28 h-28 rounded-full border-4 border-slate-900 bg-gradient-to-b from-rose-600 via-rose-600 to-white shadow-2xl flex items-center justify-center animate-spin">
          <div className="absolute w-full h-3 bg-slate-900" />
          <div className="w-9 h-9 rounded-full bg-white border-4 border-slate-900 flex items-center justify-center shadow">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 border-2 border-slate-900" />
          </div>
        </div>

        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-black text-amber-300 drop-shadow">
            Pokémon-Karten laden...
          </h2>
          <div className="w-64 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-300"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <span className="text-xs text-slate-400 font-bold">{loadProgress}% geladen</span>
        </div>
      </div>
    );
  }

  if (currentMatch) {
    return (
      <BattleBoard
        initialState={currentMatch}
        onExitMatch={() => setCurrentMatch(null)}
      />
    );
  }

  return (
    <DeckSelectionModal
      decks={decks}
      allCards={cardsMap}
      onStartMatch={handleStartMatch}
    />
  );
};
