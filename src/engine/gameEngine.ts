import {
  Action,
  Card,
  GameState,
  InPlayPokemon,
  LegalAction,
  PlayerState,
  PokemonType,
  StatusCondition
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

  for (const c of specificCosts) {
    const idx = available.indexOf(c);
    if (idx === -1) return false;
    available.splice(idx, 1);
  }

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

  // Guarantee at least one Basis Pokémon in starting hand
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
    status: 'none',
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
    ruleLevel?: 1 | 2 | 3;
  }
): GameState {
  const p1 = setupInitialPlayer('p1', options.p1Name, options.p1Avatar, p1Deck);
  const p2 = setupInitialPlayer('p2', options.p2Name, options.p2Avatar, p2Deck);

  return {
    gameMode: options.gameMode || 'solo',
    stage: options.ruleLevel || 1,
    turnNumber: 1,
    activePlayerIndex: 0,
    players: [p1, p2],
    winner: null,
    log: [`Das Pokémon-Match beginnt! ${options.p1Name} ist am Zug!`],
    turnPhase: 'main',
    energyAttachedThisTurn: false,
    attackedThisTurn: false,
    retreatedThisTurn: false,
    supporterPlayedThisTurn: false
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

  // Promotion needed
  if (state.turnPhase === 'promote_needed') {
    const inactivePlayerIndex = state.activePlayerIndex === 0 ? 1 : 0;
    const playerNeedingPromotion = state.players[inactivePlayerIndex];
    const promotableIndices = playerNeedingPromotion.bench.map((_, i) => i);
    return {
      type: 'PROMOTE',
      description: 'Wähle ein neues Pokémon von deiner Bank!',
      voiceKey: 'prompt_promote',
      promotableBenchIndices: promotableIndices
    };
  }

  // Energy Attachment
  const canAttach = !state.energyAttachedThisTurn && activePlayer.energyZone.length > 0;
  const validEnergyTargets: ('active' | number)[] = [];
  if (canAttach) {
    if (activePlayer.active) validEnergyTargets.push('active');
    activePlayer.bench.forEach((_, idx) => validEnergyTargets.push(idx));
  }

  // Basis Pokémon to Bench
  const playableHandIndices: number[] = [];
  if (activePlayer.bench.length < 3) {
    activePlayer.hand.forEach((card, idx) => {
      if (card.stage === 'Basis') {
        playableHandIndices.push(idx);
      }
    });
  }

  // Evolutions (Rule Level >= 2)
  const evolvableHandIndices: { handIndex: number; targets: ('active' | number)[] }[] = [];
  if (state.stage >= 2) {
    activePlayer.hand.forEach((card, hIdx) => {
      if (card.stage === 'Rang 1' || card.stage === 'Rang 2') {
        const targets: ('active' | number)[] = [];
        const matchesPre = (monCard: Card) => {
          if (card.evolvesFrom && monCard.name.replace('-ex', '').replace(' ex', '').trim() === card.evolvesFrom.trim()) {
            return true;
          }
          if (card.preDexId && monCard.dexId === card.preDexId) {
            return true;
          }
          return false;
        };

        if (activePlayer.active && matchesPre(activePlayer.active.card)) {
          targets.push('active');
        }
        activePlayer.bench.forEach((bMon, bIdx) => {
          if (matchesPre(bMon.card)) {
            targets.push(bIdx);
          }
        });

        if (targets.length > 0) {
          evolvableHandIndices.push({ handIndex: hIdx, targets });
        }
      }
    });
  }

  // Retreat (Rule Level >= 2)
  let canRetreat = false;
  const retreatableBenchIndices: number[] = [];
  if (
    state.stage >= 2 &&
    !state.retreatedThisTurn &&
    activePlayer.active &&
    activePlayer.active.status !== 'asleep' &&
    activePlayer.bench.length > 0
  ) {
    const retreatCost = activePlayer.active.card.retreat;
    if (activePlayer.active.attachedEnergy.length >= retreatCost) {
      canRetreat = true;
      activePlayer.bench.forEach((_, bIdx) => retreatableBenchIndices.push(bIdx));
    }
  }

  // Trainer Cards (Rule Level >= 3)
  const playableTrainerIndices: number[] = [];
  if (state.stage >= 3) {
    activePlayer.hand.forEach((card, idx) => {
      if (card.stage === 'Trainer') {
        if (card.trainerType === 'Unterstützer' && state.supporterPlayedThisTurn) {
          return;
        }
        playableTrainerIndices.push(idx);
      }
    });
  }

  // Attacks
  const usableAttackIndices: number[] = [];
  if (!isTurn1 && !state.attackedThisTurn && activePlayer.active) {
    const active = activePlayer.active;
    const isImpaired = active.status === 'asleep' || active.status === 'paralyzed';
    if (!isImpaired) {
      active.card.attacks.forEach((atk, idx) => {
        if (canPayCost(active.attachedEnergy, atk.cost)) {
          usableAttackIndices.push(idx);
        }
      });
    }
  }

  let voiceKey = 'prompt_done';
  let description = 'Drücke auf Fertig, um deinen Zug zu beenden.';

  if (canAttach) {
    voiceKey = 'prompt_energy';
    description = 'Zieh deine Energie auf ein Pokémon!';
  } else if (evolvableHandIndices.length > 0) {
    voiceKey = 'prompt_bench';
    description = 'Du kannst ein Pokémon entwickeln!';
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
    evolvableHandIndices,
    canRetreat,
    retreatableBenchIndices,
    playableTrainerIndices,
    usableAttackIndices,
    canEndTurn: true
  };
}

export function reduceGameState(state: GameState, action: Action): GameState {
  if (state.winner !== null) return state;

  const activeIdx = state.activePlayerIndex;
  const opponentIdx = activeIdx === 0 ? 1 : 0;

  const pActive = { ...state.players[activeIdx] };
  const pOpponent = { ...state.players[opponentIdx] };
  const log = [...state.log];

  switch (action.type) {
    case 'ATTACH_ENERGY': {
      if (state.energyAttachedThisTurn || pActive.energyZone.length === 0) return state;
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
        status: 'none',
        canAttack: false
      };

      pActive.hand = newHand;
      pActive.bench = [...pActive.bench, newBenchItem];
      log.push(`${pActive.name} ruft ${card.name} auf die Bank!`);

      const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, pOpponent] : [pOpponent, pActive];
      return { ...state, players: nextPlayers, log };
    }

    case 'EVOLVE': {
      if (state.stage < 2) return state;
      const card = pActive.hand[action.handIndex];
      if (!card || (card.stage !== 'Rang 1' && card.stage !== 'Rang 2')) return state;

      const newHand = pActive.hand.filter((_, i) => i !== action.handIndex);

      if (action.target === 'active') {
        if (!pActive.active) return state;
        const prevHp = pActive.active.card.hp;
        const hpDiff = card.hp - prevHp;
        pActive.active = {
          ...pActive.active,
          card,
          maxHp: card.hp,
          currentHp: pActive.active.currentHp + hpDiff,
          status: 'none' // Evolution cures status conditions!
        };
        log.push(`✨ ${pActive.name} entwickelt ${card.evolvesFrom} zu ${card.name}!`);
      } else {
        const bIdx = action.target;
        if (!pActive.bench[bIdx]) return state;
        const prevHp = pActive.bench[bIdx].card.hp;
        const hpDiff = card.hp - prevHp;
        const newBench = [...pActive.bench];
        newBench[bIdx] = {
          ...newBench[bIdx],
          card,
          maxHp: card.hp,
          currentHp: newBench[bIdx].currentHp + hpDiff,
          status: 'none'
        };
        pActive.bench = newBench;
        log.push(`✨ ${pActive.name} entwickelt ${card.evolvesFrom} auf der Bank zu ${card.name}!`);
      }

      pActive.hand = newHand;
      const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, pOpponent] : [pOpponent, pActive];
      return { ...state, players: nextPlayers, log };
    }

    case 'RETREAT': {
      if (state.stage < 2 || state.retreatedThisTurn || !pActive.active || pActive.bench.length === 0) {
        return state;
      }
      const bIdx = action.benchIndex;
      if (!pActive.bench[bIdx]) return state;

      const cost = pActive.active.card.retreat;
      if (pActive.active.attachedEnergy.length < cost) return state;

      // Discard retreat energy
      const remainingEnergy = pActive.active.attachedEnergy.slice(cost);
      const oldActive = { ...pActive.active, attachedEnergy: remainingEnergy };
      const newActive = { ...pActive.bench[bIdx] };

      const newBench = [...pActive.bench];
      newBench[bIdx] = oldActive;
      pActive.active = newActive;
      pActive.bench = newBench;

      log.push(`${pActive.name} zieht ${oldActive.card.name} zurück und schickt ${newActive.card.name} nach vorn!`);

      const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, pOpponent] : [pOpponent, pActive];
      return {
        ...state,
        players: nextPlayers,
        retreatedThisTurn: true,
        log
      };
    }

    case 'PLAY_TRAINER': {
      if (state.stage < 3) return state;
      const card = pActive.hand[action.handIndex];
      if (!card || card.stage !== 'Trainer') return state;

      const newHand = pActive.hand.filter((_, i) => i !== action.handIndex);
      pActive.hand = newHand;
      pActive.discard = [...pActive.discard, card];

      // 1. Trank (Heal 20 HP)
      if (card.name === 'Trank') {
        const target = action.target === 'active' || action.target === undefined ? pActive.active : pActive.bench[action.target];
        if (target) {
          const healed = Math.min(target.maxHp, target.currentHp + 20);
          target.currentHp = healed;
          log.push(`💊 ${pActive.name} setzt Trank ein und heilt 20 KP bei ${target.card.name}!`);
        }
      }
      // 2. Pokéball (Draw 1 basic Pokémon)
      else if (card.name === 'Pokéball') {
        const basisIdx = pActive.deck.findIndex((c) => c.stage === 'Basis');
        if (basisIdx !== -1) {
          const pulled = pActive.deck[basisIdx];
          pActive.deck = pActive.deck.filter((_, i) => i !== basisIdx);
          pActive.hand = [...pActive.hand, pulled];
          log.push(`🔴 Pokéball zieht ${pulled.name} auf die Hand!`);
        }
      }
      // 3. Forschung des Professors (Draw 2 cards)
      else if (card.name.includes('Professor')) {
        const drawCount = Math.min(2, pActive.deck.length);
        const drawn = pActive.deck.slice(0, drawCount);
        pActive.deck = pActive.deck.slice(drawCount);
        pActive.hand = [...pActive.hand, ...drawn];
        log.push(`📚 Forschung des Professors zieht 2 neue Karten!`);
      }

      const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, pOpponent] : [pOpponent, pActive];
      return {
        ...state,
        players: nextPlayers,
        supporterPlayedThisTurn: card.trainerType === 'Unterstützer' ? true : state.supporterPlayedThisTurn,
        log
      };
    }

    case 'ATTACK': {
      if (state.attackedThisTurn || !pActive.active || !pOpponent.active) return state;
      if (state.turnNumber === 1 && activeIdx === 0) return state;

      const activeMon = pActive.active;
      const attack = activeMon.card.attacks[action.attackIndex];
      if (!attack || !canPayCost(activeMon.attachedEnergy, attack.cost)) return state;

      let dmg = attack.damage;
      let isSuperEffective = false;

      // Weakness Check (Rule Level >= 2)
      if (state.stage >= 2 && pOpponent.active.card.weakness) {
        const weakType = pOpponent.active.card.weakness.type;
        const attackerPrimary = activeMon.card.types[0];
        if (attackerPrimary === weakType || (weakType === 'Unlicht' && attackerPrimary === 'Finsternis')) {
          dmg += 20;
          isSuperEffective = true;
          log.push(`💥 Sehr effektiv gegen die Schwäche (+20 Schaden)!`);
        }
      }

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

        log.push(`🏆 ${victimCard.name} wurde besiegt! ${pActive.name} erhält ${pointsEarned} Punkt(e)!`);

        if (pActive.points >= 3 || pOpponent.bench.length === 0) {
          log.push(`🎉 ${pActive.name} gewinnt das Pokémon-Match!`);
          const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, pOpponent] : [pOpponent, pActive];
          return {
            ...state,
            players: nextPlayers,
            winner: activeIdx,
            turnPhase: 'game_over',
            attackedThisTurn: true,
            lastDamageEvent: { targetInstanceId: targetId, damage: dmg, isKo: true, isSuperEffective },
            log
          };
        }

        const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, pOpponent] : [pOpponent, pActive];
        return {
          ...state,
          players: nextPlayers,
          turnPhase: 'promote_needed',
          attackedThisTurn: true,
          lastDamageEvent: { targetInstanceId: targetId, damage: dmg, isKo: true, isSuperEffective },
          log
        };
      }

      const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, pOpponent] : [pOpponent, pActive];
      return {
        ...state,
        players: nextPlayers,
        attackedThisTurn: true,
        lastDamageEvent: { targetInstanceId: targetId, damage: dmg, isKo: false, isSuperEffective },
        log
      };
    }

    case 'PROMOTE': {
      if (state.turnPhase !== 'promote_needed') return state;
      const promotingPlayer = pOpponent;
      const bIdx = action.benchIndex;
      if (!promotingPlayer.bench[bIdx]) return state;

      const newActive = promotingPlayer.bench[bIdx];
      const newBench = promotingPlayer.bench.filter((_, i) => i !== bIdx);
      promotingPlayer.active = newActive;
      promotingPlayer.bench = newBench;

      log.push(`${promotingPlayer.name} schickt ${newActive.card.name} in den Kampf!`);

      const nextPlayers: [PlayerState, PlayerState] = activeIdx === 0 ? [pActive, promotingPlayer] : [promotingPlayer, pActive];

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

  // End of turn status check: Poison tick & Sleep check (Rule Level >= 3)
  if (state.stage >= 3) {
    [state.players[0], state.players[1]].forEach((p) => {
      if (p.active && p.active.status === 'poisoned') {
        p.active.currentHp = Math.max(0, p.active.currentHp - 10);
        log.push(`🧪 ${p.active.card.name} leidet unter Gift (-10 KP)!`);
      }
      if (p.active && p.active.status === 'asleep') {
        if (Math.random() < 0.5) {
          p.active.status = 'none';
          log.push(`⏰ ${p.active.card.name} ist aufgewacht!`);
        }
      }
      if (p.active && p.active.status === 'paralyzed') {
        p.active.status = 'none';
      }
    });
  }

  // Draw 1 card
  if (nextPlayer.deck.length > 0) {
    const drawn = nextPlayer.deck[0];
    nextPlayer.deck = nextPlayer.deck.slice(1);
    nextPlayer.hand = [...nextPlayer.hand, drawn];
  }

  // Energy generation
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
    retreatedThisTurn: false,
    supporterPlayedThisTurn: false,
    turnPhase: 'main',
    lastDamageEvent: undefined,
    log
  };
}

export function getAiAction(state: GameState): Action | null {
  if (state.winner !== null) return null;

  const aiIdx = state.activePlayerIndex;
  const aiPlayer = state.players[aiIdx];
  const opponent = state.players[aiIdx === 0 ? 1 : 0];

  // 1. Promotion
  if (state.turnPhase === 'promote_needed') {
    if (aiPlayer.bench.length > 0) {
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

  // 2. Play Trainer (Potion if damaged)
  if (state.stage >= 3) {
    const potionIdx = aiPlayer.hand.findIndex((c) => c.name === 'Trank');
    if (potionIdx !== -1 && aiPlayer.active && aiPlayer.active.currentHp < aiPlayer.active.maxHp - 20) {
      return { type: 'PLAY_TRAINER', handIndex: potionIdx, target: 'active' };
    }
  }

  // 3. Evolve (Rule Level >= 2)
  if (state.stage >= 2) {
    const evoHandIdx = aiPlayer.hand.findIndex(
      (c) =>
        (c.stage === 'Rang 1' || c.stage === 'Rang 2') &&
        aiPlayer.active &&
        c.evolvesFrom === aiPlayer.active.card.name.replace('-ex', '').trim()
    );
    if (evoHandIdx !== -1) {
      return { type: 'EVOLVE', handIndex: evoHandIdx, target: 'active' };
    }
  }

  // 4. Play bench cards
  if (aiPlayer.bench.length < 3) {
    const basisIdx = aiPlayer.hand.findIndex((c) => c.stage === 'Basis');
    if (basisIdx !== -1) {
      return { type: 'PLAY_BENCH', handIndex: basisIdx };
    }
  }

  // 5. Attach energy
  if (!state.energyAttachedThisTurn && aiPlayer.energyZone.length > 0) {
    if (aiPlayer.active) return { type: 'ATTACH_ENERGY', target: 'active' };
    if (aiPlayer.bench.length > 0) return { type: 'ATTACH_ENERGY', target: 0 };
  }

  // 6. Attack
  if (!state.attackedThisTurn && aiPlayer.active && opponent.active) {
    const isTurn1 = state.turnNumber === 1 && aiIdx === 0;
    if (!isTurn1) {
      const active = aiPlayer.active;
      let bestAttackIdx = -1;
      let maxDmg = -1;

      active.card.attacks.forEach((atk, idx) => {
        if (canPayCost(active.attachedEnergy, atk.cost)) {
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

  return { type: 'END_TURN' };
}
