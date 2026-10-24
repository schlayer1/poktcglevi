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

export type StatusCondition = 'none' | 'asleep' | 'poisoned' | 'paralyzed';

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
  stage: 'Basis' | 'Rang 1' | 'Rang 2' | 'Trainer';
  isEx: boolean;
  attacks: Attack[];
  weakness?: Weakness | null;
  retreat: number;
  rarity?: string;
  artworkUrl: string;
  cryUrl: string;
  cardImageUrl: string;
  cdnCardUrl?: string;
  preDexId?: number | null;
  evolvesFrom?: string | null;
  trainerEffect?: string;
  trainerType?: string;
}

export interface InPlayPokemon {
  instanceId: string;
  card: Card;
  currentHp: number;
  maxHp: number;
  attachedEnergy: PokemonType[];
  status: StatusCondition;
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
  points: number; // 3 points win
}

export type TurnPhase = 'main' | 'promote_needed' | 'game_over';

export interface GameState {
  gameMode: 'solo' | 'pvp';
  stage: 1 | 2 | 3; // Rule Level
  turnNumber: number;
  activePlayerIndex: 0 | 1;
  players: [PlayerState, PlayerState];
  winner: number | null;
  log: string[];
  turnPhase: TurnPhase;
  energyAttachedThisTurn: boolean;
  attackedThisTurn: boolean;
  retreatedThisTurn?: boolean;
  supporterPlayedThisTurn?: boolean;
  lastDamageEvent?: {
    targetInstanceId: string;
    damage: number;
    isKo: boolean;
    isSuperEffective?: boolean;
  };
}

export type Action =
  | { type: 'ATTACH_ENERGY'; target: 'active' | number }
  | { type: 'PLAY_BENCH'; handIndex: number }
  | { type: 'EVOLVE'; handIndex: number; target: 'active' | number }
  | { type: 'RETREAT'; benchIndex: number }
  | { type: 'PLAY_TRAINER'; handIndex: number; target?: 'active' | number }
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
  evolvableHandIndices?: { handIndex: number; targets: ('active' | number)[] }[];
  canRetreat?: boolean;
  retreatableBenchIndices?: number[];
  playableTrainerIndices?: number[];
  usableAttackIndices?: number[];
  promotableBenchIndices?: number[];
  canEndTurn?: boolean;
}
