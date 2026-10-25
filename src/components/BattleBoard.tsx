import React, { useState, useEffect } from 'react';
import { GameState, Card, Action, InPlayPokemon, PokemonType } from '../types/game';
import { getLegalActions, reduceGameState, getAiAction, canPayCost } from '../engine/gameEngine';
import { CardView } from './CardView';
import { EnergyBadge } from './EnergyBadge';
import { PikachuCompanion } from './PikachuCompanion';
import { CardDetailModal } from './CardDetailModal';
import { VictoryModal } from './VictoryModal';
import { HowToPlayModal } from './HowToPlayModal';
import { ParentSettingsModal } from './ParentSettingsModal';
import { ArenaBackground, ArenaType } from './ArenaBackground';
import { AttackEffects, AttackAnimationData } from './AttackEffects';
import { GymBadge, BadgeType } from './GymBadge';
import { TurnBanner } from './TurnBanner';
import { CoinTossModal } from './CoinTossModal';
import { StatusBadge } from './StatusBadge';
import { storageService } from '../services/storageService';
import { soundManager, BgmTrack } from '../services/soundManager';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { Check, Settings, Volume2, VolumeX, ArrowLeftRight, Sparkles, ArrowRight, Film, Zap, BookOpen } from 'lucide-react';

const TYPE_GLOWS: Record<string, { border: string; glow: string; ring: string }> = {
  Feuer: { border: 'border-orange-500', glow: 'rgba(249,115,22,0.85)', ring: 'from-amber-500/50 via-orange-600/40 to-red-950/90' },
  Wasser: { border: 'border-cyan-400', glow: 'rgba(6,182,212,0.85)', ring: 'from-sky-500/50 via-cyan-600/40 to-blue-950/90' },
  Pflanze: { border: 'border-emerald-400', glow: 'rgba(16,185,129,0.85)', ring: 'from-emerald-500/50 via-green-600/40 to-emerald-950/90' },
  Elektro: { border: 'border-yellow-400', glow: 'rgba(250,204,21,0.85)', ring: 'from-yellow-400/50 via-amber-500/40 to-yellow-950/90' },
  Psycho: { border: 'border-purple-400', glow: 'rgba(192,132,252,0.85)', ring: 'from-purple-500/50 via-fuchsia-600/40 to-purple-950/90' },
  Kampf: { border: 'border-amber-600', glow: 'rgba(217,119,6,0.85)', ring: 'from-amber-600/50 via-orange-700/40 to-amber-950/90' },
  Finsternis: { border: 'border-indigo-400', glow: 'rgba(129,140,248,0.85)', ring: 'from-indigo-600/50 via-slate-700/40 to-slate-950/90' },
  Farblos: { border: 'border-slate-300', glow: 'rgba(203,213,225,0.85)', ring: 'from-slate-400/50 via-slate-600/40 to-slate-950/90' }
};

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
  const [animSpeed, setAnimSpeed] = useState<'cinematic' | 'fast'>(storageService.getBattleAnimSpeed());
  const [bgmMuted, setBgmMuted] = useState<boolean>(soundManager.isBgmMuted());
  const [turnBanner, setTurnBanner] = useState<'player' | 'opponent' | null>(null);
  const [showCoinModal, setShowCoinModal] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);

  const p1 = gameState.players[0]; // Levi
  const p2 = gameState.players[1]; // Opponent (Gym Leader or Papa)
  const activeIdx = gameState.activePlayerIndex;
  const isLeviTurn = activeIdx === 0;
  const isPvP = gameState.gameMode === 'pvp';
  const { isMobilePortrait, isMobileLandscape } = useResponsiveLayout();

  const legalActions = getLegalActions(gameState);

  // 3-Stufen BGM Logik basierend auf Arenaleiter
  const getBattleTrack = (): BgmTrack => {
    if (isPvP) return 'battle_papa';
    if (gymBadgeId === 'gary') return 'battle_climax';
    if (gymBadgeId && ['koga', 'sabrina', 'pyro', 'giovanni'].includes(gymBadgeId)) {
      return 'battle_elite';
    }
    return 'battle';
  };

  // Play battle BGM based on Gym Leader tier
  useEffect(() => {
    const track = getBattleTrack();
    soundManager.playBgm(track);
    return () => {
      soundManager.stopBgm();
      soundManager.setBgmPinch(false);
    };
  }, [gymBadgeId, isPvP]);

  // TCG Pocket Climax-Pinch (Last Point Tension)
  const isPinch = (p1.points === 2 || p2.points === 2) && gameState.winner === null;
  const [pinchAnnounced, setPinchAnnounced] = useState<boolean>(false);

  useEffect(() => {
    if (isPinch) {
      soundManager.setBgmPinch(true);
      if (!pinchAnnounced) {
        setPinchAnnounced(true);
        soundManager.playSfx('star_rare');
        soundManager.playVoice('pinch_climax', 'Achtung! Letzter Punkt zum Sieg! Jetzt geht es um alles!');
      }
    } else {
      soundManager.setBgmPinch(false);
    }
  }, [isPinch, pinchAnnounced]);

  // Voice instructions
  useEffect(() => {
    if (gameState.winner !== null) return;

    if (gameState.turnPhase === 'promote_needed') {
      if (p1.active === null) {
        soundManager.playVoice('prompt_promote', 'Wähle ein neues Pokémon von deiner Bank!');
      } else {
        soundManager.playVoice('opponent_turn', `${p2.name} wählt das nächste Pokémon.`);
      }
      return;
    }

    if (isLeviTurn) {
      if (gameState.turnNumber === 1) {
        soundManager.playVoice('welcome', 'Hallo Levi! Bist du bereit für den Pokémon-Kampf?');
      } else {
        soundManager.playVoice(legalActions.voiceKey || 'turn_start', legalActions.description);
      }
    } else if (isPvP) {
      soundManager.playVoice('turn_papa', `${p2.name} ist am Zug!`);
    } else {
      soundManager.playVoice('opponent_turn', 'Der Gegner ist am Zug.');
    }
  }, [gameState.turnNumber, gameState.activePlayerIndex, gameState.turnPhase, isPvP]);

  // TCG Pocket Turn Banner Trigger
  useEffect(() => {
    if (gameState.winner !== null || gameState.turnPhase === 'promote_needed') return;

    const side = isLeviTurn ? 'player' : 'opponent';
    setTurnBanner(side);

    if (side === 'player') {
      soundManager.playSfx('transition');
    } else {
      soundManager.playSfx('ok');
    }

    const timer = setTimeout(() => {
      setTurnBanner(null);
    }, 1100);

    return () => clearTimeout(timer);
  }, [gameState.turnNumber, gameState.activePlayerIndex]);

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

  // AI Opponent in Solo Mode
  useEffect(() => {
    if (gameState.gameMode !== 'solo' || gameState.winner !== null || animData !== null) {
      return;
    }

    const isAiTurn = !isLeviTurn;
    const isAiPromotionNeeded = gameState.turnPhase === 'promote_needed' && p2.active === null;

    if (!isAiTurn && !isAiPromotionNeeded) {
      return;
    }

    const timer = setTimeout(() => {
      const aiMove = getAiAction(gameState, storageService.getAiDifficulty());
      if (aiMove) {
        if (aiMove.type === 'PROMOTE') {
          soundManager.playSfx('card_slide');
          const promotedMon = p2.bench[aiMove.benchIndex];
          if (promotedMon) {
            soundManager.playVoice('opponent_turn', `${p2.name} schickt ${promotedMon.card.name} in den Kampf!`);
          }
        } else if (aiMove.type === 'ATTACK') {
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
                if (willKo) {
                  soundManager.playVoice('pokemon_ko', 'Oh nein, dein Pokémon ist kampfunfähig!');
                }
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
    }, animSpeed === 'fast' ? 700 : 1300);

    return () => clearTimeout(timer);
  }, [gameState, isLeviTurn, animData, animSpeed]);

  // Attack Execution for active player
  const executePlayerAttack = (atkIdx: number, playerIndex: 0 | 1 = 0) => {
    const attacker = gameState.players[playerIndex];
    const defender = gameState.players[playerIndex === 0 ? 1 : 0];
    if (!attacker.active || !defender.active || gameState.attackedThisTurn) return;

    const attack = attacker.active.card.attacks[atkIdx];
    if (!attack || !canPayCost(attacker.active.attachedEnergy, attack.cost)) return;

    let dmg = attack.damage;
    if (gameState.stage >= 2 && defender.active.card.weakness?.type === attacker.active.card.types[0]) {
      dmg += 20;
    }
    const willKo = dmg >= defender.active.currentHp;
    setSelectedAttackIdx(null);

    setAnimData({
      attackerSide: playerIndex === 0 ? 'player' : 'opponent',
      type: attacker.active.card.types[0] || 'Farblos',
      damage: dmg,
      attackName: attack.name,
      isKo: willKo,
      onComplete: () => {
        setAnimData(null);
        if (willKo) {
          if (playerIndex === 0) {
            soundManager.playVoice('point_scored', 'K.O.! Du erhältst einen Siegespunkt!');
          } else {
            soundManager.playVoice('pokemon_ko', 'Oh nein, dein Pokémon ist kampfunfähig!');
          }
        }
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
    } else if (action.type === 'PROMOTE') {
      soundManager.playSfx('card_slide');
    } else if (action.type === 'EVOLVE') {
      soundManager.playSfx('victory');
      soundManager.playVoice('evolution_success', 'Entwicklung! Was für ein starkes Pokémon!');
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

  // Track match win/loss for stats and adaptive difficulty
  useEffect(() => {
    if (gameState.winner !== null) {
      const isLeviWinner = gameState.winner === 0;
      storageService.recordMatchResult(isLeviWinner, isLeviWinner ? 3 : p1.points);
    }
  }, [gameState.winner]);

  const toggleSound = () => {
    const next = soundManager.toggleBgmMute();
    setBgmMuted(next);
  };

  // Helper: Render Authentic TCG Pocket Pokeball Score Gauge
  const renderPoints = (points: number) => {
    return (
      <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-700/80 shadow-md">
        {[1, 2, 3].map((pt) => (
          <div
            key={pt}
            className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
              pt <= points
                ? 'border-yellow-300 bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-[0_0_12px_#fbbf24] scale-110'
                : 'border-slate-700 bg-slate-800/80 opacity-40'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${pt <= points ? 'bg-white' : 'bg-slate-600'}`} />
          </div>
        ))}
        <span className="text-xs font-black text-amber-300 ml-1">{points}/3</span>
      </div>
    );
  };

  // Helper: Symmetric damage preview calculation for active Pokémon
  const getPreviewDamage = (targetSide: 'levi' | 'opponent'): number => {
    if (selectedAttackIdx === null) return 0;

    if (targetSide === 'opponent') {
      // Levi is attacking opponent / Papa
      if (!isLeviTurn || !p1.active || !p2.active) return 0;
      const atk = p1.active.card.attacks[selectedAttackIdx];
      if (!atk) return 0;
      let dmg = atk.damage;
      if (gameState.stage >= 2 && p2.active.card.weakness?.type === p1.active.card.types[0]) {
        dmg += 20;
      }
      return dmg;
    } else {
      // Papa is attacking Levi in PvP mode
      if (isLeviTurn || !isPvP || !p2.active || !p1.active) return 0;
      const atk = p2.active.card.attacks[selectedAttackIdx];
      if (!atk) return 0;
      let dmg = atk.damage;
      if (gameState.stage >= 2 && p1.active.card.weakness?.type === p2.active.card.types[0]) {
        dmg += 20;
      }
      return dmg;
    }
  };

  // Helper: Render 3D Battle Pedestal for Active Pokémon
  const renderActivePedestal = (
    mon: InPlayPokemon | null,
    isPlayer: boolean,
    previewDmg: number = 0,
    isCompact: boolean = false,
    tabletopInvert: boolean = false
  ) => {
    const compact = isCompact || isMobileLandscape;
    const isTabletopPapa = tabletopInvert && isPvP && !isPlayer;
    const rotateClass = isTabletopPapa ? 'rotate-180' : '';
    if (!mon) {
      return (
        <div className={`rounded-3xl border-3 border-dashed border-rose-400/60 bg-rose-950/30 flex flex-col items-center justify-center text-center shadow-lg backdrop-blur-sm animate-pulse ${rotateClass} ${
          compact ? 'w-28 xs:w-36 h-24 xs:h-30 p-2' : 'w-48 sm:w-60 h-40 sm:h-48 p-3'
        }`}>
          <span className={`${compact ? 'text-xs' : 'text-sm'} font-black text-rose-300`}>
            Pokémon K.O.!
          </span>
          <span className={`${compact ? 'text-[9px]' : 'text-[11px]'} font-bold text-rose-200/80 mt-0.5 sm:mt-1`}>
            {isPlayer ? 'Wähle Bank-Pokémon!' : `${p2.name} wechselt...`}
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
    const isTargetOfEnergy =
      selectedEnergy && ((isPlayer && isLeviTurn) || (!isPlayer && isPvP && !isLeviTurn));
    const isTargetOfEvo =
      selectedHandEvoIdx !== null &&
      ((isPlayer && isLeviTurn) || (!isPlayer && isPvP && !isLeviTurn)) &&
      legalActions.evolvableHandIndices?.some(
        (e) => e.handIndex === selectedHandEvoIdx && e.targets.includes('active')
      );

    const typeKey = card.types[0] || 'Farblos';
    const typeStyle = TYPE_GLOWS[typeKey] || TYPE_GLOWS['Farblos'];

    const isAttacker = animData && ((animData.attackerSide === 'player' && isPlayer) || (animData.attackerSide === 'opponent' && !isPlayer));
    const isDefender = animData && ((animData.attackerSide === 'player' && !isPlayer) || (animData.attackerSide === 'opponent' && isPlayer));

    let motionClass = '';
    if (isAttacker) {
      motionClass = isPlayer ? '-translate-y-5 sm:-translate-y-8 scale-105 z-40' : 'translate-y-5 sm:translate-y-8 scale-105 z-40';
    } else if (isDefender) {
      motionClass = 'animate-[shake_0.4s_ease-in-out] drop-shadow-[0_0_35px_rgba(239,68,68,1)]';
    }

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
        className={`relative flex flex-col items-center cursor-pointer transition-all duration-300 ${rotateClass} ${
          isTargetOfEnergy || isTargetOfEvo ? 'scale-105' : 'hover:scale-102'
        }`}
      >
        {/* Pokémon Cutout Figure */}
        <div className={`relative ${
          compact ? 'w-24 h-24 xs:w-28 xs:h-28 sm:w-36 sm:h-36' : 'w-36 h-36 xs:w-44 xs:h-44 sm:w-56 sm:h-56 md:w-64 md:h-64'
        } flex items-center justify-center z-20 transition-all duration-300 ${motionClass}`}>
          <img
            src={card.artworkUrl}
            alt={card.name}
            className={`w-full h-full object-contain filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.85)] transition-transform ${
              isPlayer ? 'scale-x-[-1]' : ''
            }`}
          />

          {/* Red Flash Overlay when Hit */}
          {isDefender && (
            <div className="absolute inset-0 bg-red-600/40 rounded-full blur-md animate-ping pointer-events-none" />
          )}

          {/* 3D Status Token (Schlaf, Gift, Paralyse) with Speech */}
          <StatusBadge
            status={mon.status}
            pokemonName={card.name}
            className={`absolute ${compact ? '-top-2 right-0 scale-75' : '-top-3 right-2'}`}
          />

          {/* Attached Energy Spheres Badges */}
          {mon.attachedEnergy.length > 0 && (
            <div className={`absolute ${compact ? '-bottom-1 px-2 py-0.5' : '-bottom-1 px-3 py-1'} flex items-center gap-1 bg-slate-950/90 rounded-full border-2 border-amber-400/80 shadow-xl z-30`}>
              {mon.attachedEnergy.map((eType, idx) => (
                <EnergyBadge key={idx} type={eType} size="sm" />
              ))}
            </div>
          )}

          {/* Evolution Highlight Ping */}
          {isTargetOfEvo && (
            <div className="absolute inset-0 rounded-full border-4 border-amber-300 bg-amber-400/25 animate-ping pointer-events-none" />
          )}
        </div>

        {/* 3D Elemental Pedestal Base with TCG Pocket Stadium Ring */}
        <div
          style={{
            boxShadow: `0 0 ${compact ? '20px' : '35px'} ${isTargetOfEnergy || isTargetOfEvo ? 'rgba(255,255,255,0.9)' : typeStyle.glow}`
          }}
          className={`relative ${
            compact ? '-mt-4 w-32 xs:w-36 h-8 xs:h-10' : '-mt-6 sm:-mt-8 w-44 xs:w-52 sm:w-64 md:w-72 h-12 sm:h-18 md:h-20'
          } rounded-[50%] border-3 bg-gradient-to-b ${typeStyle.ring} flex items-center justify-center z-10 transition-all ${
            isTargetOfEnergy || isTargetOfEvo
              ? 'border-white animate-pulse'
              : typeStyle.border
          }`}
        >
          <div className="w-[85%] h-[60%] rounded-[50%] border border-white/30 bg-slate-950/75 flex items-center justify-center shadow-inner" />
        </div>

        {/* TCG Pocket Sleek HP Bar & Name Plate */}
        <div className={`relative z-30 ${
          compact ? '-mt-1.5 w-36 xs:w-40 p-1.5 rounded-xl' : '-mt-2 w-48 sm:w-60 p-2 sm:p-2.5 rounded-2xl'
        } bg-slate-900/95 border-2 border-slate-700 shadow-2xl flex flex-col gap-0.5 sm:gap-1 backdrop-blur-md`}>
          <div className={`flex items-center justify-between ${compact ? 'text-[11px]' : 'text-xs sm:text-sm'} font-black`}>
            <span className="text-white drop-shadow truncate">{card.name}</span>
            <div className="flex items-center gap-1 shrink-0 bg-slate-950/90 px-1.5 py-0.2 rounded-full border border-slate-700">
              {mon.shieldBonus && mon.shieldBonus > 0 && isPlayer && (
                <span className="text-[9px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded-full font-black animate-pulse" title="Pikachu-Schutzschild (+20 KP)">
                  🛡️ +{mon.shieldBonus}
                </span>
              )}
              <span className="text-[9px] uppercase font-black text-slate-400">KP</span>
              <span
                className={`${compact ? 'text-xs' : 'text-sm sm:text-base'} font-black ${
                  effectiveHp === 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                }`}
              >
                {effectiveHp}
              </span>
              <span className="text-[9px] text-slate-500 font-bold">/ {maxHp}</span>
            </div>
          </div>

          <div className={`relative ${compact ? 'h-1.5' : 'h-2 sm:h-2.5'} bg-slate-950 rounded-full overflow-hidden border border-slate-800`}>
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
    <div className="relative w-full h-full h-dvh bg-slate-950 overflow-hidden flex flex-col justify-between p-1 sm:p-3 select-none pl-safe pr-safe">
      {/* 1. Dynamic Thematic Anime Arena Background */}
      <ArenaBackground arena={arena} />

      {/* Climax-Pinch Golden Edge Aura */}
      {isPinch && (
        <div className="absolute inset-0 pointer-events-none z-20 border-4 sm:border-8 border-amber-400/60 shadow-[inset_0_0_90px_rgba(245,158,11,0.6)] animate-pulse" />
      )}

      {isMobilePortrait ? (
        /* ============================================================ */
        /* MOBILE PORTRAIT LAYOUT (POKÉMON TCG POCKET VERTICAL DUEL)    */
        /* ============================================================ */
        <div className="relative z-20 flex-1 flex flex-col justify-between w-full h-full overflow-hidden px-1 pt-safe pb-safe gap-1">
          {/* 1. Opponent Top Bar (Notch & Dynamic Island Safe) */}
          <div className="flex items-center justify-between gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-slate-700/80 shadow-md shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-sky-400 bg-slate-950 p-0.5 shrink-0">
                <img src={`/images/trainers/${p2.avatar}.png`} alt={p2.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-black text-xs text-white block leading-tight truncate max-w-[85px]">{p2.name}</span>
                <span className="text-[9px] font-bold text-sky-300">{p2.deck.length} 🎴</span>
              </div>
              {renderPoints(p2.points)}
            </div>

            {isPinch && (
              <span className="text-[9px] bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black px-2 py-0.5 rounded-full animate-bounce shadow">
                🔥 MATCHBALL!
              </span>
            )}

            <div className="flex items-center gap-1">
              {gymBadgeId && (
                <GymBadge type={gymBadgeId} earned={storageService.loadProfile(allCards).badges.includes(gymBadgeId)} size="sm" />
              )}
              <button
                onClick={() => { setShowCoinModal(true); soundManager.playSfx('click'); }}
                className="p-1.5 rounded-xl bg-slate-800 text-amber-300 text-xs border border-slate-700 active:scale-95 cursor-pointer"
                title="Münze"
              >
                🪙
              </button>
              <button
                onClick={() => { setShowRules(true); soundManager.playSfx('click'); }}
                className="p-1.5 rounded-xl bg-slate-800 text-amber-300 border border-slate-700 active:scale-95 cursor-pointer"
                title="Regeln"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-xl bg-slate-800 text-amber-300 border border-slate-700 active:scale-95 cursor-pointer"
                title="Musik"
              >
                {bgmMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 active:scale-95 cursor-pointer"
                title="Optionen"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 2. Opponent Half: Bench (3 horizontal slots) + Active Pedestal */}
          <div className="flex items-center justify-between gap-2 px-1 py-0.5 shrink-0">
            {/* Opponent Bench Row */}
            <div className="flex flex-col gap-0.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80 shrink-0">
              <span className="text-[8px] font-black uppercase text-slate-400 text-center">Gegner Bank</span>
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((idx) => {
                  const benchMon = p2.bench[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (benchMon) setInspectedCard(benchMon.card);
                      }}
                      className="relative w-10 aspect-[5/7] rounded-lg border border-slate-800 bg-slate-950/80 flex items-center justify-center overflow-hidden"
                    >
                      {benchMon ? (
                        <>
                          <img src={benchMon.card.artworkUrl} alt={benchMon.card.name} className="w-full h-full object-contain p-0.5" />
                          {benchMon.attachedEnergy.length > 0 && (
                            <div className="absolute bottom-0 flex items-center bg-slate-950/85 px-0.5 rounded-full">
                              {benchMon.attachedEnergy.map((e, ei) => (
                                <EnergyBadge key={ei} type={e} size="sm" />
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-[8px] text-slate-600 font-bold">+</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Opponent Active Pedestal */}
            <div className="flex-1 flex justify-center">
              {renderActivePedestal(
                p2.active,
                false,
                getPreviewDamage('opponent'),
                true
              )}
            </div>
          </div>

          {/* 3. Center Clash Field / Points Indicator */}
          <div className="flex items-center justify-center py-0.5 shrink-0 pointer-events-none">
            <div className="px-3 py-0.5 rounded-full bg-slate-950/85 border border-amber-400/50 shadow flex items-center gap-2.5">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-sky-400">{p2.name}:</span>
                {renderPoints(p2.points)}
              </div>
              <span className="text-amber-400 font-black text-xs">VS</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-amber-400">Levi:</span>
                {renderPoints(p1.points)}
              </div>
            </div>
          </div>

          {/* 4. Levi Half: Active Pedestal + Attack Buttons + Levi Bench Row */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="flex items-center justify-between gap-2 w-full px-1">
              {/* Levi Active Pedestal */}
              <div className="flex-1 flex justify-center">
                {renderActivePedestal(
                  p1.active,
                  true,
                  getPreviewDamage('levi'),
                  true
                )}
              </div>

              {/* Levi Bench Row */}
              <div className="flex flex-col gap-0.5 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80 shrink-0">
                <span className="text-[8px] font-black uppercase text-amber-400 text-center">Levis Bank</span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((idx) => {
                    const benchMon = p1.bench[idx];
                    const isPromotable =
                      gameState.turnPhase === 'promote_needed' &&
                      p1.active === null &&
                      idx < p1.bench.length;
                    const isTargetOfEnergy = selectedEnergy && isLeviTurn && benchMon;
                    const isTargetOfEvo =
                      selectedHandEvoIdx !== null &&
                      isLeviTurn &&
                      legalActions.evolvableHandIndices?.some(
                        (e) => e.handIndex === selectedHandEvoIdx && e.targets.includes(idx)
                      );
                    const isPlayableEmptySlot =
                      !benchMon &&
                      isLeviTurn &&
                      legalActions.playableHandIndices &&
                      legalActions.playableHandIndices.length > 0;

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
                          } else if (isPlayableEmptySlot && legalActions.playableHandIndices) {
                            handleAction({ type: 'PLAY_BENCH', handIndex: legalActions.playableHandIndices[0] });
                          }
                        }}
                        className={`relative w-10 aspect-[5/7] rounded-lg border flex items-center justify-center overflow-hidden transition-all cursor-pointer ${
                          isPromotable || isTargetOfEnergy || isTargetOfEvo || isPlayableEmptySlot
                            ? 'border-amber-400 bg-amber-400/20 shadow animate-pulse'
                            : 'border-slate-800 bg-slate-950/80'
                        }`}
                      >
                        {benchMon ? (
                          <>
                            <img src={benchMon.card.artworkUrl} alt={benchMon.card.name} className="w-full h-full object-contain p-0.5" />
                            {benchMon.attachedEnergy.length > 0 && (
                              <div className="absolute bottom-0 flex items-center bg-slate-950/85 px-0.5 rounded-full">
                                {benchMon.attachedEnergy.map((e, ei) => (
                                  <EnergyBadge key={ei} type={e} size="sm" />
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-[8px] text-amber-300 font-black">
                            {isPlayableEmptySlot ? 'Hier!' : '+'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Levi Attack Action Buttons (Clean thumb-friendly row right below active) */}
            {p1.active && isLeviTurn && !gameState.attackedThisTurn && gameState.turnNumber > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 z-30 animate-in fade-in max-w-full px-2">
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
                          executePlayerAttack(idx, 0);
                        } else {
                          soundManager.playSfx('button');
                          setSelectedAttackIdx(idx);
                          soundManager.playVoice('prompt_attack_confirm', 'Tippe noch einmal auf die Attacke!');
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full border-2 flex items-center gap-1.5 transition-all active:scale-95 shadow-lg cursor-pointer ${
                        canUse
                          ? isSelected
                            ? 'bg-gradient-to-r from-amber-400 to-yellow-400 border-white text-slate-950 scale-105 shadow-amber-400/50 animate-bounce font-black'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-500 border-white/80 text-slate-950 font-black'
                          : 'bg-slate-900/70 border-slate-700 text-slate-500 opacity-45 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-0.5">
                        {atk.cost.map((cType, cIdx) => (
                          <EnergyBadge key={cIdx} type={cType} size="sm" />
                        ))}
                      </div>
                      <span className="font-black text-xs leading-none">{atk.name}</span>
                      {willDealWeakness && (
                        <span className="text-[8px] font-black uppercase text-rose-950 bg-rose-300 px-1 rounded-full">
                          +20 💥
                        </span>
                      )}
                      <span className="bg-slate-950/85 text-amber-300 px-2 py-0.5 rounded-full text-xs font-black">
                        {atk.damage}
                      </span>
                    </button>
                  );
                })}

                {legalActions.canRetreat && (
                  <button
                    onClick={() => {
                      if (legalActions.retreatableBenchIndices && legalActions.retreatableBenchIndices.length > 0) {
                        soundManager.playVoice('prompt_promote', 'Wähle ein Pokémon von deiner Bank als Ersatz!');
                        handleAction({ type: 'RETREAT', benchIndex: legalActions.retreatableBenchIndices[0] });
                      }
                    }}
                    className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-600 text-slate-200 text-[10px] font-black flex items-center gap-1 shadow"
                  >
                    <ArrowLeftRight className="w-3 h-3 text-amber-400" />
                    <span>Rückzug</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 5. Mobile Portrait Bottom Bar: Hand + Pikachu Companion + Energy + Zug Beenden */}
          <div className="flex flex-col gap-1 z-30 shrink-0">
            {/* Pikachu Sub-Prompt & Energy Zone */}
            <div className="flex items-center justify-between gap-2 px-1">
              <PikachuCompanion
                promptText={legalActions.description}
                voiceKey={legalActions.voiceKey}
                emotion={gameState.lastDamageEvent?.isKo ? 'happy' : 'idle'}
                className="scale-90 origin-left"
              />

              {/* Energy Zone */}
              <div className="flex items-center gap-1.5 shrink-0 bg-slate-950/85 px-2.5 py-1 rounded-2xl border border-amber-400/60 shadow">
                <div
                  onClick={() => {
                    if (isLeviTurn && p1.energyZone.length > 0 && !gameState.energyAttachedThisTurn) {
                      soundManager.playSfx('button');
                      setSelectedEnergy((prev) => !prev);
                      soundManager.playVoice('prompt_energy', 'Zieh deine Energie auf ein Pokémon!');
                    }
                  }}
                  className={`p-0.5 rounded-full cursor-pointer transition-all ${
                    isLeviTurn && p1.energyZone.length > 0 && !gameState.energyAttachedThisTurn
                      ? selectedEnergy
                        ? 'ring-3 ring-white scale-110 animate-bounce'
                        : 'ring-2 ring-amber-400 animate-pulse'
                      : 'opacity-40 grayscale'
                  }`}
                >
                  <EnergyBadge type={p1.energyZone[0] || 'Feuer'} size="md" pulse={isLeviTurn && p1.energyZone.length > 0} />
                </div>
                <span className="text-[10px] font-black uppercase text-amber-300">Energie</span>
              </div>
            </div>

            {/* Hand Cards Row & Big "ZUG BEENDEN" Button */}
            <div className="flex items-end justify-between gap-1.5 px-1">
              <div className="flex-1 flex items-end justify-center -space-x-3 overflow-x-auto py-1 scrollbar-none touch-pan-x">
                {p1.hand.map((card, hIdx) => {
                  const isPlayableBasis = isLeviTurn && legalActions.playableHandIndices?.includes(hIdx);
                  const isEvolvable = isLeviTurn && legalActions.evolvableHandIndices?.some((e) => e.handIndex === hIdx);
                  const isTrainerPlayable = isLeviTurn && legalActions.playableTrainerIndices?.includes(hIdx);

                  return (
                    <div
                      key={hIdx}
                      onClick={() => {
                        if (isPlayableBasis) {
                          handleAction({ type: 'PLAY_BENCH', handIndex: hIdx });
                        } else if (isEvolvable) {
                          soundManager.playSfx('button');
                          setSelectedHandEvoIdx(hIdx);
                          soundManager.playVoice('prompt_evolve', 'Entwicklung bereit! Ziehe die Karte auf dein Pokémon!');
                        } else if (isTrainerPlayable) {
                          handleAction({ type: 'PLAY_TRAINER', handIndex: hIdx, target: 'active' });
                        } else {
                          setInspectedCard(card);
                        }
                      }}
                      className={`relative group transform transition-all duration-200 cursor-pointer origin-bottom hover:-translate-y-4 hover:scale-110 ${
                        isPlayableBasis || isEvolvable || isTrainerPlayable
                          ? 'ring-3 ring-amber-400 rounded-xl animate-pulse shadow-[0_0_15px_#f59e0b]'
                          : ''
                      }`}
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

              {/* ZUG BEENDEN BUTTON */}
              <button
                disabled={!isLeviTurn || gameState.turnPhase === 'promote_needed'}
                onClick={() => {
                  if (isLeviTurn && gameState.turnPhase !== 'promote_needed') {
                    handleAction({ type: 'END_TURN' });
                  }
                }}
                className={`relative overflow-hidden px-4 py-2.5 rounded-2xl font-black flex items-center gap-1.5 border-2 border-white shadow-xl shrink-0 transition-transform active:scale-95 ${
                  isLeviTurn && gameState.turnPhase !== 'promote_needed'
                    ? 'bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 text-slate-950 animate-pulse cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border-slate-700 opacity-40 cursor-not-allowed'
                }`}
              >
                <span className="font-black text-xs uppercase tracking-wider">FERTIG</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* HORIZONTAL STADIUM LAYOUT (TABLET / DESKTOP / MOBILE LANDSCAPE) */
        /* ============================================================ */
        <>
          {/* 2. Top Header (PvP Mode: Rotated for Papa; Solo Mode: Standard Info) */}
          {isPvP ? (
            <div className="relative z-30 rotate-180 flex items-center justify-between px-3 pb-1 pt-1 gap-2 bg-slate-950/70 rounded-3xl border border-slate-800 backdrop-blur-md">
              {/* Papa Avatar & Points */}
              <div className="flex items-center gap-3 bg-slate-900/90 px-3 py-1.5 rounded-2xl border border-slate-700 shadow-lg">
                <div className="w-9 h-9 rounded-full border-2 border-sky-400 bg-slate-950 p-0.5 flex items-center justify-center shrink-0">
                  <img src={`/images/trainers/${p2.avatar}.png`} alt={p2.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="font-black text-xs text-white block leading-tight">{p2.name}</span>
                  <span className="text-[9px] font-bold text-sky-300">{p2.deck.length} Karten</span>
                </div>
                {renderPoints(p2.points)}
              </div>

              {/* Papa Fanned Hand Cards */}
              <div className="flex items-end justify-center -space-x-3 sm:-space-x-4 overflow-visible py-1 px-2 max-w-2xl">
                {p2.hand.map((card, hIdx) => {
                  const isPlayable = !isLeviTurn && legalActions.playableHandIndices?.includes(hIdx);
                  const isEvolvable = !isLeviTurn && legalActions.evolvableHandIndices?.some((e) => e.handIndex === hIdx);

                  return (
                    <div
                      key={hIdx}
                      onClick={() => {
                        if (!isLeviTurn) {
                          if (isPlayable) {
                            handleAction({ type: 'PLAY_BENCH', handIndex: hIdx });
                          } else if (isEvolvable) {
                            soundManager.playSfx('button');
                            setSelectedHandEvoIdx(hIdx);
                          } else {
                            setInspectedCard(card);
                          }
                        }
                      }}
                      className={`relative group transform transition-all duration-300 cursor-pointer origin-bottom hover:-translate-y-6 hover:scale-110 hover:z-40 ${
                        !isLeviTurn && (isPlayable || isEvolvable)
                          ? 'ring-4 ring-sky-400 rounded-2xl animate-pulse shadow-[0_0_20px_#38bdf8]'
                          : ''
                      }`}
                      style={{
                        transform: `rotate(${(hIdx - (p2.hand.length - 1) / 2) * 4}deg)`
                      }}
                    >
                      <CardView
                        card={card}
                        size="hand"
                        isSelectable={!isLeviTurn && (isPlayable || isEvolvable)}
                        onInspect={() => setInspectedCard(card)}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Papa Energy Zone & Fertig Button */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] font-black uppercase text-sky-300">Energie</span>
                  <div
                    onClick={() => {
                      if (!isLeviTurn && p2.energyZone.length > 0 && !gameState.energyAttachedThisTurn) {
                        soundManager.playSfx('button');
                        setSelectedEnergy((prev) => !prev);
                      }
                    }}
                    className={`p-0.5 rounded-full cursor-pointer transition-all ${
                      !isLeviTurn && p2.energyZone.length > 0 && !gameState.energyAttachedThisTurn
                        ? selectedEnergy
                          ? 'ring-3 ring-white scale-110 shadow-[0_0_20px_rgba(255,255,255,0.9)] animate-bounce'
                          : 'ring-3 ring-sky-400 scale-105 shadow-[0_0_15px_rgba(56,189,248,0.8)] animate-pulse'
                        : 'opacity-40 grayscale'
                    }`}
                  >
                    <EnergyBadge type={p2.energyZone[0] || 'Wasser'} size="md" pulse={!isLeviTurn && p2.energyZone.length > 0} />
                  </div>
                </div>

                <button
                  disabled={isLeviTurn || gameState.turnPhase === 'promote_needed'}
                  onClick={() => {
                    if (!isLeviTurn && gameState.turnPhase !== 'promote_needed') {
                      handleAction({ type: 'END_TURN' });
                    }
                  }}
                  className={`relative overflow-hidden px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-black flex items-center gap-1.5 border-2 border-white shadow-xl transition-all active:scale-95 ${
                    !isLeviTurn && gameState.turnPhase !== 'promote_needed'
                      ? 'bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.9)] animate-bounce cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border-slate-700 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="absolute top-0 left-2 right-2 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-full pointer-events-none" />
                  <span className="font-black uppercase text-[10px] sm:text-xs">Zug beenden</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          ) : (
            <div className="relative z-30 flex items-center justify-between px-2 sm:px-3 pt-1">
              {/* Opponent Info */}
              <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/85 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl border-2 border-slate-700/80 backdrop-blur-md shadow-xl">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 border-sky-400 bg-slate-950 p-0.5 sm:p-1 flex items-center justify-center shrink-0">
                  <img src={`/images/trainers/${p2.avatar}.png`} alt={p2.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="font-black text-xs sm:text-base text-white block leading-tight">{p2.name}</span>
                  <span className="text-[9px] sm:text-xs font-bold text-sky-300">{p2.deck.length} Karten im Deck</span>
                </div>
                {/* Opponent 3D Deck Stack */}
                <div
                  className="relative w-6 h-9 sm:w-8 sm:h-11 rounded-lg overflow-hidden border border-amber-400/60 shadow-md shrink-0 hidden xs:block"
                  title={`${p2.deck.length} Karten im Deck`}
                >
                  <img src="/images/cards/card_back.webp" alt="Gegner Deck" className="w-full h-full object-cover" />
                </div>
                {renderPoints(p2.points)}
              </div>

              {/* Climax-Pinch Status Badge */}
              {isPinch && (
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 text-slate-950 font-black px-3 sm:px-4 py-1 rounded-full border-2 border-white shadow-[0_0_25px_rgba(251,191,36,0.9)] animate-bounce z-40">
                  <span className="text-sm">🔥</span>
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider">LETZTER PUNKT!</span>
                  <span className="text-sm">🔥</span>
                </div>
              )}

              {/* Right Corner Buttons */}
              <div className="flex items-center gap-1 sm:gap-2">
                {gymBadgeId && (
                  <GymBadge type={gymBadgeId} earned={storageService.loadProfile(allCards).badges.includes(gymBadgeId)} size="sm" />
                )}
                {/* 3D Pikachu Coin Toss Button */}
                <button
                  onClick={() => {
                    setShowCoinModal(true);
                    soundManager.playSfx('click');
                  }}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full bg-slate-900/85 border border-slate-700 text-xs font-black text-amber-300 hover:text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title="3D Pikachu Münze werfen"
                >
                  <span className="text-base leading-none">🪙</span>
                  <span className="hidden sm:inline">Münze</span>
                </button>
                {/* Rules / How to play */}
                <button
                  onClick={() => {
                    setShowRules(true);
                    soundManager.playSfx('click');
                  }}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full bg-slate-900/85 border border-amber-400/60 text-xs font-black text-amber-300 hover:bg-slate-800 shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title="Spielregeln vorlesen"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Regeln</span>
                </button>
                {/* Anim Speed Quick-Toggle */}
                <button
                  onClick={() => {
                    const next = animSpeed === 'cinematic' ? 'fast' : 'cinematic';
                    setAnimSpeed(next);
                    storageService.setBattleAnimSpeed(next);
                    soundManager.playSfx('click');
                  }}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full bg-slate-900/85 border border-slate-700 text-xs font-black shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title={animSpeed === 'cinematic' ? 'Tempo: Filmisch (Klicken für Schnell)' : 'Tempo: Schnell (Klicken für Filmisch)'}
                >
                  {animSpeed === 'cinematic' ? (
                    <>
                      <Film className="w-4 h-4 text-amber-400" />
                      <span className="hidden sm:inline text-amber-300">Filmisch</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline text-emerald-300">Schnell</span>
                    </>
                  )}
                </button>
                <button
                  onClick={toggleSound}
                  className="p-2 sm:p-2.5 rounded-full bg-slate-900/85 border border-slate-700 text-amber-300 hover:text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title="Musik umschalten"
                >
                  {bgmMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 sm:p-2.5 rounded-full bg-slate-900/85 border border-slate-700 text-slate-300 hover:text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
                  title="Einstellungen"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          )}

          {/* 3. Main Battle Arena (Clear Spatial Layout: Opponent Left, Clash Center, Levi Right) */}
          <div className="relative z-20 flex-1 flex items-center justify-between px-2 sm:px-8 my-auto max-w-7xl mx-auto w-full">
            {/* === OPPONENT / PAPA ZONE (Left Side) === */}
            <div className="flex items-center gap-2 sm:gap-6">
              {/* Opponent Bench (3 Stadium Slots) */}
              <div className="flex flex-col gap-1.5 sm:gap-2 bg-slate-950/60 p-2 sm:p-2.5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-xl">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 text-center">
                  Bank
                </span>
                {[0, 1, 2].map((idx) => {
                  const benchMon = p2.bench[idx];
                  const isPromotableP2 = isPvP && gameState.turnPhase === 'promote_needed' && p2.active === null && idx < p2.bench.length;
                  const isTargetOfEnergyP2 = isPvP && !isLeviTurn && selectedEnergy && benchMon;
                  const isPlayableEmptySlotP2 = isPvP && !isLeviTurn && !benchMon && legalActions.playableHandIndices && legalActions.playableHandIndices.length > 0;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (isPvP) {
                          if (isPromotableP2) {
                            handleAction({ type: 'PROMOTE', benchIndex: idx });
                          } else if (!isLeviTurn) {
                            if (isTargetOfEnergyP2) {
                              handleAction({ type: 'ATTACH_ENERGY', target: idx });
                            } else if (isPlayableEmptySlotP2 && legalActions.playableHandIndices) {
                              handleAction({ type: 'PLAY_BENCH', handIndex: legalActions.playableHandIndices[0] });
                            } else if (benchMon) {
                              setInspectedCard(benchMon.card);
                            }
                          }
                        }
                      }}
                      className={`relative w-11 xs:w-13 sm:w-16 md:w-18 aspect-[5/7] rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden shadow transition-all ${
                        isPvP && (isPromotableP2 || (!isLeviTurn && (isTargetOfEnergyP2 || isPlayableEmptySlotP2)))
                          ? 'border-sky-400 bg-sky-400/20 shadow-[0_0_18px_rgba(56,189,248,0.8)] scale-105 animate-pulse cursor-pointer'
                          : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                      }`}
                    >
                      {benchMon ? (
                        <>
                          <img
                            src={benchMon.card.artworkUrl}
                            alt={benchMon.card.name}
                            className="w-full h-full object-contain filter drop-shadow p-1"
                          />
                          {benchMon.attachedEnergy.length > 0 && (
                            <div className="absolute bottom-0.5 flex items-center gap-0.5 bg-slate-950/85 px-1 rounded-full border border-slate-700">
                              {benchMon.attachedEnergy.map((e, eIdx) => (
                                <EnergyBadge key={eIdx} type={e} size="sm" />
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-600 font-bold">
                          {isPlayableEmptySlotP2 ? 'Ablegen' : '+'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Opponent Active Pokémon Pedestal */}
              {renderActivePedestal(
                p2.active,
                false,
                getPreviewDamage('opponent'),
                false,
                isPvP
              )}

              {/* Papa Attack Action Buttons (PvP Mode, rotated 180 for Papa) */}
              {isPvP && p2.active && !isLeviTurn && !gameState.attackedThisTurn && gameState.turnNumber > 1 && (
                <div className="flex flex-col gap-2 z-30 rotate-180 animate-in fade-in">
                  {p2.active.card.attacks.map((atk, idx) => {
                    const canUse = canPayCost(p2.active!.attachedEnergy, atk.cost);
                    const isSelected = selectedAttackIdx === idx;
                    const willDealWeakness =
                      gameState.stage >= 2 && p1.active?.card.weakness?.type === p2.active!.card.types[0];

                    return (
                      <button
                        key={idx}
                        disabled={!canUse}
                        onClick={() => {
                          if (!canUse) return;
                          if (isSelected) {
                            executePlayerAttack(idx, 1);
                          } else {
                            soundManager.playSfx('button');
                            setSelectedAttackIdx(idx);
                            soundManager.playVoice('prompt_attack_confirm', 'Tippe noch einmal auf die Attacke zum Angreifen!');
                          }
                        }}
                        className={`relative overflow-hidden px-4 sm:px-5 py-2 sm:py-3 rounded-full border-2 flex items-center justify-between gap-2.5 sm:gap-3.5 transition-all active:scale-95 shadow-2xl cursor-pointer ${
                          canUse
                            ? isSelected
                              ? 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 border-white text-white scale-110 shadow-[0_0_25px_rgba(56,189,248,0.95)] animate-bounce font-black'
                              : 'bg-gradient-to-r from-sky-500 to-blue-500 border-sky-300 text-slate-950 hover:scale-105 shadow-[0_6px_20px_rgba(56,189,248,0.7)] font-black'
                            : 'bg-slate-900/60 border-slate-700 text-slate-500 opacity-40 cursor-not-allowed'
                        }`}
                      >
                        <div className="absolute top-0 left-3 right-3 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-full pointer-events-none" />
                        <div className="flex items-center gap-1 z-10">
                          {atk.cost.map((cType, cIdx) => (
                            <EnergyBadge key={cIdx} type={cType} size="sm" />
                          ))}
                        </div>
                        <div className="flex flex-col text-left z-10 px-1">
                          <span className="font-black text-xs sm:text-sm tracking-wide block leading-tight drop-shadow-xs">{atk.name}</span>
                          {willDealWeakness && (
                            <span className="text-[9px] font-black text-blue-900 uppercase bg-sky-300 px-1 rounded-full w-fit">
                              +20 Schwäche! 💥
                            </span>
                          )}
                        </div>
                        <div className="bg-slate-950/85 text-sky-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-sm sm:text-lg font-black shadow-inner border border-sky-400/40 z-10">
                          {atk.damage}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* === CENTER CLASH FIELD (Vast Open Stadium Floor with Animated VS Emblem) === */}
            <div className="hidden md:flex flex-col items-center justify-center pointer-events-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-3 border-amber-400/80 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.5)]">
                <span className="text-amber-400 font-black text-xl sm:text-2xl drop-shadow-[0_0_10px_#f59e0b]">
                  VS
                </span>
              </div>
            </div>

            {/* === LEVI ZONE (Right Side) === */}
            <div className="flex items-center gap-2 sm:gap-6">
              {/* Attack Action Buttons (Floating next to Levi's active Pokémon) */}
              {p1.active && isLeviTurn && !gameState.attackedThisTurn && gameState.turnNumber > 1 && (
                <div className="flex flex-col gap-2 sm:gap-2.5 z-30 animate-in fade-in">
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
                            executePlayerAttack(idx, 0);
                          } else {
                            soundManager.playSfx('button');
                            setSelectedAttackIdx(idx);
                            soundManager.playVoice('prompt_attack_confirm', 'Tippe noch einmal auf die Attacke zum Angreifen!');
                          }
                        }}
                        className={`relative overflow-hidden px-4 sm:px-5 py-2 sm:py-3 rounded-full border-2 flex items-center justify-between gap-2.5 sm:gap-3.5 transition-all active:scale-95 shadow-2xl cursor-pointer ${
                          canUse
                            ? isSelected
                              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 border-white text-slate-950 scale-110 shadow-[0_0_30px_rgba(251,191,36,0.95)] animate-bounce font-black'
                              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 border-white/80 text-slate-950 hover:scale-105 shadow-[0_6px_20px_rgba(251,191,36,0.7)] font-black'
                            : 'bg-slate-900/70 border-slate-700/80 text-slate-500 opacity-45 cursor-not-allowed'
                        }`}
                      >
                        <div className="absolute top-0 left-3 right-3 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-full pointer-events-none" />

                        <div className="flex items-center gap-1 z-10">
                          {atk.cost.map((cType, cIdx) => (
                            <EnergyBadge key={cIdx} type={cType} size="sm" />
                          ))}
                        </div>
                        <div className="flex flex-col text-left z-10 px-1">
                          <span className="font-black text-xs sm:text-sm tracking-wide block leading-tight drop-shadow-xs">
                            {atk.name}
                          </span>
                          {willDealWeakness && (
                            <span className="text-[9px] font-black uppercase text-rose-950 bg-rose-300 px-1.5 py-0.2 rounded-full w-fit">
                              +20 Schwäche! 💥
                            </span>
                          )}
                        </div>
                        <div className="bg-slate-950/85 text-amber-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-sm sm:text-lg font-black shadow-inner border border-amber-400/40 z-10">
                          {atk.damage}
                        </div>
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
                      className="relative overflow-hidden px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border-2 border-slate-600 text-slate-200 text-xs font-black flex items-center justify-center gap-2 shadow-lg active:scale-95 cursor-pointer"
                    >
                      <div className="absolute top-0 left-2 right-2 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-full pointer-events-none" />
                      <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                      <span>Rückzug ({p1.active.card.retreat} Energie)</span>
                    </button>
                  )}
                </div>
              )}

              {/* Levi Active Pokémon Pedestal */}
              {renderActivePedestal(
                p1.active,
                true,
                getPreviewDamage('levi'),
                false,
                false
              )}

              {/* Levi Bench (3 Stadium Slots) */}
              <div className="flex flex-col gap-1.5 sm:gap-2 bg-slate-950/60 p-2 sm:p-2.5 rounded-2xl border border-slate-800/80 backdrop-blur-md shadow-xl">
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-amber-400 text-center">
                  Bank
                </span>
                {[0, 1, 2].map((idx) => {
                  const benchMon = p1.bench[idx];
                  const isPromotable =
                    gameState.turnPhase === 'promote_needed' &&
                    p1.active === null &&
                    idx < p1.bench.length;
                  const isTargetOfEnergy = selectedEnergy && isLeviTurn && benchMon;
                  const isTargetOfEvo =
                    selectedHandEvoIdx !== null &&
                    isLeviTurn &&
                    legalActions.evolvableHandIndices?.some(
                      (e) => e.handIndex === selectedHandEvoIdx && e.targets.includes(idx)
                    );
                  const isPlayableEmptySlot =
                    !benchMon &&
                    isLeviTurn &&
                    legalActions.playableHandIndices &&
                    legalActions.playableHandIndices.length > 0;

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
                        } else if (isPlayableEmptySlot && legalActions.playableHandIndices) {
                          handleAction({ type: 'PLAY_BENCH', handIndex: legalActions.playableHandIndices[0] });
                        }
                      }}
                      className={`relative w-11 xs:w-13 sm:w-16 md:w-18 aspect-[5/7] rounded-xl border-2 flex flex-col items-center justify-center overflow-hidden cursor-pointer shadow-lg transition-all ${
                        isPromotable || isTargetOfEnergy || isTargetOfEvo || isPlayableEmptySlot
                          ? 'border-amber-400 bg-amber-400/20 shadow-[0_0_18px_rgba(251,191,36,0.8)] scale-105 animate-pulse'
                          : 'border-slate-800 bg-slate-950/80 hover:border-slate-700'
                      }`}
                    >
                      {benchMon ? (
                        <>
                          <img
                            src={benchMon.card.artworkUrl}
                            alt={benchMon.card.name}
                            className="w-full h-full object-contain filter drop-shadow p-1"
                          />
                          {benchMon.attachedEnergy.length > 0 && (
                            <div className="absolute bottom-0.5 flex items-center gap-0.5 bg-slate-950/85 px-1 rounded-full border border-slate-700">
                              {benchMon.attachedEnergy.map((e, eIdx) => (
                                <EnergyBadge key={eIdx} type={e} size="sm" />
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-[10px] text-amber-300 font-extrabold text-center px-1 leading-tight">
                          {isPlayableEmptySlot ? 'Hier tippen!' : '+'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4. Bottom Controls & Hand Area */}
          <div className="relative z-30 flex items-end justify-between px-2 sm:px-3 pb-1 pt-1 gap-2">
            {/* Pikachu Voice & Advice Companion */}
            <PikachuCompanion
              promptText={legalActions.description}
              voiceKey={legalActions.voiceKey}
              emotion={gameState.lastDamageEvent?.isKo ? 'happy' : 'idle'}
            />

            {/* Levi 3D Deck Stack */}
            <div
              className="relative w-10 h-14 sm:w-16 sm:h-22 rounded-xl overflow-hidden border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.6)] shrink-0 hidden sm:flex flex-col items-center justify-end group cursor-pointer transition-transform hover:scale-105"
              onClick={() => {
                soundManager.playVoice('deck_info', 'Das ist dein Kartenstapel! In jeder Runde ziehst du hier eine neue Karte!');
              }}
              title={`Dein Deck (${p1.deck.length} Karten)`}
            >
              <img src="/images/cards/card_back.webp" alt="Levis Deck" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end justify-center pb-1">
                <span className="text-[10px] sm:text-xs font-black text-amber-300 drop-shadow">
                  {p1.deck.length} 🎴
                </span>
              </div>
            </div>

            {/* Fanned Hand Cards (Spacious, Legible, Artworks Visible) */}
            <div className="flex items-end justify-center -space-x-3 sm:-space-x-4 overflow-visible py-1 sm:py-2 px-1 sm:px-2 max-w-3xl">
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
                        soundManager.playVoice('prompt_evolve', 'Entwicklung bereit! Ziehe die Karte auf dein Pokémon!');
                      } else if (isTrainerPlayable) {
                        handleAction({ type: 'PLAY_TRAINER', handIndex: hIdx, target: 'active' });
                      } else {
                        setInspectedCard(card);
                      }
                    }}
                    className={`relative group transform transition-all duration-300 cursor-pointer origin-bottom hover:-translate-y-6 sm:hover:-translate-y-8 hover:scale-110 sm:hover:scale-115 hover:z-40 ${
                      isPlayableBasis || isEvolvable || isTrainerPlayable
                        ? 'ring-3 sm:ring-4 ring-amber-400 rounded-2xl animate-pulse shadow-[0_0_20px_#f59e0b]'
                        : ''
                    }`}
                    style={{
                      transform: `rotate(${(hIdx - (p1.hand.length - 1) / 2) * 4}deg)`
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

            {/* Energy Zone & Fertig Button */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Energy Zone */}
              <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-amber-300">
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
                  className={`p-0.5 sm:p-1 rounded-full cursor-pointer transition-all ${
                    isLeviTurn && p1.energyZone.length > 0 && !gameState.energyAttachedThisTurn
                      ? selectedEnergy
                        ? 'ring-3 sm:ring-4 ring-white scale-110 shadow-[0_0_25px_rgba(255,255,255,0.9)] animate-bounce'
                        : 'ring-2 sm:ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-950 scale-105 shadow-[0_0_20px_rgba(251,191,36,0.8)] animate-pulse'
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

              {/* TCG Pocket Glossy "ZUG BEENDEN" Pill Button */}
              <button
                disabled={!isLeviTurn || gameState.turnPhase === 'promote_needed'}
                onClick={() => {
                  if (isLeviTurn && gameState.turnPhase !== 'promote_needed') {
                    handleAction({ type: 'END_TURN' });
                  }
                }}
                className={`relative overflow-hidden px-4 sm:px-7 py-2.5 sm:py-3.5 rounded-full font-black flex items-center gap-1.5 sm:gap-2 border-2 border-white shadow-2xl transition-all active:scale-95 ${
                  isLeviTurn && gameState.turnPhase !== 'promote_needed'
                    ? 'bg-gradient-to-r from-emerald-500 via-green-400 to-teal-500 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.85)] hover:scale-105 animate-pulse cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border-slate-700 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="absolute top-0 left-3 right-3 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-full pointer-events-none" />
                <span className="font-black text-xs sm:text-sm uppercase tracking-wider drop-shadow-xs">ZUG BEENDEN</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[3]" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* 5. Attack Visual Effects & Projectiles */}
      <AttackEffects animData={animData} speed={animSpeed} />
      <CardDetailModal card={inspectedCard} onClose={() => setInspectedCard(null)} />

      {/* 5b. TCG Pocket Dynamic Turn Banner */}
      <TurnBanner
        banner={turnBanner}
        playerName={p1.name}
        opponentName={p2.name}
      />

      {/* 5c. 3D Pikachu Coin Toss Modal */}
      {showCoinModal && (
        <CoinTossModal
          onClose={() => setShowCoinModal(false)}
          title="Pikachu Glücksmünze"
        />
      )}

      {/* 5d. How To Play / Interactive Audio Rulebook */}
      {showRules && (
        <HowToPlayModal onClose={() => setShowRules(false)} />
      )}

      {/* 6. Victory / Defeat Modal */}
      {gameState.winner !== null && (
        <VictoryModal
          winnerName={gameState.players[gameState.winner].name}
          isLeviWinner={gameState.winner === 0}
          onPlayAgain={onExitMatch}
          onOpenBooster={onOpenBooster}
          winningPokemon={gameState.players[gameState.winner].active?.card || null}
          playerStars={gameState.players[0].points}
          opponentStars={gameState.players[1].points}
        />
      )}

      {/* 7. Parent Settings Modal */}
      {showSettings && (
        <ParentSettingsModal
          allCards={allCards}
          onClose={() => setShowSettings(false)}
          onResetMatch={onExitMatch}
          ruleLevel={gameState.stage}
          onSetRuleLevel={(lvl) => setGameState((prev) => ({ ...prev, stage: lvl }))}
          aiDifficulty={storageService.getAiDifficulty()}
          onSetAiDifficulty={(d) => {
            storageService.setAiDifficulty(d);
            setGameState((prev) => ({ ...prev, difficulty: d }));
          }}
        />
      )}
    </div>
  );
};
