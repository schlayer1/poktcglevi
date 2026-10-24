export type PokemonType =
  | 'Pflanze'
  | 'Feuer'
  | 'Wasser'
  | 'Elektro'
  | 'Psycho'
  | 'Kampf'
  | 'Finsternis'
  | 'Metall'
  | 'Drache'
  | 'Farblos';

export interface Attack {
  name: string;
  cost: PokemonType[];
  damage: number;
  effect?: string;
}

export interface Weakness {
  type: string;
  value: string;
}

export interface Card {
  id: string;
  dexId: number;
  name: string;
  types: PokemonType[];
  hp: number;
  stage: 'Basis' | 'Rang 1' | 'Rang 2';
  isEx: boolean;
  attacks: Attack[];
  weakness?: Weakness | null;
  retreat: number;
  rarity?: string;
  artworkUrl: string;
  cryUrl: string;
  cardImageUrl: string;
  cdnCardUrl?: string;
}

export interface InPlayPokemon {
  instanceId: string;
  card: Card;
  currentHp: number;
  maxHp: number;
  attachedEnergy: PokemonType[];
  canAttack: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  avatar: string;
  deck: Card[];
  hand: Card[];
  active: InPlayPokemon | null;
  bench: InPlayPokemon[];
  discard: Card[];
  energyZone: PokemonType[];
  points: number; // Knockout points (3 points win)
}

export type TurnPhase = 'main' | 'promote_needed' | 'game_over';

export interface GameState {
  gameMode: 'solo' | 'pvp';
  stage: 'level1' | 'level2' | 'level3';
  turnNumber: number;
  activePlayerIndex: 0 | 1; // 0 = Levi / P1, 1 = Opponent / P2
  players: [PlayerState, PlayerState];
  winner: number | null; // index of winner or null
  log: string[];
  turnPhase: TurnPhase;
  energyAttachedThisTurn: boolean;
  attackedThisTurn: boolean;
  lastDamageEvent?: {
    targetInstanceId: string;
    damage: number;
    isKo: boolean;
  };
}

export type Action =
  | { type: 'ATTACH_ENERGY'; target: 'active' | number } // number is benchIndex
  | { type: 'PLAY_BENCH'; handIndex: number }
  | { type: 'ATTACK'; attackIndex: number }
  | { type: 'PROMOTE'; benchIndex: number }
  | { type: 'END_TURN' };

export interface LegalAction {
  type: Action['type'];
  description: string;
  voiceKey?: string;
  canAttachEnergy?: boolean;
  validEnergyTargets?: ('active' | number)[];
  playableHandIndices?: number[];
  usableAttackIndices?: number[];
  promotableBenchIndices?: number[];
  canEndTurn?: boolean;
}
