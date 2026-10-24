import React, { useState, useEffect } from 'react';
import { GameState, Card, Action, InPlayPokemon, PokemonType } from '../types/game';
import { getLegalActions, reduceGameState, getAiAction, canPayCost } from '../engine/gameEngine';
import { CardView } from './CardView';
import { EnergyBadge } from './EnergyBadge';
import { PikachuCompanion } from './PikachuCompanion';
import { CardDetailModal } from './CardDetailModal';
import { VictoryModal } from './VictoryModal';
import { ParentSettingsModal } from './ParentSettingsModal';
import { ArenaBackground, ArenaType } from './ArenaBackground';
import { AttackEffects, AttackAnimationData } from './AttackEffects';
import { GymBadge, BadgeType } from './GymBadge';
import { storageService } from '../services/storageService';
import { soundManager } from '../services/soundManager';
import { Check, Settings, Sparkles, Volume2, VolumeX, ArrowLeftRight, HeartHandshake } from 'lucide-react';

interface BattleBoardProps {
  initialState: GameState;
  arena?: ArenaType;
  gymBadgeId?: BadgeType;
  allCards: Card[];
  onExitMatch: () => void;
  onOpenBooster?: () => void;
}

export const BattleBoard: React.FC<BattleBoardProps> = ({
  initialState,
  arena = 'stadium',
  gymBadgeId,
  allCards,
  onExitMatch,
  onOpenBooster
}) => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [selectedEnergy, setSelectedEnergy] = useState<boolean>(false);
  const [selectedAttackIdx, setSelectedAttackIdx] = useState<number | null>(null);
  const [selectedHandEvoIdx, setSelectedHandEvoIdx] = useState<number | null>(null);
  const [inspectedCard, setInspectedCard] = useState<Card | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [animData, setAnimData] = useState<AttackAnimationData | null>(null);
  const [bgmMuted, setBgmMuted] = useState<boolean>(soundManager.isBgmMuted());

  const p1 = gameState.players[0]; // Levi
  const p2 = gameState.players[1]; // Opponent
  const activeIdx = gameState.activePlayerIndex;
  const isLeviTurn = activeIdx === 0;

  const legalActions = getLegalActions(gameState);

  // Play battle BGM when battle starts
  useEffect(() => {
    soundManager.playBgm('battle');
    return () => {
      soundManager.stopBgm();
    };
  }, []);

  // Voice instructions
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

  // Record win/loss when match finishes
  useEffect(() => {
    if (gameState.winner !== null) {
      const isLeviWinner = gameState.winner === 0;
      storageService.recordMatchResult(isLeviWinner, p1.points);
      if (isLeviWinner && gymBadgeId) {
        storageService.awardBadge(gymBadgeId);
      }
    }
  }, [gameState.winner, gymBadgeId]);

  // AI Opponent
  useEffect(() => {
    if (gameState.gameMode !== 'solo' || isLeviTurn || gameState.winner !== null || animData !== null) {
      return;
    }

    const timer = setTimeout(() => {
      const aiMove = getAiAction(gameState);
      if (aiMove) {
        if (aiMove.type === 'ATTACK') {
          const atkCard = p2.active?.card;
          const attack = atkCard?.attacks[aiMove.attackIndex];
          if (atkCard && attack && p1.active) {
            let dmg = attack.damage;
            if (gameState.stage >= 2 && p1.active.card.weakness?.type === atkCard.types[0]) {
              dmg += 20;
            }
            const willKo = dmg >= p1.active.currentHp;

            setAnimData({
              attackerSide: 'opponent',
              type: atkCard.types[0] || 'Farblos',
              damage: dmg,
              attackName: attack.name,
              isKo: willKo,
              onComplete: () => {
                setAnimData(null);
                setGameState((prev) => reduceGameState(prev, aiMove));
              }
            });
            return;
          }
        } else if (aiMove.type === 'ATTACH_ENERGY') {
          soundManager.playSfx('energy_attach');
        } else if (aiMove.type === 'PLAY_BENCH') {
          soundManager.playSfx('card_play');
        } else if (aiMove.type === 'EVOLVE') {
          soundManager.playSfx('victory');
        }

        setGameState((prev) => reduceGameState(prev, aiMove));
      } else {
        setGameState((prev) => reduceGameState(prev, { type: 'END_TURN' }));
      }
    }, 1400);

    return () => clearTimeout(timer);
  }, [gameState, isLeviTurn, animData]);

  // Attack Execution
  const executePlayerAttack = (atkIdx: number) => {
    if (!p1.active || !p2.active || gameState.attackedThisTurn) return;
    const attack = p1.active.card.attacks[atkIdx];
    if (!attack || !canPayCost(p1.active.attachedEnergy, attack.cost)) return;

    let dmg = attack.damage;
    if (gameState.stage >= 2 && p2.active.card.weakness?.type === p1.active.card.types[0]) {
      dmg += 20;
    }
    const willKo = dmg >= p2.active.currentHp;
    setSelectedAttackIdx(null);

    setAnimData({
      attackerSide: 'player',
      type: p1.active.card.types[0] || 'Farblos',
      damage: dmg,
      attackName: attack.name,
      isKo: willKo,
      onComplete: () => {
        setAnimData(null);
        setGameState((prev) => reduceGameState(prev, { type: 'ATTACK', attackIndex: atkIdx }));
      }
    });
  };

  const handleAction = (action: Action) => {
    if (action.type === 'ATTACH_ENERGY') {
      soundManager.playSfx('energy_attach');
      setSelectedEnergy(false);
    } else if (action.type === 'PLAY_BENCH') {
      soundManager.playSfx('card_play');
    } else if (action.type === 'EVOLVE') {
      soundManager.playSfx('victory');
      soundManager.speakText('Entwicklung! Tolles Pokémon!');
      setSelectedHandEvoIdx(null);
    } else if (action.type === 'RETREAT') {
      soundManager.playSfx('card_play');
    } else if (action.type === 'PLAY_TRAINER') {
      soundManager.playSfx('energy_attach');
    } else if (action.type === 'END_TURN') {
      soundManager.playSfx('button');
      setSelectedEnergy(false);
      setSelectedAttackIdx(null);
      setSelectedHandEvoIdx(null);
    }

    setGameState((prev) => reduceGameState(prev, action));
  };

  const toggleSound = () => {
    const next = soundManager.toggleBgmMute();
    setBgmMuted(next);
  };

  // Helper: Render Pokeball Score Stars
  const renderPoints = (points: number) => {
    return (
      <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700 shadow-md">
        {[1, 2, 3].map((pt) => (
          <div
            key={pt}
            className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-black transition-all ${
              pt <= points
                ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.9)] scale-110'
                : 'bg-slate-700 text-slate-500 opacity-40'
            }`}
          >
            ★
          </div>
        ))}
      </div>
    );
  };

  // Helper: Render 3D Battle Pedestal
  const renderActivePedestal = (
    mon: InPlayPokemon | null,
    isPlayer: boolean,
    previewDmg: number = 0
  ) => {
    if (!mon) {
      return (
        <div className="w-56 h-36 rounded-[50%] border-3 border-dashed border-slate-700 bg-slate-900/40 flex items-center justify-center">
          <span className="text-xs font-black text-rose-400 animate-pulse">
            Pokémon K.O. – Ersatz nötig!
          </span>
        </div>
      );
    }

    const card = mon.card;
    const currentHp = mon.currentHp;
    const maxHp = card.hp;
    const effectiveHp = Math.max(0, currentHp - previewDmg);
    const hpPercent = (currentHp / maxHp) * 100;
    const effectiveHpPercent = (effectiveHp / maxHp) * 100;
    const isTargetOfEnergy = selectedEnergy && isPlayer && isLeviTurn;
    const isTargetOfEvo =
      selectedHandEvoIdx !== null &&
      isPlayer &&
      isLeviTurn &&
      legalActions.evolvableHandIndices?.some(
        (e) => e.handIndex === selectedHandEvoIdx && e.targets.includes('active')
      );

    return (
      <div
        onClick={() => {
          if (isTargetOfEnergy) {
            handleAction({ type: 'ATTACH_ENERGY', target: 'active' });
          } else if (isTargetOfEvo && selectedHandEvoIdx !== null) {
            handleAction({ type: 'EVOLVE', handIndex: selectedHandEvoIdx, target: 'active' });
          } else {
            setInspectedCard(card);
          }
        }}
        className={`relative flex flex-col items-center cursor-pointer transition-transform duration-300 ${
          isTargetOfEnergy || isTargetOfEvo ? 'scale-105' : 'hover:scale-102'
        }`}
      >
        {/* Pokémon Cutout Figure */}
        <div className="relative w-40 h-40 sm:w-52 sm:h-52 flex items-center justify-center z-20">
          <img
            src={card.artworkUrl}
            alt={card.name}
            className={`w-full h-full object-contain filter drop-shadow-[0_12px_16px_rgba(0,0,0,0.8)] transition-transform ${
              isPlayer ? 'scale-x-[-1]' : ''
            }`}
          />

          {/* Attached Energy Spheres */}
          {mon.attachedEnergy.length > 0 && (
            <div className="absolute -bottom-2 flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-full border border-amber-400/60 shadow-lg z-30">
              {mon.attachedEnergy.map((eType, idx) => (
                <EnergyBadge key={idx} type={eType} size="sm" />
              ))}
            </div>
          )}

          {/* Evolution Pulse Highlight */}
          {isTargetOfEvo && (
            <div className="absolute inset-0 rounded-full border-4 border-amber-300 bg-amber-400/20 animate-ping pointer-events-none" />
          )}
        </div>

        {/* 3D Oval Pedestal Base */}
        <div
          className={`relative -mt-6 w-48 sm:w-60 h-16 sm:h-20 rounded-[50%] border-3 bg-gradient-to-b from-amber-400/30 to-amber-950/60 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)] z-10 ${
            isTargetOfEnergy || isTargetOfEvo
              ? 'border-white animate-pulse shadow-[0_0_40px_rgba(255,255,255,0.8)]'
              : 'border-amber-400/70'
          }`}
        >
          <div className="w-[85%] h-[60%] rounded-[50%] border border-amber-300/40 bg-slate-950/60 flex items-center justify-center" />
        </div>

        {/* HP Bar & Name */}
        <div className="relative z-30 -mt-2 w-48 sm:w-56 bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-2 shadow-xl flex flex-col gap-1 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-white drop-shadow truncate">{card.name}</span>
            <div className="flex items-center gap-1">
              <span
                className={`text-sm ${
                  effectiveHp === 0 ? 'text-rose-400 font-extrabold animate-pulse' : 'text-emerald-400'
                }`}
              >
                {effectiveHp}
              </span>
              <span className="text-[10px] text-slate-400">/ {maxHp} KP</span>
            </div>
          </div>

          <div className="relative h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="absolute inset-y-0 left-0 bg-rose-500/50 transition-all duration-300"
              style={{ width: `${hpPercent}%` }}
            />
            <div
              className={`h-full transition-all duration-300 ${
                effectiveHpPercent > 50
                  ? 'bg-emerald-500'
                  : effectiveHpPercent > 20
                  ? 'bg-amber-400'
                  : 'bg-rose-500 animate-pulse'
              }`}
              style={{ width: `${effectiveHpPercent}%` }}
            />
          </div>

          {previewDmg > 0 && effectiveHp === 0 && (
            <div className="text-[10px] font-black text-rose-400 text-center animate-bounce">
              ⚡ K.O.-Treffer!
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col justify-between p-2 sm:p-4 select-none">
      <ArenaBackground arena={arena} />

      {/* Top Header */}
      <div className="relative z-30 flex items-center justify-between px-2">
        <div className="flex items-center gap-3 bg-slate-900/80 px-3.5 py-1.5 rounded-2xl border-2 border-slate-700/80 backdrop-blur-md shadow-lg">
          <div className="w-10 h-10 rounded-full border-2 border-sky-400 bg-slate-950 p-1 flex items-center justify-center">
            <img src={`/images/trainers/${p2.avatar}.png`} alt={p2.name} className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="font-black text-sm text-white block">{p2.name}</span>
            <span className="text-[10px] font-bold text-sky-300">{p2.deck.length} Karten</span>
          </div>
          {renderPoints(p2.points)}
        </div>

        <div className="flex items-center gap-2">
          {gymBadgeId && (
            <GymBadge type={gymBadgeId} earned={storageService.loadProfile(allCards).badges.includes(gymBadgeId)} size="sm" />
          )}
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-full bg-slate-900/80 border border-slate-700 text-amber-300 hover:text-white shadow-lg"
          >
            {bgmMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white shadow-lg"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stadium Center Area */}
      <div className="relative z-20 flex-1 flex items-center justify-center gap-8 sm:gap-16 my-auto">
        {/* Opponent Active Pedestal & Bench */}
        <div className="flex items-center gap-4">
          {renderActivePedestal(
            p2.active,
            false,
            selectedAttackIdx !== null && p1.active?.card.attacks[selectedAttackIdx]
              ? p1.active.card.attacks[selectedAttackIdx].damage +
                (gameState.stage >= 2 && p2.active?.card.weakness?.type === p1.active.card.types[0] ? 20 : 0)
              : 0
          )}

          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((idx) => {
              const benchMon = p2.bench[idx];
              return (
                <div
                  key={idx}
                  className="w-14 sm:w-16 aspect-[5/7] rounded-xl border-2 border-dashed border-slate-800 bg-slate-950/40 flex items-center justify-center overflow-hidden"
                >
                  {benchMon && (
                    <img
                      src={benchMon.card.artworkUrl}
                      alt={benchMon.card.name}
                      className="w-full h-full object-contain filter drop-shadow p-1"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-center justify-center text-amber-400 font-black text-2xl drop-shadow-[0_0_15px_#f59e0b]">
          ⚡
        </div>

        {/* Levi Active Pedestal, Bench & Attack Buttons */}
        <div className="flex items-center gap-4">
          {/* Levi Bench */}
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((idx) => {
              const benchMon = p1.bench[idx];
              const isPromotable =
                gameState.turnPhase === 'promote_needed' &&
                activeIdx === 1 &&
                idx < p1.bench.length;
              const isTargetOfEnergy = selectedEnergy && isLeviTurn;
              const isTargetOfEvo =
                selectedHandEvoIdx !== null &&
                isLeviTurn &&
                legalActions.evolvableHandIndices?.some(
                  (e) => e.handIndex === selectedHandEvoIdx && e.targets.includes(idx)
                );

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isPromotable) {
                      handleAction({ type: 'PROMOTE', benchIndex: idx });
                    } else if (isTargetOfEnergy && benchMon) {
                      handleAction({ type: 'ATTACH_ENERGY', target: idx });
                    } else if (isTargetOfEvo && selectedHandEvoIdx !== null) {
                      handleAction({ type: 'EVOLVE', handIndex: selectedHandEvoIdx, target: idx });
                    } else if (benchMon) {
                      setInspectedCard(benchMon.card);
                    }
                  }}
                  className={`w-14 sm:w-16 aspect-[5/7] rounded-xl border-2 flex items-center justify-center overflow-hidden cursor-pointer transition-all ${
                    isPromotable || isTargetOfEnergy || isTargetOfEvo
                      ? 'border-amber-400 bg-amber-400/20 shadow-[0_0_15px_rgba(251,191,36,0.6)] scale-105 animate-pulse'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-600'
                  }`}
                >
                  {benchMon ? (
                    <img
                      src={benchMon.card.artworkUrl}
                      alt={benchMon.card.name}
                      className="w-full h-full object-contain filter drop-shadow p-1"
                    />
                  ) : (
                    <span className="text-[9px] text-slate-700 font-bold">Bank</span>
                  )}
                </div>
              );
            })}
          </div>

          {renderActivePedestal(p1.active, true, 0)}

          {/* Action Buttons (Attacks & Retreat) */}
          {p1.active && isLeviTurn && !gameState.attackedThisTurn && gameState.turnNumber > 1 && (
            <div className="flex flex-col gap-2 z-30 animate-in fade-in">
              {p1.active.card.attacks.map((atk, idx) => {
                const canUse = canPayCost(p1.active!.attachedEnergy, atk.cost);
                const isSelected = selectedAttackIdx === idx;
                const willDealWeakness =
                  gameState.stage >= 2 && p2.active?.card.weakness?.type === p1.active!.card.types[0];

                return (
                  <button
                    key={idx}
                    disabled={!canUse}
                    onClick={() => {
                      if (!canUse) return;
                      if (isSelected) {
                        executePlayerAttack(idx);
                      } else {
                        soundManager.playSfx('button');
                        setSelectedAttackIdx(idx);
                        soundManager.speakText(`${atk.name}! ${atk.damage} Schaden! Tippe noch einmal zum Angreifen!`);
                      }
                    }}
                    className={`px-4 py-2.5 rounded-2xl border-2 flex items-center gap-3 transition-all active:scale-95 shadow-xl ${
                      canUse
                        ? isSelected
                          ? 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 border-white text-white scale-110 shadow-[0_0_25px_rgba(244,63,94,0.9)] animate-bounce'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-300 text-slate-950 hover:scale-105 shadow-[0_0_15px_rgba(251,191,36,0.7)] animate-pulse'
                        : 'bg-slate-900/60 border-slate-700 text-slate-500 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-0.5">
                      {atk.cost.map((cType, cIdx) => (
                        <EnergyBadge key={cIdx} type={cType} size="sm" />
                      ))}
                    </div>
                    <div className="text-left">
                      <span className="font-black text-xs sm:text-sm block leading-tight">
                        {atk.name}
                      </span>
                      {willDealWeakness && (
                        <span className="text-[9px] font-black text-red-900 uppercase bg-amber-300 px-1 rounded">
                          +20 Schwäche!
                        </span>
                      )}
                    </div>
                    <span className="bg-slate-950/80 text-amber-300 px-2 py-0.5 rounded-lg text-sm sm:text-base font-black">
                      {atk.damage}
                    </span>
                  </button>
                );
              })}

              {/* Retreat Button (Rule Level >= 2) */}
              {legalActions.canRetreat && (
                <button
                  onClick={() => {
                    if (legalActions.retreatableBenchIndices && legalActions.retreatableBenchIndices.length > 0) {
                      soundManager.playVoice('prompt_promote', 'Wähle ein Pokémon von deiner Bank als Ersatz!');
                      handleAction({ type: 'RETREAT', benchIndex: legalActions.retreatableBenchIndices[0] });
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rückzug ({p1.active.card.retreat} Energie)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar: Fanned Hand & Controls */}
      <div className="relative z-30 flex items-end justify-between px-2 pt-1 gap-2">
        <PikachuCompanion
          promptText={legalActions.description}
          voiceKey={legalActions.voiceKey}
          emotion={gameState.lastDamageEvent?.isKo ? 'happy' : 'idle'}
        />

        {/* Fanned Hand Cards */}
        <div className="flex items-end justify-center -space-x-4 sm:-space-x-6 overflow-visible py-2 px-4 max-w-2xl">
          {p1.hand.map((card, hIdx) => {
            const isPlayableBasis = isLeviTurn && legalActions.playableHandIndices?.includes(hIdx);
            const isEvolvable =
              isLeviTurn &&
              legalActions.evolvableHandIndices?.some((e) => e.handIndex === hIdx);
            const isTrainerPlayable =
              isLeviTurn && legalActions.playableTrainerIndices?.includes(hIdx);

            return (
              <div
                key={hIdx}
                onMouseEnter={() => soundManager.playSfx('card_hover')}
                onClick={() => {
                  if (isPlayableBasis) {
                    handleAction({ type: 'PLAY_BENCH', handIndex: hIdx });
                  } else if (isEvolvable) {
                    soundManager.playSfx('button');
                    setSelectedHandEvoIdx(hIdx);
                    soundManager.speakText(`Entwicklung für ${card.evolvesFrom}! Tippe auf das Pokémon!`);
                  } else if (isTrainerPlayable) {
                    handleAction({ type: 'PLAY_TRAINER', handIndex: hIdx, target: 'active' });
                  } else {
                    setInspectedCard(card);
                  }
                }}
                className={`relative group transform transition-all duration-300 cursor-pointer origin-bottom hover:-translate-y-6 hover:scale-115 hover:z-40 ${
                  isPlayableBasis || isEvolvable || isTrainerPlayable
                    ? 'ring-4 ring-amber-400 rounded-2xl animate-pulse shadow-[0_0_20px_#f59e0b]'
                    : ''
                }`}
                style={{
                  transform: `rotate(${(hIdx - (p1.hand.length - 1) / 2) * 5}deg)`
                }}
              >
                <CardView
                  card={card}
                  size="hand"
                  isSelectable={isPlayableBasis || isEvolvable || isTrainerPlayable}
                  onInspect={() => setInspectedCard(card)}
                />
              </div>
            );
          })}
        </div>

        {/* Energy & Fertig Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-black uppercase text-amber-300">
              Energie
            </span>
            <div
              onClick={() => {
                if (isLeviTurn && p1.energyZone.length > 0 && !gameState.energyAttachedThisTurn) {
                  soundManager.playSfx('button');
                  setSelectedEnergy((prev) => !prev);
                  soundManager.playVoice('prompt_energy', 'Zieh deine Energie auf ein Pokémon!');
                }
              }}
              className={`p-1 rounded-full cursor-pointer transition-all ${
                isLeviTurn && p1.energyZone.length > 0 && !gameState.energyAttachedThisTurn
                  ? selectedEnergy
                    ? 'ring-4 ring-white scale-110 shadow-[0_0_25px_rgba(255,255,255,0.9)] animate-bounce'
                    : 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-105 shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-pulse'
                  : 'opacity-40 grayscale'
              }`}
            >
              <EnergyBadge
                type={p1.energyZone[0] || 'Feuer'}
                size="lg"
                pulse={isLeviTurn && p1.energyZone.length > 0}
              />
            </div>
          </div>

          <button
            disabled={!isLeviTurn || gameState.turnPhase === 'promote_needed'}
            onClick={() => {
              if (isLeviTurn && gameState.turnPhase !== 'promote_needed') {
                handleAction({ type: 'END_TURN' });
              }
            }}
            className={`h-16 w-16 sm:h-20 sm:w-20 rounded-full font-black flex flex-col items-center justify-center border-3 border-white shadow-2xl transition-all active:scale-90 ${
              isLeviTurn && gameState.turnPhase !== 'promote_needed'
                ? 'bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_25px_rgba(251,191,36,0.9)] animate-bounce cursor-pointer'
                : 'bg-slate-800 text-slate-500 border-slate-700 opacity-40 cursor-not-allowed'
            }`}
          >
            <Check className="w-6 h-6 stroke-[3]" />
            <span className="font-extrabold uppercase text-[10px]">Fertig</span>
          </button>
        </div>
      </div>

      <AttackEffects animData={animData} />
      <CardDetailModal card={inspectedCard} onClose={() => setInspectedCard(null)} />

      {/* Victory / Defeat Modal */}
      {gameState.winner !== null && (
        <VictoryModal
          winnerName={gameState.players[gameState.winner].name}
          isLeviWinner={gameState.winner === 0}
          onPlayAgain={onExitMatch}
          onOpenBooster={onOpenBooster}
        />
      )}

      {/* Parent Settings Modal */}
      {showSettings && (
        <ParentSettingsModal
          allCards={allCards}
          onClose={() => setShowSettings(false)}
          onResetMatch={onExitMatch}
          ruleLevel={gameState.stage}
          onSetRuleLevel={(lvl) => setGameState((prev) => ({ ...prev, stage: lvl }))}
          aiDifficulty="leicht"
          onSetAiDifficulty={() => {}}
        />
      )}
    </div>
  );
};
