import React, { useState, useEffect } from 'react';
import { Card, GameState } from './types/game';
import { createInitialGameState } from './engine/gameEngine';
import { TitleScreen } from './components/TitleScreen';
import { MainMenu } from './components/MainMenu';
import { ArenaMapScreen } from './components/ArenaMapScreen';
import { AlbumScreen } from './components/AlbumScreen';
import { BoosterOpeningScreen } from './components/BoosterOpeningScreen';
import { DeckBuilderScreen } from './components/DeckBuilderScreen';
import { VsIntro } from './components/VsIntro';
import { BattleBoard } from './components/BattleBoard';
import { DeckSelectionModal, DeckInfo } from './components/DeckSelectionModal';
import { ArenaType } from './components/ArenaBackground';
import { BadgeType } from './components/GymBadge';
import { storageService } from './services/storageService';
import { soundManager } from './services/soundManager';

type AppScreen =
  | 'loading'
  | 'title'
  | 'menu'
  | 'arena_map'
  | 'album'
  | 'deck_builder'
  | 'booster_opening'
  | 'pvp_select'
  | 'vs_intro'
  | 'battle';

interface MatchConfig {
  mode: 'solo' | 'pvp';
  p1DeckId: string;
  p2DeckId: string;
  opponentName: string;
  opponentAvatar: string;
  arena: ArenaType;
  gymBadgeId?: BadgeType;
}

export const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('loading');
  const [loadProgress, setLoadProgress] = useState<number>(15);
  const [cardsMap, setCardsMap] = useState<Record<string, Card>>({});
  const [allCardsList, setAllCardsList] = useState<Card[]>([]);
  const [decks, setDecks] = useState<DeckInfo[]>([]);

  const [pendingMatchConfig, setPendingMatchConfig] = useState<MatchConfig | null>(null);
  const [currentMatch, setCurrentMatch] = useState<GameState | null>(null);

  // Load cards and decks
  useEffect(() => {
    async function initData() {
      try {
        setLoadProgress(35);
        const [cardsRes, decksRes] = await Promise.all([
          fetch('/data/cards.json'),
          fetch('/data/decks.json')
        ]);

        setLoadProgress(70);
        const cardsList: Card[] = await cardsRes.json();
        const decksList: DeckInfo[] = await decksRes.json();

        const map: Record<string, Card> = {};
        cardsList.forEach((c) => {
          map[c.id] = c;
        });

        setCardsMap(map);
        setAllCardsList(cardsList);
        setDecks(decksList);

        // Initialize user savegame profile
        storageService.loadProfile(cardsList);

        setLoadProgress(100);

        setTimeout(() => {
          setScreen('title');
        }, 400);
      } catch (e) {
        console.error('Failed to load card data:', e);
        setScreen('title');
      }
    }

    initData();
  }, []);

  const handleStartMatch = (config: MatchConfig) => {
    setPendingMatchConfig(config);

    const profile = storageService.loadProfile(allCardsList);

    // Get cards for P1 (either from custom deck or starter deck)
    let p1Cards: Card[] = [];
    if (profile.customDecks.length > 0 && config.p1DeckId === profile.customDecks[0].id) {
      p1Cards = profile.customDecks[0].cards.map((id) => cardsMap[id]).filter((c): c is Card => !!c);
    } else {
      const deck1 = decks.find((d) => d.id === config.p1DeckId) || decks[0];
      p1Cards = deck1.cards.map((cid) => cardsMap[cid]).filter((c): c is Card => !!c);
    }

    const deck2 = decks.find((d) => d.id === config.p2DeckId) || decks[1];
    const p2Cards: Card[] = deck2.cards.map((cid) => cardsMap[cid]).filter((c): c is Card => !!c);

    const initial = createInitialGameState(p1Cards, p2Cards, {
      p1Name: 'Levi',
      p2Name: config.opponentName,
      p1Avatar: 'levi',
      p2Avatar: config.opponentAvatar,
      gameMode: config.mode,
      ruleLevel: profile.ruleLevel
    });

    setCurrentMatch(initial);
    setScreen('vs_intro');
  };

  if (screen === 'loading') {
    return (
      <div className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center gap-5 p-4 text-white select-none">
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

  if (screen === 'title') {
    return <TitleScreen onStart={() => setScreen('menu')} />;
  }

  if (screen === 'menu') {
    return (
      <MainMenu
        onSelectSolo={() => setScreen('arena_map')}
        onSelectPvP={() => setScreen('pvp_select')}
        onSelectAlbum={() => setScreen('album')}
        onOpenDeckBuilder={() => setScreen('deck_builder')}
        onOpenBoosters={() => setScreen('booster_opening')}
      />
    );
  }

  if (screen === 'arena_map') {
    return (
      <ArenaMapScreen
        onBack={() => setScreen('menu')}
        onSelectGym={(gym) => {
          const profile = storageService.loadProfile(allCardsList);
          handleStartMatch({
            mode: 'solo',
            p1DeckId: profile.activeDeckId || 'deck_feuer',
            p2DeckId: gym.opponentDeckId,
            opponentName: gym.opponentName,
            opponentAvatar: gym.opponentAvatar,
            arena: gym.arena,
            gymBadgeId: gym.badgeId
          });
        }}
      />
    );
  }

  if (screen === 'album') {
    return (
      <AlbumScreen
        allCards={allCardsList}
        onBack={() => setScreen('menu')}
        onOpenBooster={() => setScreen('booster_opening')}
      />
    );
  }

  if (screen === 'deck_builder') {
    return (
      <DeckBuilderScreen
        allCards={allCardsList}
        onBack={() => setScreen('menu')}
        onPlayWithDeck={(deckCards) => {
          setScreen('arena_map');
        }}
      />
    );
  }

  if (screen === 'booster_opening') {
    return (
      <BoosterOpeningScreen
        allCards={allCardsList}
        onFinish={() => setScreen('album')}
      />
    );
  }

  if (screen === 'pvp_select') {
    return (
      <DeckSelectionModal
        decks={decks}
        allCards={cardsMap}
        onStartMatch={(cfg) => {
          handleStartMatch({
            ...cfg,
            arena: 'papa'
          });
        }}
      />
    );
  }

  if (screen === 'vs_intro' && pendingMatchConfig) {
    return (
      <VsIntro
        p1Name="Levi"
        p1Avatar="levi"
        p2Name={pendingMatchConfig.opponentName}
        p2Avatar={pendingMatchConfig.opponentAvatar}
        onFinish={() => setScreen('battle')}
      />
    );
  }

  if (screen === 'battle' && currentMatch && pendingMatchConfig) {
    return (
      <BattleBoard
        initialState={currentMatch}
        arena={pendingMatchConfig.arena}
        gymBadgeId={pendingMatchConfig.gymBadgeId}
        allCards={allCardsList}
        onExitMatch={() => {
          soundManager.stopBgm();
          soundManager.playBgm('menu');
          setScreen('menu');
        }}
        onOpenBooster={() => {
          soundManager.stopBgm();
          setScreen('booster_opening');
        }}
      />
    );
  }

  return null;
};
