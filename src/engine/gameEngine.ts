import {
  Action,
  Card,
  GameState,
  InPlayPokemon,
  LegalAction,
  PlayerState,
  PokemonType
} from '../types/game';

let instanceCounter = 0;
export function createInstanceId(cardId: string): string {
  instanceCounter += 1;
  return `${cardId}_${Date.now()}_${instanceCounter}`;
}

export function shuffleDeck<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function canPayCost(attached: PokemonType[], cost: PokemonType[]): boolean {
  if (cost.length === 0) return true;
  if (attached.length < cost.length) return false;

  const available = [...attached];
  const specificCosts = cost.filter((c) => c !== 'Farblos');
  const colorlessCosts = cost.filter((c) => c === 'Farblos');

  // First pay specific colored costs
  for (const c of specificCosts) {
    const idx = available.indexOf(c);
    if (idx === -1) return false;
    available.splice(idx, 1);
  }

  // Then pay colorless costs with any remaining energy
  return available.length >= colorlessCosts.length;
}

export function getDeckPrimaryType(deck: Card[]): PokemonType {
  const counts: Partial<Record<PokemonType, number>> = {};
  for (const c of deck) {
    for (const t of c.types) {
      if (t !== 'Farblos') {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
  }
  let bestType: PokemonType = 'Feuer';
  let maxCount = -1;
  for (const [t, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      bestType = t as PokemonType;
    }
  }
  return bestType;
}

export function setupInitialPlayer(
  id: string,
  name: string,
  avatar: string,
  rawDeck: Card[]
): PlayerState {
  let deck = shuffleDeck(rawDeck);
  let hand: Card[] = [];

  // Guarantee at least one Basis in starting hand (mulligan loop)
  while (true) {
    deck = shuffleDeck(rawDeck);
    hand = deck.slice(0, 5);
    const hasBasis = hand.some((c) => c.stage === 'Basis');
    if (hasBasis) {
      deck = deck.slice(5);
      break;
    }
  }

  // Pick first Basis for active spot
  const activeCardIndex = hand.findIndex((c) => c.stage === 'Basis');
  const activeCard = hand[activeCardIndex];
  hand.splice(activeCardIndex, 1);

  const active: InPlayPokemon = {
    instanceId: createInstanceId(activeCard.id),
    card: activeCard,
    currentHp: activeCard.hp,
    maxHp: activeCard.hp,
    attachedEnergy: [],
    canAttack: true
  };

  return {
    id,
    name,
    avatar,
    deck,
    hand,
    active,
    bench: [],
    discard: [],
    energyZone: [],
    points: 0
  };
}

export function createInitialGameState(
  p1Deck: Card[],
  p2Deck: Card[],
  options: {
    p1Name: string;
    p2Name: string;
    p1Avatar: string;
    p2Avatar: string;
    gameMode?: 'solo' | 'pvp';
  }
): GameState {
  const p1 = setupInitialPlayer('p1', options.p1Name, options.p1Avatar, p1Deck);
  const p2 = setupInitialPlayer('p2', options.p2Name, options.p2Avatar, p2Deck);

  // Turn 1 rule: P1 goes first, does NOT get energy on Turn 1, cannot attack on Turn 1
  return {
    gameMode: options.gameMode || 'solo',
    stage: 'level1',
    turnNumber: 1,
    activePlayerIndex: 0,
    players: [p1, p2],
    winner: null,
    log: [`Das Pokémon-Match beginnt! ${options.p1Name} ist am Zug!`],
    turnPhase: 'main',
    energyAttachedThisTurn: false,
    attackedThisTurn: false
  };
}

export function getLegalActions(state: GameState): LegalAction {
  if (state.winner !== null || state.turnPhase === 'game_over') {
    return {
      type: 'END_TURN',
      description: 'Das Spiel ist beendet.',
      canEndTurn: false
    };
  }

  const activePlayer = state.players[state.activePlayerIndex];
  const isTurn1 = state.turnNumber === 1 && state.activePlayerIndex === 0;

  // If a promotion is required
  if (state.turnPhase === 'promote_needed') {
    const inactivePlayerIndex = state.activePlayerIndex === 0 ? 1 : 0;
    const playerNeedingPromotion = state.players[inactivePlayerIndex];
    const promotableIndices = playerNeedingPromotion.bench.map((_, i) => i);
    return {
      type: 'PROMOTE',
      description: 'Wähle ein neues Pokémon von der Bank!',
      voiceKey: 'prompt_promote',
      promotableBenchIndices: promotableIndices
    };
  }

  // Energy targets
  const canAttach =
    !state.energyAttachedThisTurn && activePlayer.energyZone.length > 0;
  const validEnergyTargets: ('active' | number)[] = [];
  if (canAttach) {
    if (activePlayer.active) validEnergyTargets.push('active');
    activePlayer.bench.forEach((_, idx) => validEnergyTargets.push(idx));
  }

  // Playable bench cards (Basis Pokémon and bench space < 3)
  const playableHandIndices: number[] = [];
  if (activePlayer.bench.length < 3) {
    activePlayer.hand.forEach((card, idx) => {
      if (card.stage === 'Basis') {
        playableHandIndices.push(idx);
      }
    });
  }

  // Usable attacks (cannot attack on Turn 1, or if already attacked this turn)
  const usableAttackIndices: number[] = [];
  if (!isTurn1 && !state.attackedThisTurn && activePlayer.active) {
    const active = activePlayer.active;
    active.card.attacks.forEach((atk, idx) => {
      if (canPayCost(active.attachedEnergy, atk.cost)) {
        usableAttackIndices.push(idx);
      }
    });
  }

  const canEnd = true;

  // Contextual voice prompt for Levi
  let voiceKey = 'prompt_done';
  let description = 'Drücke auf Fertig, um deinen Zug zu beenden.';

  if (canAttach) {
    voiceKey = 'prompt_energy';
    description = 'Zieh deine Energie auf ein Pokémon!';
  } else if (usableAttackIndices.length > 0) {
    voiceKey = 'prompt_attack';
    description = 'Tippe auf eine Attacke, um anzugreifen!';
  } else if (playableHandIndices.length > 0) {
    voiceKey = 'prompt_bench';
    description = 'Lege ein Pokémon auf deine Bank!';
  }

  return {
    type: 'ATTACH_ENERGY',
    description,
    voiceKey,
    canAttachEnergy: canAttach,
    validEnergyTargets,
    playableHandIndices,
    usableAttackIndices,
    canEndTurn: canEnd
  };
}

export function reduceGameState(state: GameState, action: Action): GameState {
  if (state.winner !== null) return state;

  const activeIdx = state.activePlayerIndex;
  const opponentIdx = activeIdx === 0 ? 1 : 0;

  // Clone players shallowly, with deep clones for modified fields
  const pActive = { ...state.players[activeIdx] };
  const pOpponent = { ...state.players[opponentIdx] };
  const log = [...state.log];

  switch (action.type) {
    case 'ATTACH_ENERGY': {
      if (state.energyAttachedThisTurn || pActive.energyZone.length === 0) {
        return state;
      }
      const energyType = pActive.energyZone[0];
      const newEnergyZone = pActive.energyZone.slice(1);

      if (action.target === 'active') {
        if (!pActive.active) return state;
        pActive.active = {
          ...pActive.active,
          attachedEnergy: [...pActive.active.attachedEnergy, energyType]
        };
        log.push(`${pActive.name} legt eine ${energyType}-Energie an ${pActive.active.card.name} an.`);
      } else {
        const bIdx = action.target;
        if (!pActive.bench[bIdx]) return state;
        const newBench = [...pActive.bench];
        newBench[bIdx] = {
          ...newBench[bIdx],
          attachedEnergy: [...newBench[bIdx].attachedEnergy, energyType]
        };
        pActive.bench = newBench;
        log.push(`${pActive.name} legt eine ${energyType}-Energie an ${newBench[bIdx].card.name} auf der Bank an.`);
      }

      pActive.energyZone = newEnergyZone;
      const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, pOpponent] : [pOpponent, pActive];
      return {
        ...state,
        players: nextPlayers,
        energyAttachedThisTurn: true,
        log
      };
    }

    case 'PLAY_BENCH': {
      if (pActive.bench.length >= 3) return state;
      const card = pActive.hand[action.handIndex];
      if (!card || card.stage !== 'Basis') return state;

      const newHand = pActive.hand.filter((_, i) => i !== action.handIndex);
      const newBenchItem: InPlayPokemon = {
        instanceId: createInstanceId(card.id),
        card,
        currentHp: card.hp,
        maxHp: card.hp,
        attachedEnergy: [],
        canAttack: false
      };

      pActive.hand = newHand;
      pActive.bench = [...pActive.bench, newBenchItem];
      log.push(`${pActive.name} ruft ${card.name} auf die Bank!`);

      const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, pOpponent] : [pOpponent, pActive];
      return {
        ...state,
        players: nextPlayers,
        log
      };
    }

    case 'ATTACK': {
      if (state.attackedThisTurn || !pActive.active || !pOpponent.active) return state;
      if (state.turnNumber === 1 && activeIdx === 0) return state; // Turn 1 first player cannot attack

      const activeMon = pActive.active;
      const attack = activeMon.card.attacks[action.attackIndex];
      if (!attack || !canPayCost(activeMon.attachedEnergy, attack.cost)) return state;

      const dmg = attack.damage;
      const newOpponentHp = Math.max(0, pOpponent.active.currentHp - dmg);
      const isKo = newOpponentHp === 0;

      log.push(`${activeMon.card.name} setzt ${attack.name} ein und fügt ${dmg} Schaden zu!`);

      const targetId = pOpponent.active.instanceId;
      pOpponent.active = {
        ...pOpponent.active,
        currentHp: newOpponentHp
      };

      if (isKo) {
        const victimCard = pOpponent.active.card;
        const pointsEarned = victimCard.isEx ? 2 : 1;
        pActive.points += pointsEarned;
        pOpponent.discard = [...pOpponent.discard, victimCard];
        pOpponent.active = null;

        log.push(`${victimCard.name} wurde besiegt! ${pActive.name} erhält ${pointsEarned} Punkt(e)!`);

        // Check if game over by points
        if (pActive.points >= 3) {
          log.push(`🏆 ${pActive.name} hat 3 Punkte erreicht und gewinnt das Spiel!`);
          const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, pOpponent] : [pOpponent, pActive];
          return {
            ...state,
            players: nextPlayers,
            winner: activeIdx,
            turnPhase: 'game_over',
            attackedThisTurn: true,
            lastDamageEvent: {
              targetInstanceId: targetId,
              damage: dmg,
              isKo: true
            },
            log
          };
        }

        // Check if opponent has no bench Pokémon
        if (pOpponent.bench.length === 0) {
          log.push(`🏆 ${pOpponent.name} hat keine Pokémon mehr auf der Bank! ${pActive.name} gewinnt!`);
          const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, pOpponent] : [pOpponent, pActive];
          return {
            ...state,
            players: nextPlayers,
            winner: activeIdx,
            turnPhase: 'game_over',
            attackedThisTurn: true,
            lastDamageEvent: {
              targetInstanceId: targetId,
              damage: dmg,
              isKo: true
            },
            log
          };
        }

        // Opponent must promote from bench
        const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, pOpponent] : [pOpponent, pActive];
        return {
          ...state,
          players: nextPlayers,
          turnPhase: 'promote_needed',
          attackedThisTurn: true,
          lastDamageEvent: {
            targetInstanceId: targetId,
            damage: dmg,
            isKo: true
          },
          log
        };
      }

      // Not a K.O., attack ends current player's attacking options
      const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, pOpponent] : [pOpponent, pActive];
      return {
        ...state,
        players: nextPlayers,
        attackedThisTurn: true,
        lastDamageEvent: {
          targetInstanceId: targetId,
          damage: dmg,
          isKo: false
        },
        log
      };
    }

    case 'PROMOTE': {
      if (state.turnPhase !== 'promote_needed') return state;
      // Opponent is the one whose active was knocked out
      const promotingPlayer = pOpponent;
      const bIdx = action.benchIndex;
      if (!promotingPlayer.bench[bIdx]) return state;

      const newActive = promotingPlayer.bench[bIdx];
      const newBench = promotingPlayer.bench.filter((_, i) => i !== bIdx);
      promotingPlayer.active = newActive;
      promotingPlayer.bench = newBench;

      log.push(`${promotingPlayer.name} schickt ${newActive.card.name} in den Kampf!`);

      const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, promotingPlayer] : [promotingPlayer, pActive];

      // End current player turn after promotion resolves
      return endTurnTransition({
        ...state,
        players: nextPlayers,
        turnPhase: 'main',
        log
      });
    }

    case 'END_TURN': {
      if (state.turnPhase === 'promote_needed') return state;
      return endTurnTransition({
        ...state,
        players: activeIdx === 0 ? [pActive, pOpponent] : [pOpponent, pActive],
        log
      });
    }

    default:
      return state;
  }
}

function endTurnTransition(state: GameState): GameState {
  const nextActiveIdx: 0 | 1 = state.activePlayerIndex === 0 ? 1 : 0;
  const nextPlayer = { ...state.players[nextActiveIdx] };
  const currentTurn = state.turnNumber + 1;
  const log = [...state.log];

  // Draw 1 card if deck not empty
  if (nextPlayer.deck.length > 0) {
    const drawn = nextPlayer.deck[0];
    nextPlayer.deck = nextPlayer.deck.slice(1);
    nextPlayer.hand = [...nextPlayer.hand, drawn];
  }

  // Generate 1 energy in Energy Zone matching deck primary type
  const energyType = getDeckPrimaryType(nextPlayer.deck.concat(nextPlayer.hand));
  nextPlayer.energyZone = [energyType];

  log.push(`Zug ${currentTurn}: ${nextPlayer.name} ist dran.`);

  const nextPlayers: [PlayerState, PlayerState] =
    nextActiveIdx === 0 ? [nextPlayer, state.players[1]] : [state.players[0], nextPlayer];

  return {
    ...state,
    turnNumber: currentTurn,
    activePlayerIndex: nextActiveIdx,
    players: nextPlayers,
    energyAttachedThisTurn: false,
    attackedThisTurn: false,
    turnPhase: 'main',
    lastDamageEvent: undefined,
    log
  };
}

/**
 * Solo Mode AI (Opponent / Gym Leader):
 * Evaluates best legal move and returns it.
 */
export function getAiAction(state: GameState): Action | null {
  if (state.winner !== null) return null;

  const aiIdx = state.activePlayerIndex;
  const aiPlayer = state.players[aiIdx];
  const opponent = state.players[aiIdx === 0 ? 1 : 0];

  // 1. If promotion needed
  if (state.turnPhase === 'promote_needed') {
    if (aiPlayer.bench.length > 0) {
      // Pick bench mon with highest HP
      let bestIdx = 0;
      let maxHp = -1;
      aiPlayer.bench.forEach((b, i) => {
        if (b.currentHp > maxHp) {
          maxHp = b.currentHp;
          bestIdx = i;
        }
      });
      return { type: 'PROMOTE', benchIndex: bestIdx };
    }
    return null;
  }

  // 2. Play bench cards if slot available
  if (aiPlayer.bench.length < 3) {
    const basisIdx = aiPlayer.hand.findIndex((c) => c.stage === 'Basis');
    if (basisIdx !== -1) {
      return { type: 'PLAY_BENCH', handIndex: basisIdx };
    }
  }

  // 3. Attach energy if available
  if (!state.energyAttachedThisTurn && aiPlayer.energyZone.length > 0) {
    // Prefer active if it can attack or needs energy
    if (aiPlayer.active) {
      return { type: 'ATTACH_ENERGY', target: 'active' };
    }
    if (aiPlayer.bench.length > 0) {
      return { type: 'ATTACH_ENERGY', target: 0 };
    }
  }

  // 4. Attack if possible
  if (!state.attackedThisTurn && aiPlayer.active && opponent.active) {
    const isTurn1 = state.turnNumber === 1 && aiIdx === 0;
    if (!isTurn1) {
      const active = aiPlayer.active;
      let bestAttackIdx = -1;
      let maxDmg = -1;

      active.card.attacks.forEach((atk, idx) => {
        if (canPayCost(active.attachedEnergy, atk.cost)) {
          // Check if this attack can K.O. opponent
          if (opponent.active && atk.damage >= opponent.active.currentHp) {
            bestAttackIdx = idx;
            maxDmg = 9999;
          } else if (atk.damage > maxDmg) {
            maxDmg = atk.damage;
            bestAttackIdx = idx;
          }
        }
      });

      if (bestAttackIdx !== -1) {
        return { type: 'ATTACK', attackIndex: bestAttackIdx };
      }
    }
  }

  // 5. Otherwise end turn
  return { type: 'END_TURN' };
}
