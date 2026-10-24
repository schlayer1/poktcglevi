import { Card, PokemonType } from '../types/game';

export interface UserDeck {
  id: string;
  name: string;
  type: PokemonType;
  aceName: string;
  coverCardId: string;
  cards: string[]; // 20 card IDs
}

export interface UserProfile {
  name: string;
  avatar: string;
  ruleLevel: 1 | 2 | 3; // 1 = Mini-Kampf, 2 = Profi (Evo/Weakness), 3 = Meister (Trainers/Status)
  aiDifficulty: 'leicht' | 'normal' | 'schlau';
  unlockedCards: Record<string, number>; // cardId -> count
  unopenedBoosters: number;
  badges: string[]; // ['rocko', 'misty', 'majorbob', 'erika', 'koga', 'sabrina', 'pyro', 'giovanni', 'gary']
  customDecks: UserDeck[];
  activeDeckId: string;
  stats: {
    matchesPlayed: number;
    matchesWon: number;
    kosDealt: number;
    boostersOpened: number;
  };
  settings: {
    sfxVolume: number;
    bgmVolume: number;
    bgmMuted: boolean;
    playTimeReminderMinutes: number;
    fastAnimations: boolean;
  };
}

const STORAGE_KEY = 'poktcglevi_savegame_v1';

export function getDefaultProfile(allCards: Card[]): UserProfile {
  // Give Levi initial copies of starter deck cards
  const unlocked: Record<string, number> = {};

  // Find popular basic Kanto cards to start with
  allCards.forEach((c) => {
    if (['A1-001', 'A1-033', 'A1-053', 'A1-094', 'A1-004', 'A1-036', 'A1-056', 'A1-097'].includes(c.id)) {
      unlocked[c.id] = 2;
    }
  });

  return {
    name: 'Levi',
    avatar: 'levi',
    ruleLevel: 1,
    aiDifficulty: 'leicht',
    unlockedCards: unlocked,
    unopenedBoosters: 2, // 2 initial reward packs to open!
    badges: [],
    customDecks: [],
    activeDeckId: 'deck_feuer',
    stats: {
      matchesPlayed: 0,
      matchesWon: 0,
      kosDealt: 0,
      boostersOpened: 0
    },
    settings: {
      sfxVolume: 0.9,
      bgmVolume: 0.35,
      bgmMuted: false,
      playTimeReminderMinutes: 30,
      fastAnimations: false
    }
  };
}

class StorageService {
  private profile: UserProfile | null = null;

  public loadProfile(allCards: Card[]): UserProfile {
    if (this.profile) return this.profile;

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.profile = { ...getDefaultProfile(allCards), ...JSON.parse(data) };
        return this.profile!;
      }
    } catch (e) {
      console.error('Failed to load savegame:', e);
    }

    this.profile = getDefaultProfile(allCards);
    this.saveProfile(this.profile);
    return this.profile;
  }

  public saveProfile(p: UserProfile) {
    this.profile = p;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch (e) {
      console.error('Failed to save savegame:', e);
    }
  }

  public addBooster(count: number = 1) {
    if (!this.profile) return;
    this.profile.unopenedBoosters = Math.max(0, this.profile.unopenedBoosters + count);
    this.saveProfile(this.profile);
  }

  public recordMatchResult(won: boolean, kos: number) {
    if (!this.profile) return;
    this.profile.stats.matchesPlayed += 1;
    if (won) this.profile.stats.matchesWon += 1;
    this.profile.stats.kosDealt += kos;
    // Always reward 1 booster pack after every match!
    this.profile.unopenedBoosters += 1;
    this.saveProfile(this.profile);
  }

  public awardBadge(badgeId: string) {
    if (!this.profile) return;
    if (!this.profile.badges.includes(badgeId)) {
      this.profile.badges.push(badgeId);
      this.saveProfile(this.profile);
    }
  }

  /**
   * Generates a 5-card booster pack from the 255 card pool
   * Slot 1-3: Common (Diamond 1-2)
   * Slot 4: Uncommon or Rare (Diamond 3-4, Star)
   * Slot 5: Rare, EX or Holo (Diamond 4, Star, EX with 30% chance!)
   */
  public generateBoosterCards(allCards: Card[]): Card[] {
    const commons = allCards.filter((c) => !c.isEx && c.stage === 'Basis');
    const uncommons = allCards.filter((c) => !c.isEx && c.stage !== 'Basis');
    const rares = allCards.filter((c) => c.isEx || c.stage === 'Rang 2' || c.hp >= 100);

    const pullRandom = (arr: Card[]) => arr[Math.floor(Math.random() * arr.length)] || allCards[0];

    const cards: Card[] = [
      pullRandom(commons),
      pullRandom(commons),
      pullRandom(commons),
      pullRandom(uncommons.length > 0 ? uncommons : commons),
      Math.random() < 0.35 && rares.length > 0 ? pullRandom(rares) : pullRandom(uncommons)
    ];

    // Add to owned collection
    if (this.profile) {
      cards.forEach((c) => {
        this.profile!.unlockedCards[c.id] = (this.profile!.unlockedCards[c.id] || 0) + 1;
      });
      this.profile.unopenedBoosters = Math.max(0, this.profile.unopenedBoosters - 1);
      this.profile.stats.boostersOpened += 1;
      this.saveProfile(this.profile);
    }

    return cards;
  }

  public exportSavegame(): string {
    return JSON.stringify(this.profile || {}, null, 2);
  }

  public importSavegame(jsonStr: string, allCards: Card[]): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        const merged = { ...getDefaultProfile(allCards), ...parsed };
        this.profile = merged;
        this.saveProfile(merged);
        return true;
      }
    } catch {}
    return false;
  }

  public unlockAllCards(allCards: Card[]) {
    if (!this.profile) return;
    allCards.forEach((c) => {
      this.profile!.unlockedCards[c.id] = 4; // 4 copies of every card!
    });
    this.saveProfile(this.profile);
  }

  public resetSavegame(allCards: Card[]) {
    localStorage.removeItem(STORAGE_KEY);
    this.profile = getDefaultProfile(allCards);
    this.saveProfile(this.profile);
  }
}

export const storageService = new StorageService();
