import { describe, it, expect } from 'vitest';
import {
  canPayCost,
  createInitialGameState,
  getLegalActions,
  reduceGameState,
  getAiAction
} from './gameEngine';
import { Card } from '../types/game';

const dummyGlumanda: Card = {
  id: 'A1-033',
  dexId: 4,
  name: 'Glumanda',
  types: ['Feuer'],
  hp: 60,
  stage: 'Basis',
  isEx: false,
  attacks: [
    { name: 'Kratzer', cost: ['Farblos'], damage: 10 },
    { name: 'Glut', cost: ['Feuer'], damage: 30 }
  ],
  retreat: 1,
  weakness: { type: 'Wasser', value: '+20' },
  artworkUrl: '/images/pokemon/4.webp',
  cryUrl: '/audio/cries/4.ogg',
  cardImageUrl: '/images/cards/A1-033.webp'
};

const dummyGlutexo: Card = {
  id: 'A1-034',
  dexId: 5,
  name: 'Glutexo',
  types: ['Feuer'],
  hp: 90,
  stage: 'Rang 1',
  isEx: false,
  attacks: [{ name: 'Flammenwurf', cost: ['Feuer', 'Farblos'], damage: 50 }],
  retreat: 2,
  weakness: { type: 'Wasser', value: '+20' },
  evolvesFrom: 'Glumanda',
  preDexId: 4,
  artworkUrl: '/images/pokemon/5.webp',
  cryUrl: '/audio/cries/5.ogg',
  cardImageUrl: '/images/cards/A1-034.webp'
};

const dummySchiggy: Card = {
  id: 'A1-053',
  dexId: 7,
  name: 'Schiggy',
  types: ['Wasser'],
  hp: 60,
  stage: 'Basis',
  isEx: false,
  attacks: [
    { name: 'Tackle', cost: ['Farblos'], damage: 10 },
    { name: 'Blubber', cost: ['Wasser'], damage: 20 }
  ],
  retreat: 1,
  weakness: { type: 'Elektro', value: '+20' },
  artworkUrl: '/images/pokemon/7.webp',
  cryUrl: '/audio/cries/7.ogg',
  cardImageUrl: '/images/cards/A1-053.webp'
};

const dummyTrank: Card = {
  id: 'P-A-001',
  dexId: 0,
  name: 'Trank',
  types: ['Farblos'],
  hp: 0,
  stage: 'Trainer',
  isEx: false,
  attacks: [],
  retreat: 0,
  trainerType: 'Item',
  artworkUrl: '/images/cards/P-A-001.webp',
  cryUrl: '',
  cardImageUrl: '/images/cards/P-A-001.webp'
};

function makeDeck(sample: Card): Card[] {
  const d: Card[] = [];
  for (let i = 0; i < 20; i++) {
    d.push({ ...sample, id: `${sample.id}_${i}` });
  }
  return d;
}

describe('Game Engine Level 1, 2 and 3', () => {
  it('correctly calculates weakness damage in Rule Level 2', () => {
    const p1Deck = makeDeck(dummySchiggy); // Wasser attacker
    const p2Deck = makeDeck(dummyGlumanda); // Feuer defender (weakness Wasser)

    let state = createInitialGameState(p1Deck, p2Deck, {
      p1Name: 'Misty',
      p2Name: 'Levi',
      p1Avatar: 'misty',
      p2Avatar: 'levi',
      ruleLevel: 2
    });

    // Advance to turn 2 (Levi), then turn 3 (Misty)
    state = reduceGameState(state, { type: 'END_TURN' });
    state = reduceGameState(state, { type: 'END_TURN' });

    // Attach water energy to Schiggy
    state = reduceGameState(state, { type: 'ATTACH_ENERGY', target: 'active' });

    // Schiggy uses Blubber (20 damage base + 20 weakness = 40 damage!)
    const hpBefore = state.players[1].active!.currentHp;
    state = reduceGameState(state, { type: 'ATTACK', attackIndex: 1 });

    expect(state.players[1].active!.currentHp).toBe(hpBefore - 40);
    expect(state.lastDamageEvent?.isSuperEffective).toBe(true);
  });

  it('correctly executes Evolution in Rule Level 2', () => {
    const p1Deck = makeDeck(dummyGlumanda);
    const p2Deck = makeDeck(dummySchiggy);

    let state = createInitialGameState(p1Deck, p2Deck, {
      p1Name: 'Levi',
      p2Name: 'Papa',
      p1Avatar: 'levi',
      p2Avatar: 'papa',
      ruleLevel: 2
    });

    // Put Glutexo in Levi hand
    state.players[0].hand.push(dummyGlutexo);
    const glutexoHandIdx = state.players[0].hand.length - 1;

    // Evolve active Glumanda to Glutexo
    state = reduceGameState(state, {
      type: 'EVOLVE',
      handIndex: glutexoHandIdx,
      target: 'active'
    });

    expect(state.players[0].active!.card.name).toBe('Glutexo');
    // In 'leicht' mode, Levi's Pokémon preserves the +20 KP Pikachu-Schutzschild
    expect(state.players[0].active!.maxHp).toBe(110);
    expect(state.players[0].active!.currentHp).toBe(110);
    expect(state.players[0].active!.shieldBonus).toBe(20);
  });

  it('correctly uses base HP in Rule Level 2 when difficulty is normal', () => {
    const p1Deck = makeDeck(dummyGlumanda);
    const p2Deck = makeDeck(dummySchiggy);

    let state = createInitialGameState(p1Deck, p2Deck, {
      p1Name: 'Levi',
      p2Name: 'Papa',
      p1Avatar: 'levi',
      p2Avatar: 'papa',
      ruleLevel: 2,
      difficulty: 'normal'
    });

    state.players[0].hand.push(dummyGlutexo);
    const glutexoHandIdx = state.players[0].hand.length - 1;

    state = reduceGameState(state, {
      type: 'EVOLVE',
      handIndex: glutexoHandIdx,
      target: 'active'
    });

    expect(state.players[0].active!.card.name).toBe('Glutexo');
    expect(state.players[0].active!.maxHp).toBe(90);
    expect(state.players[0].active!.currentHp).toBe(90);
    expect(state.players[0].active!.shieldBonus).toBeUndefined();
  });

  it('correctly executes Retreat in Rule Level 2', () => {
    const p1Deck = makeDeck(dummyGlumanda);
    const p2Deck = makeDeck(dummySchiggy);

    let state = createInitialGameState(p1Deck, p2Deck, {
      p1Name: 'Levi',
      p2Name: 'Papa',
      p1Avatar: 'levi',
      p2Avatar: 'papa',
      ruleLevel: 2
    });

    // Add bench Pokémon
    state.players[0].bench.push({
      instanceId: 'bench_1',
      card: dummySchiggy,
      currentHp: 60,
      maxHp: 60,
      attachedEnergy: [],
      status: 'none',
      canAttack: false
    });

    // Active has 1 energy attached
    state.players[0].active!.attachedEnergy = ['Feuer'];

    // Retreat active for bench[0]
    state = reduceGameState(state, { type: 'RETREAT', benchIndex: 0 });

    expect(state.players[0].active!.card.name).toBe('Schiggy');
    expect(state.players[0].bench[0].card.name).toBe('Glumanda');
    expect(state.players[0].bench[0].attachedEnergy.length).toBe(0); // 1 retreat cost paid
  });

  it('correctly executes Trainer card Trank in Rule Level 3', () => {
    const p1Deck = makeDeck(dummyGlumanda);
    const p2Deck = makeDeck(dummySchiggy);

    let state = createInitialGameState(p1Deck, p2Deck, {
      p1Name: 'Levi',
      p2Name: 'Papa',
      p1Avatar: 'levi',
      p2Avatar: 'papa',
      ruleLevel: 3
    });

    // Damage Levi's active by 30 HP
    state.players[0].active!.currentHp = 30;

    // Put Trank in hand
    state.players[0].hand.push(dummyTrank);
    const trankIdx = state.players[0].hand.length - 1;

    // Play Trank
    state = reduceGameState(state, {
      type: 'PLAY_TRAINER',
      handIndex: trankIdx,
      target: 'active'
    });

    // Heals 20 HP (30 -> 50)
    expect(state.players[0].active!.currentHp).toBe(50);
  });

  it('correctly handles Knockout, AI Promotion, and Turn Transition without softlocking', () => {
    const p1Deck = makeDeck(dummyGlumanda);
    const p2Deck = makeDeck(dummySchiggy);

    let state = createInitialGameState(p1Deck, p2Deck, {
      p1Name: 'Levi',
      p2Name: 'Rocko',
      p1Avatar: 'levi',
      p2Avatar: 'rocko',
      ruleLevel: 1
    });

    // Ensure opponent (Player 2) has a benched Pokemon
    state.players[1].bench = [
      {
        instanceId: 'bench_1',
        card: dummyGlumanda,
        currentHp: dummyGlumanda.hp,
        maxHp: dummyGlumanda.hp,
        attachedEnergy: [],
        status: 'none',
        canAttack: true
      }
    ];

    // Levi's turn (turnNumber >= 2 allows attacking)
    state.turnNumber = 2;
    state.activePlayerIndex = 0;
    state.players[0].active!.attachedEnergy = ['Feuer'];
    // Opponent active has only 10 HP left
    state.players[1].active!.currentHp = 10;

    // Levi attacks with Glut (30 damage), knocking out opponent
    state = reduceGameState(state, { type: 'ATTACK', attackIndex: 1 });

    // Verify KO state
    expect(state.players[0].points).toBe(1);
    expect(state.players[1].active).toBeNull();
    expect(state.turnPhase).toBe('promote_needed');

    // AI must be able to generate a PROMOTE action even while activePlayerIndex === 0
    const aiAction = getAiAction(state);
    expect(aiAction).not.toBeNull();
    expect(aiAction!.type).toBe('PROMOTE');

    // Execute the AI promote
    state = reduceGameState(state, aiAction!);

    // Opponent active should now be Glumanda, bench empty, turn transitioned to Opponent
    expect(state.players[1].active).not.toBeNull();
    expect(state.players[1].active!.card.name).toBe('Glumanda');
    expect(state.players[1].bench.length).toBe(0);
    expect(state.turnPhase).toBe('main');
    expect(state.activePlayerIndex).toBe(1); // Turn passed to Opponent
  });

  it('guarantees required energy type for Pikachu even if deck is predominantly Fire', () => {
    const dummyPikachu: Card = {
      id: 'A1-094',
      dexId: 25,
      name: 'Pikachu',
      types: ['Elektro'],
      hp: 60,
      stage: 'Basis',
      isEx: false,
      attacks: [{ name: 'Donnerschock', cost: ['Elektro'], damage: 20 }],
      retreat: 1,
      weakness: { type: 'Kampf', value: '+20' },
      artworkUrl: '/images/pokemon/25.webp',
      cryUrl: '/audio/cries/25.ogg',
      cardImageUrl: '/images/cards/A1-094.webp'
    };

    // Deck has 1 Pikachu and 19 Glumanda (Feuer)
    const mixedDeck: Card[] = [dummyPikachu, ...makeDeck(dummyGlumanda).slice(0, 19)];
    const p2Deck = makeDeck(dummySchiggy);

    const state = createInitialGameState(mixedDeck, p2Deck, {
      p1Name: 'Levi',
      p2Name: 'Papa',
      p1Avatar: 'levi',
      p2Avatar: 'papa'
    });

    // Make sure Pikachu is active
    state.players[0].active = {
      instanceId: 'pika_1',
      card: dummyPikachu,
      currentHp: 60,
      maxHp: 60,
      attachedEnergy: [],
      status: 'none',
      canAttack: true
    };

    // Advance turn to next round
    const nextTurn = reduceGameState(state, { type: 'END_TURN' });
    const backToLevi = reduceGameState(nextTurn, { type: 'END_TURN' });

    // Levi's energyZone MUST be Elektro so Pikachu can attack!
    expect(backToLevi.players[0].energyZone[0]).toBe('Elektro');
  });

  it('correctly equips Tool cards: Muskelband adds +10 attack damage, Amulett adds +20 KP', () => {
    const dummyMuskelband: Card = {
      id: 'TOOL-001',
      dexId: 0,
      name: 'Muskelband',
      types: [],
      hp: 0,
      stage: 'Trainer',
      isEx: false,
      attacks: [],
      retreat: 0,
      trainerType: 'Item',
      artworkUrl: '/images/cards/TOOL-001.webp',
      cryUrl: '',
      cardImageUrl: '/images/cards/TOOL-001.webp'
    };

    const dummyAmulett: Card = {
      id: 'TOOL-002',
      dexId: 0,
      name: 'Wundersames Amulett',
      types: [],
      hp: 0,
      stage: 'Trainer',
      isEx: false,
      attacks: [],
      retreat: 0,
      trainerType: 'Item',
      artworkUrl: '/images/cards/TOOL-002.webp',
      cryUrl: '',
      cardImageUrl: '/images/cards/TOOL-002.webp'
    };

    const p1Deck = makeDeck(dummyGlumanda);
    const p2Deck = makeDeck(dummySchiggy);

    const state = createInitialGameState(p1Deck, p2Deck, {
      p1Name: 'Levi',
      p2Name: 'Papa',
      p1Avatar: 'levi',
      p2Avatar: 'papa',
      ruleLevel: 3
    });

    state.players[0].active = {
      instanceId: 'active_glumanda',
      card: dummyGlumanda,
      currentHp: 60,
      maxHp: 60,
      attachedEnergy: ['Feuer'],
      status: 'none',
      canAttack: true
    };
    state.players[1].active = {
      instanceId: 'active_schiggy',
      card: dummySchiggy,
      currentHp: 60,
      maxHp: 60,
      attachedEnergy: [],
      status: 'none',
      canAttack: true
    };

    // Put Muskelband in hand
    state.players[0].hand = [dummyMuskelband];
    state.turnNumber = 2; // Allow attack

    // Play Muskelband on active
    const stateWithTool = reduceGameState(state, {
      type: 'PLAY_TRAINER',
      handIndex: 0,
      target: 'active'
    });

    expect(stateWithTool.players[0].active?.tool?.name).toBe('Muskelband');

    // Attack with Glut (base 30 + 10 Muskelband = 40 damage)
    const afterAttack = reduceGameState(stateWithTool, {
      type: 'ATTACK',
      attackIndex: 1
    });

    expect(afterAttack.players[1].active?.currentHp).toBe(20); // 60 - 40 = 20

    // Test Wundersames Amulett
    state.players[0].hand = [dummyAmulett];
    const stateWithAmulett = reduceGameState(state, {
      type: 'PLAY_TRAINER',
      handIndex: 0,
      target: 'active'
    });

    expect(stateWithAmulett.players[0].active?.maxHp).toBe(80);
    expect(stateWithAmulett.players[0].active?.currentHp).toBe(80);
    expect(stateWithAmulett.players[0].active?.tool?.name).toBe('Wundersames Amulett');
  });
});
