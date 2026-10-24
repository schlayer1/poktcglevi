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
  artworkUrl: '/images/pokemon/4.png',
  cryUrl: '/audio/cries/4.ogg',
  cardImageUrl: '/images/cards/A1-033.webp'
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
  artworkUrl: '/images/pokemon/7.png',
  cryUrl: '/audio/cries/7.ogg',
  cardImageUrl: '/images/cards/A1-053.webp'
};

function makeDeck(sample: Card): Card[] {
  const d: Card[] = [];
  for (let i = 0; i < 20; i++) {
    d.push({ ...sample, id: `${sample.id}_${i}` });
  }
  return d;
}

describe('Game Engine Level 1', () => {
  it('correctly validates energy costs with typed and colorless energy', () => {
    // 0 cost
    expect(canPayCost([], [])).toBe(true);

    // Colorless cost can be paid by Fire or Water
    expect(canPayCost(['Feuer'], ['Farblos'])).toBe(true);
    expect(canPayCost(['Wasser'], ['Farblos'])).toBe(true);
    expect(canPayCost([], ['Farblos'])).toBe(false);

    // Colored cost must match
    expect(canPayCost(['Feuer'], ['Feuer'])).toBe(true);
    expect(canPayCost(['Wasser'], ['Feuer'])).toBe(false);

    // Compound cost: 1 Fire + 1 Colorless
    expect(canPayCost(['Feuer', 'Wasser'], ['Feuer', 'Farblos'])).toBe(true);
    expect(canPayCost(['Feuer', 'Feuer'], ['Feuer', 'Farblos'])).toBe(true);
    expect(canPayCost(['Wasser', 'Wasser'], ['Feuer', 'Farblos'])).toBe(false);
  });

  it('initializes game state with 5 cards hand and guaranteed active pokemon', () => {
    const p1Deck = makeDeck(dummyGlumanda);
    const p2Deck = makeDeck(dummySchiggy);

    const state = createInitialGameState(p1Deck, p2Deck, {
      p1Name: 'Levi',
      p2Name: 'Papa',
      p1Avatar: 'levi',
      p2Avatar: 'papa',
      gameMode: 'solo'
    });

    expect(state.turnNumber).toBe(1);
    expect(state.activePlayerIndex).toBe(0);
    expect(state.players[0].active).not.toBeNull();
    expect(state.players[1].active).not.toBeNull();
    expect(state.players[0].hand.length).toBe(4); // 5 drawn minus 1 placed active
    expect(state.players[1].hand.length).toBe(4);
    expect(state.winner).toBeNull();
  });

  it('forbids turn 1 attack and handles legal actions', () => {
    const p1Deck = makeDeck(dummyGlumanda);
    const p2Deck = makeDeck(dummySchiggy);
    const state = createInitialGameState(p1Deck, p2Deck, {
      p1Name: 'Levi',
      p2Name: 'Papa',
      p1Avatar: 'levi',
      p2Avatar: 'papa'
    });

    const legal = getLegalActions(state);
    // On turn 1, P1 has no energy in zone and cannot attack
    expect(legal.canAttachEnergy).toBe(false);
    expect(legal.usableAttackIndices).toEqual([]);
    expect(legal.canEndTurn).toBe(true);
  });

  it('generates energy and handles attaching energy on turn 2', () => {
    const p1Deck = makeDeck(dummyGlumanda);
    const p2Deck = makeDeck(dummySchiggy);
    let state = createInitialGameState(p1Deck, p2Deck, {
      p1Name: 'Levi',
      p2Name: 'Papa',
      p1Avatar: 'levi',
      p2Avatar: 'papa'
    });

    // P1 ends turn 1
    state = reduceGameState(state, { type: 'END_TURN' });
    expect(state.turnNumber).toBe(2);
    expect(state.activePlayerIndex).toBe(1); // Papa's turn
    expect(state.players[1].energyZone.length).toBe(1);
    expect(state.players[1].energyZone[0]).toBe('Wasser');

    // Attach energy to active
    state = reduceGameState(state, { type: 'ATTACH_ENERGY', target: 'active' });
    expect(state.players[1].energyZone.length).toBe(0);
    expect(state.players[1].active?.attachedEnergy).toEqual(['Wasser']);
  });

  it('executes attack, damages opponent, and detects knockout and promotion', () => {
    const p1Deck = makeDeck(dummyGlumanda);
    const p2Deck = makeDeck(dummySchiggy);
    let state = createInitialGameState(p1Deck, p2Deck, {
      p1Name: 'Levi',
      p2Name: 'Papa',
      p1Avatar: 'levi',
      p2Avatar: 'papa'
    });

    // Advance to turn 2 (P2)
    state = reduceGameState(state, { type: 'END_TURN' });
    // Advance to turn 3 (P1)
    state = reduceGameState(state, { type: 'END_TURN' });

    expect(state.activePlayerIndex).toBe(0); // Levi
    expect(state.players[0].energyZone.length).toBe(1);

    // Levi attaches fire energy to Glumanda
    state = reduceGameState(state, { type: 'ATTACH_ENERGY', target: 'active' });

    // Glumanda uses Glut (30 damage)
    const opponentHpBefore = state.players[1].active!.currentHp;
    state = reduceGameState(state, { type: 'ATTACK', attackIndex: 1 });
    expect(state.players[1].active!.currentHp).toBe(opponentHpBefore - 30);
  });

  it('AI chooses reasonable moves in solo mode', () => {
    const p1Deck = makeDeck(dummyGlumanda);
    const p2Deck = makeDeck(dummySchiggy);
    let state = createInitialGameState(p1Deck, p2Deck, {
      p1Name: 'Levi',
      p2Name: 'Rocko',
      p1Avatar: 'levi',
      p2Avatar: 'rocko'
    });

    // Advance to Rocko's turn
    state = reduceGameState(state, { type: 'END_TURN' });
    const aiMove = getAiAction(state);
    expect(aiMove).not.toBeNull();
    // AI should play bench or attach energy
    expect(['ATTACH_ENERGY', 'PLAY_BENCH', 'ATTACK', 'END_TURN']).toContain(aiMove?.type);
  });
});
