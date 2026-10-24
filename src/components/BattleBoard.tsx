import React, { useState, useEffect, useRef } from 'react';
import { GameState, Card, Action, InPlayPokemon } from '../types/game';
import { getLegalActions, reduceGameState, getAiAction } from '../engine/gameEngine';
import { CardView } from './CardView';
import { EnergyBadge } from './EnergyBadge';
import { PikachuCompanion } from './PikachuCompanion';
import { CardDetailModal } from './CardDetailModal';
import { VictoryModal } from './VictoryModal';
import { ParentSettingsModal } from './ParentSettingsModal';
import { soundManager } from '../services/soundManager';
import { Check, Settings, Sparkles, Shield, Trophy } from 'lucide-react';

interface BattleBoardProps {
  initialState: GameState;
  onExitMatch: () => void;
}

export const BattleBoard: React.FC<BattleBoardProps> = ({
  initialState,
  onExitMatch
}) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [selectedEnergy, setSelectedEnergy] = useState<boolean>(false);
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [aiDifficulty, setAiDifficulty] = useState<'leicht' | 'schlau'>('leicht');

  const p1 = gameState.players[0]; // Levi
  const p2 = gameState.players[1]; // Opponent / Papa
  const activeIdx = gameState.activePlayerIndex;
  const isLeviTurn = activeIdx === 0;

  const legalActions = getLegalActions(gameState);

  // Auto-play voice instructions whenever phase/active player changes
  useEffect(() => {
    if (gameState.winner !== null) return;

    if (gameState.turnPhase === 'promote_needed') {
      soundManager.playVoice('prompt_promote', 'Wähle ein neues Pokémon von deiner Bank!');
      return;
    }

    if (isLeviTurn) {
      if (gameState.turnNumber === 1) {
        soundManager.playVoice('welcome', 'Hallo Levi! Bist du bereit für den Pokémon-Kampf?');
      } else {
        soundManager.playVoice(legalActions.voiceKey || 'turn_start', legalActions.description);
      }
    } else if (gameState.gameMode === 'pvp') {
      soundManager.playVoice('turn_papa', 'Papa ist am Zug!');
    }
  }, [gameState.turnNumber, gameState.activePlayerIndex, gameState.turnPhase]);

  // AI Turn handler for Solo Mode
  useEffect(() => {
    if (gameState.gameMode !== 'solo' || isLeviTurn || gameState.winner !== null) {
      return;
    }

    const timer = setTimeout(() => {
      const aiMove = getAiAction(gameState);
      if (aiMove) {
        // Play action sound / feedback
        if (aiMove.type === 'ATTACK') {
          soundManager.playSfx('attack_hit');
          const atkCard = p2.active?.card;
          if (atkCard) {
            soundManager.speakText(`${p2.name} greift mit ${atkCard.name} an!`);
          }
        } else if (aiMove.type === 'ATTACH_ENERGY') {
          soundManager.playSfx('energy_attach');
        } else if (aiMove.type === 'PLAY_BENCH') {
          soundManager.playSfx('card_play');
        }

        setGameState((prev) => reduceGameState(prev, aiMove));
      } else {
        setGameState((prev) => reduceGameState(prev, { type: 'END_TURN' }));
      }
    }, 1300);

    return () => clearTimeout(timer);
  }, [gameState, isLeviTurn]);

  // Dispatch game action with sounds
  const handleAction = (action: Action) => {
    if (action.type === 'ATTACH_ENERGY') {
      soundManager.playSfx('energy_attach');
      setSelectedEnergy(false);
    } else if (action.type === 'PLAY_BENCH') {
      soundManager.playSfx('card_play');
    } else if (action.type === 'ATTACK') {
      soundManager.playSfx('attack_hit');
      soundManager.playVoice('cheer_attack', 'Klasse Angriff!');
    } else if (action.type === 'END_TURN') {
      soundManager.playSfx('button');
      setSelectedEnergy(false);
    }

    setGameState((prev) => reduceGameState(prev, action));
  };

  // Render 3 Pokeball score stars for each trainer
  const renderPoints = (points: number) => {
    return (
      <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-700 shadow">
        {[1, 2, 3].map((pt) => (
          <div
            key={pt}
            className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black transition-all ${
              pt <= points
                ? 'bg-rose-500 text-white shadow-[0_0_8px_rgba(244,63,94,0.8)] scale-110'
                : 'bg-slate-700 text-slate-500 opacity-40'
            }`}
          >
            ★
          </div>
        ))}
      </div>
    );
  };

  // Render Trainer Header Badge
  const renderTrainerBadge = (
    player: typeof p1,
    isCurrent: boolean,
    isTop: boolean
  ) => {
    return (
      <div
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border-2 transition-all backdrop-blur-md ${
          isCurrent
            ? 'bg-amber-400/25 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
            : 'bg-slate-900/60 border-slate-700/80'
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-slate-950 p-0.5 border border-amber-300/80 overflow-hidden shrink-0">
          <img
            src={`/images/trainers/${player.avatar}.png`}
            alt={player.name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xs sm:text-sm text-white drop-shadow truncate">
            {player.name}
          </span>
          <span className="text-[10px] font-bold text-amber-300">
            {player.deck.length} Karten im Deck
          </span>
        </div>
        {renderPoints(player.points)}
      </div>
    );
  };

  // Energy Zone Component (Large glowing orb)
  const renderEnergyZone = (
    player: typeof p1,
    isTurn: boolean,
    onEnergyClick: () => void
  ) => {
    const hasEnergy = player.energyZone.length > 0 && !gameState.energyAttachedThisTurn;
    const currentEnergy = player.energyZone[0] || 'Feuer';

    return (
      <div className="flex flex-col items-center gap-1 select-none">
        <span className="text-[10px] font-black tracking-wider text-amber-300 uppercase">
          Energie
        </span>
        <div
          onClick={() => {
            if (isTurn && hasEnergy) {
              soundManager.playSfx('button');
              onEnergyClick();
            }
          }}
          className={`relative p-1 rounded-full cursor-pointer transition-all ${
            isTurn && hasEnergy
              ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-105 animate-pulse shadow-[0_0_20px_rgba(251,191,36,0.8)]'
              : 'opacity-40 grayscale'
          }`}
          title="Tippe auf die Energie und dann auf dein Pokémon!"
        >
          <EnergyBadge type={currentEnergy} size="lg" pulse={isTurn && hasEnergy} />
          {hasEnergy && (
            <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full w-5 h-5 flex items-center justify-center border border-white">
              1
            </span>
          )}
        </div>
      </div>
    );
  };

  const isPvP = gameState.gameMode === 'pvp';

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden flex flex-col justify-between p-2 sm:p-3 select-none">
      {/* Background Stadium Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full border-4 border-amber-400" />
        <div className="absolute w-full h-0.5 bg-amber-400" />
      </div>

      {/* Floating Settings Button in Corner */}
      <button
        onClick={() => setShowSettings(true)}
        className="absolute top-2 right-2 z-40 p-2.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 shadow-lg"
        title="Eltern-Einstellungen"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* ============================================================== */}
      {/* TOP HALF: OPPONENT / PAPA                                      */}
      {/* ============================================================== */}
      <div
        className={`relative z-10 flex flex-col justify-between transition-transform duration-300 ${
          isPvP ? 'rotate-180 origin-center' : ''
        }`}
      >
        {/* Opponent Header Bar */}
        <div className="flex items-center justify-between px-2 py-1">
          {renderTrainerBadge(p2, activeIdx === 1, true)}

          {/* Opponent Hand (facedown card backs) */}
          <div className="flex items-center gap-1">
            {p2.hand.map((_, idx) => (
              <div
                key={idx}
                className="w-8 sm:w-10 aspect-[5/7] bg-gradient-to-br from-blue-700 to-indigo-900 rounded-md border border-amber-300/60 shadow-sm"
              />
            ))}
          </div>

          {/* Opponent Energy Zone */}
          {renderEnergyZone(p2, activeIdx === 1, () => {
            if (activeIdx === 1 && isPvP) {
              setSelectedEnergy(true);
            }
          })}
        </div>

        {/* Opponent Bench & Active Pokémon */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 my-1">
          {/* Opponent Bench (3 slots) */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((slotIdx) => {
              const benchMon = p2.bench[slotIdx];
              const isPromotable =
                gameState.turnPhase === 'promote_needed' &&
                activeIdx === 0 &&
                slotIdx < p2.bench.length;

              return (
                <div
                  key={slotIdx}
                  className="w-20 sm:w-24 md:w-28 aspect-[5/7] rounded-2xl border-2 border-dashed border-slate-800 flex items-center justify-center relative"
                >
                  {benchMon ? (
                    <CardView
                      card={benchMon.card}
                      inPlay={benchMon}
                      size="bench"
                      isOpponent={!isPvP}
                      isSelectable={isPromotable}
                      onSelect={() => {
                        if (isPromotable) {
                          handleAction({ type: 'PROMOTE', benchIndex: slotIdx });
                        } else {
                          setInspectedCard(benchMon.card);
                        }
                      }}
                      onInspect={() => setInspectedCard(benchMon.card)}
                    />
                  ) : (
                    <span className="text-[10px] text-slate-700 font-bold">Bank</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Opponent Active Pokémon Spot */}
          <div className="relative">
            <div className="w-32 sm:w-40 md:w-44 aspect-[5/7] rounded-2xl border-2 border-amber-400/40 bg-slate-900/50 flex items-center justify-center relative shadow-inner">
              {p2.active ? (
                <CardView
                  card={p2.active.card}
                  inPlay={p2.active}
                  size="active"
                  isOpponent={!isPvP}
                  onInspect={() => setInspectedCard(p2.active!.card)}
                />
              ) : (
                <span className="text-xs font-bold text-rose-400 animate-pulse">
                  K.O. - Ersatz nötig!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* CENTER: BATTLE ARENA & ACTION STATUS                           */}
      {/* ============================================================== */}
      <div className="relative z-10 flex items-center justify-center py-0.5">
        <div className="bg-slate-950/80 px-4 py-1.5 rounded-full border border-slate-700 shadow-md flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span className="font-extrabold text-xs sm:text-sm text-amber-300">
            {gameState.turnPhase === 'promote_needed'
              ? 'Neues Pokémon auswählen!'
              : isLeviTurn
              ? 'Levi ist dran!'
              : `${p2.name} ist dran!`}
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BOTTOM HALF: LEVI (PLAYER 1)                                   */}
      {/* ============================================================== */}
      <div className="relative z-10 flex flex-col justify-between">
        {/* Levi Active & Bench Pokémon */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 my-1">
          {/* Levi Active Pokémon Spot */}
          <div className="relative">
            <div className="w-32 sm:w-40 md:w-44 aspect-[5/7] rounded-2xl border-2 border-amber-400/40 bg-slate-900/50 flex items-center justify-center relative shadow-inner">
              {p1.active ? (
                <CardView
                  card={p1.active.card}
                  inPlay={p1.active}
                  size="active"
                  canAttack={isLeviTurn && !gameState.attackedThisTurn}
                  usableAttackIndices={isLeviTurn ? legalActions.usableAttackIndices : []}
                  isSelectable={selectedEnergy && isLeviTurn}
                  onSelect={() => {
                    if (selectedEnergy && isLeviTurn) {
                      handleAction({ type: 'ATTACH_ENERGY', target: 'active' });
                    }
                  }}
                  onAttack={(atkIdx) => {
                    handleAction({ type: 'ATTACK', attackIndex: atkIdx });
                  }}
                  onInspect={() => setInspectedCard(p1.active!.card)}
                />
              ) : (
                <span className="text-xs font-bold text-rose-400 animate-pulse">
                  K.O. - Ersatz nötig!
                </span>
              )}
            </div>
          </div>

          {/* Levi Bench (3 slots) */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((slotIdx) => {
              const benchMon = p1.bench[slotIdx];
              const isPromotable =
                gameState.turnPhase === 'promote_needed' &&
                activeIdx === 1 &&
                slotIdx < p1.bench.length;

              return (
                <div
                  key={slotIdx}
                  className="w-20 sm:w-24 md:w-28 aspect-[5/7] rounded-2xl border-2 border-dashed border-slate-800 flex items-center justify-center relative"
                >
                  {benchMon ? (
                    <CardView
                      card={benchMon.card}
                      inPlay={benchMon}
                      size="bench"
                      isSelectable={
                        (selectedEnergy && isLeviTurn) || isPromotable
                      }
                      onSelect={() => {
                        if (isPromotable) {
                          handleAction({ type: 'PROMOTE', benchIndex: slotIdx });
                        } else if (selectedEnergy && isLeviTurn) {
                          handleAction({ type: 'ATTACH_ENERGY', target: slotIdx });
                        } else {
                          setInspectedCard(benchMon.card);
                        }
                      }}
                      onInspect={() => setInspectedCard(benchMon.card)}
                    />
                  ) : (
                    <span className="text-[10px] text-slate-700 font-bold">Bank</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Levi Hand & Controls Bar */}
        <div className="flex items-end justify-between px-2 pt-1 gap-2">
          {/* Left: Pikachu Companion with Speech */}
          <PikachuCompanion
            promptText={legalActions.description}
            voiceKey={legalActions.voiceKey}
            emotion={gameState.lastDamageEvent?.isKo ? 'happy' : 'idle'}
            className="shrink-0"
          />

          {/* Center: Levi's Hand Cards */}
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1 px-2 scrollbar-none">
            {p1.hand.map((card, hIdx) => {
              const isPlayable =
                isLeviTurn &&
                legalActions.playableHandIndices?.includes(hIdx);

              return (
                <div
                  key={hIdx}
                  className="transform hover:-translate-y-2 transition-transform duration-200"
                >
                  <CardView
                    card={card}
                    size="hand"
                    isSelectable={isPlayable}
                    onSelect={() => {
                      if (isPlayable) {
                        handleAction({ type: 'PLAY_BENCH', handIndex: hIdx });
                      } else {
                        setInspectedCard(card);
                      }
                    }}
                    onInspect={() => setInspectedCard(card)}
                  />
                </div>
              );
            })}
          </div>

          {/* Right Controls: Energy Zone & Big "FERTIG" Turn Button */}
          <div className="flex items-center gap-3 shrink-0">
            {renderEnergyZone(p1, isLeviTurn, () => {
              setSelectedEnergy((prev) => !prev);
            })}

            {/* Giant "FERTIG" Button */}
            <button
              onClick={() => {
                if (isLeviTurn && gameState.turnPhase !== 'promote_needed') {
                  handleAction({ type: 'END_TURN' });
                }
              }}
              disabled={!isLeviTurn || gameState.turnPhase === 'promote_needed'}
              className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 border-3 border-white shadow-2xl transition-all active:scale-90 ${
                isLeviTurn && gameState.turnPhase !== 'promote_needed'
                  ? 'bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-bounce cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border-slate-700 opacity-40 cursor-not-allowed'
              }`}
              title="Zug beenden"
            >
              <Check className="w-6 h-6 stroke-[3]" />
              <span className="font-extrabold uppercase tracking-wider text-[11px]">
                Fertig
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Card Detail Modal (Pocket Scan Inspector) */}
      <CardDetailModal
        card={inspectedCard}
        onClose={() => setInspectedCard(null)}
      />

      {/* Victory / Defeat Modal */}
      {gameState.winner !== null && (
        <VictoryModal
          winnerName={gameState.players[gameState.winner].name}
          isLeviWinner={gameState.winner === 0}
          onPlayAgain={onExitMatch}
          onOpenBooster={() => {
            soundManager.playVoice('cheer_super', 'Super gemacht, Levi!');
            alert('🎉 Booster-Pack Belohnung freigeschaltet! (Meilenstein 2)');
          }}
        />
      )}

      {/* Parent Settings Modal */}
      {showSettings && (
        <ParentSettingsModal
          onClose={() => setShowSettings(false)}
          onResetMatch={onExitMatch}
          aiDifficulty={aiDifficulty}
          onSetAiDifficulty={setAiDifficulty}
        />
      )}
    </div>
  );
};
