import { Card, PokemonType } from '../types/game';

export interface UserDeck {
  id: string;
  name: string;
  type: PokemonType;
  aceName: string;
  coverCardId: string;
  cards: string[]; // 20 card IDs
}

export interface HallOfFameEntry {
  id: string;
  date: string;
  deckName: string;
  acePokemon: string;
  cardIds: string[];
}

export type QuestType =
  | 'starter_attack'
  | 'evolve'
  | 'play_vs_papa'
  | 'win_match'
  | 'open_booster'
  | 'attach_energy';

export interface ResearchQuest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  isClaimed: boolean;
}

export interface UserProfile {
  name: string;
  avatar: string;
  ruleLevel: 1 | 2 | 3; // 1 = Mini-Kampf, 2 = Profi (Evo/Weakness), 3 = Meister (Trainers/Status)
  aiDifficulty: 'leicht' | 'normal' | 'schlau';
  favoriteStarter?: 'pikachu' | 'bisasam' | 'glumanda' | 'schiggy';
  lossStreak?: number;
  unlockedCards: Record<string, number>; // cardId -> count
  unopenedBoosters: number;
  badges: string[]; // ['rocko', 'misty', 'majorbob', 'erika', 'koga', 'sabrina', 'pyro', 'giovanni', 'lorelei', 'bruno', 'agathe', 'siegfried', 'gary']
  allChaptersUnlocked?: boolean;
  isChampion?: boolean;
  hallOfFame?: HallOfFameEntry[];
  quests?: ResearchQuest[];
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
    favoriteStarter: 'pikachu',
    lossStreak: 0,
    unlockedCards: unlocked,
    unopenedBoosters: 2, // 2 initial reward packs to open!
    badges: [],
    allChaptersUnlocked: false,
    quests: [
      {
        id: 'q_starter',
        type: 'starter_attack',
        title: 'Starter-Power!',
        description: 'Greife 2x mit deinem Pokémon im Duell an!',
        icon: '⚡',
        target: 2,
        progress: 0,
        isClaimed: false
      },
      {
        id: 'q_evolve',
        type: 'evolve',
        title: 'Entwicklungs-Forscher',
        description: 'Führe 1 Pokémon-Entwicklung im Duell durch!',
        icon: '🧬',
        target: 1,
        progress: 0,
        isClaimed: false
      },
      {
        id: 'q_vs_papa',
        type: 'play_vs_papa',
        title: 'Familien-Duell',
        description: 'Spiele 1 spannendes Match mit Papa am iPad!',
        icon: '🤝',
        target: 1,
        progress: 0,
        isClaimed: false
      }
    ],
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
        const loaded = JSON.parse(data);
        const defaults = getDefaultProfile(allCards);
        this.profile = {
          ...defaults,
          ...loaded,
          quests: loaded.quests && loaded.quests.length > 0 ? loaded.quests : defaults.quests
        };
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

  public recordMatchResult(won: boolean, kos: number = 0) {
    if (!this.profile) return;
    this.profile.stats.matchesPlayed += 1;
    if (won) {
      this.profile.stats.matchesWon += 1;
      this.profile.lossStreak = 0;
    } else {
      this.profile.lossStreak = (this.profile.lossStreak || 0) + 1;
    }
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

  public recordChampionVictory(deckName: string, acePokemon: string, cardIds: string[]) {
    if (!this.profile) return;
    this.awardBadge('gary');
    this.profile.isChampion = true;

    // Record in Hall of Fame
    if (!this.profile.hallOfFame) {
      this.profile.hallOfFame = [];
    }
    this.profile.hallOfFame.unshift({
      id: `hof_${Date.now()}`,
      date: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      deckName: deckName || 'Levis Sieger-Deck',
      acePokemon: acePokemon || 'Pikachu',
      cardIds: [...cardIds]
    });

    // Reward Secret Pichu Promo card!
    this.profile.unlockedCards['A4-171'] = (this.profile.unlockedCards['A4-171'] || 0) + 1;

    // Reward 2 Golden Master Booster Packs!
    this.profile.unopenedBoosters += 2;

    this.saveProfile(this.profile);
  }

  /**
   * Generates a 5-card booster pack with authentic TCG Pocket theme affinities
   * glurak: 75% affinity to Feuer, Pflanze, Kampf (Glurak, Bisaflor, Arkani, etc.)
   * pikachu: 75% affinity to Elektro, Wasser, Farblos (Pikachu, Zapdos, Arktos, Turtok, etc.)
   * mewtu: 75% affinity to Psycho, Finsternis, Kampf (Mewtu, Gengar, Simsala, Smogmog, etc.)
   * mew: High-rarity mythical mix across all types
   */
  public generateBoosterCards(
    allCards: Card[],
    packTheme: 'glurak' | 'pikachu' | 'mewtu' | 'mew' = 'glurak'
  ): Card[] {
    const themeTypes: Record<string, PokemonType[]> = {
      glurak: ['Feuer', 'Pflanze', 'Kampf'],
      pikachu: ['Elektro', 'Wasser', 'Farblos'],
      mewtu: ['Psycho', 'Finsternis', 'Kampf'],
      mew: ['Wasser', 'Psycho', 'Pflanze', 'Feuer', 'Elektro', 'Farblos', 'Drache']
    };

    const targetTypes = themeTypes[packTheme] || themeTypes.glurak;
    const isThemed = (c: Card) => c.types.some((t) => targetTypes.includes(t));

    const allCommons = allCards.filter((c) => !c.isEx && c.stage === 'Basis');
    const allUncommons = allCards.filter((c) => !c.isEx && c.stage !== 'Basis');
    const allRares = allCards.filter((c) => c.isEx || c.stage === 'Rang 2' || c.hp >= 100);

    const themedCommons = allCommons.filter(isThemed);
    const themedUncommons = allUncommons.filter(isThemed);
    const themedRares = allRares.filter(isThemed);

    const pullThemed = (themed: Card[], fallback: Card[]) => {
      if (themed.length > 0 && Math.random() < 0.75) {
        return themed[Math.floor(Math.random() * themed.length)];
      }
      return fallback[Math.floor(Math.random() * fallback.length)] || allCards[0];
    };

    const cards: Card[] = [
      pullThemed(themedCommons, allCommons),
      pullThemed(themedCommons, allCommons),
      pullThemed(themedCommons, allCommons),
      pullThemed(themedUncommons, allUncommons.length > 0 ? allUncommons : allCommons),
      Math.random() < 0.35 && allRares.length > 0
        ? pullThemed(themedRares, allRares)
        : pullThemed(themedUncommons, allUncommons)
    ];

    // Add to owned collection
    if (this.profile) {
      cards.forEach((c) => {
        this.profile!.unlockedCards[c.id] = (this.profile!.unlockedCards[c.id] || 0) + 1;
      });
      this.profile.unopenedBoosters = Math.max(0, this.profile.unopenedBoosters - 1);
      this.profile.stats.boostersOpened += 1;
      this.trackQuestProgress('open_booster', 1);
      this.saveProfile(this.profile);
    }

    return cards;
  }

  public trackQuestProgress(type: QuestType, amount: number = 1) {
    if (!this.profile) return;
    if (!this.profile.quests || this.profile.quests.length === 0) {
      this.profile.quests = getDefaultProfile([]).quests;
    }
    const quests = this.profile.quests;
    if (!quests) return;

    let changed = false;
    quests.forEach((q) => {
      if (q.type === type && !q.isClaimed && q.progress < q.target) {
        q.progress = Math.min(q.target, q.progress + amount);
        changed = true;
      }
    });

    if (changed) {
      this.saveProfile(this.profile);
    }
  }

  public claimQuestReward(questId: string): boolean {
    if (!this.profile || !this.profile.quests) return false;
    const quest = this.profile.quests.find((q) => q.id === questId);
    if (!quest || quest.isClaimed || quest.progress < quest.target) return false;

    quest.isClaimed = true;
    this.profile.unopenedBoosters += 1;

    // If all current quests are claimed, refresh with a fresh rotation!
    const allClaimed = this.profile.quests.every((q) => q.isClaimed);
    if (allClaimed) {
      this.profile.quests = this.generateNextQuestBatch();
    }

    this.saveProfile(this.profile);
    return true;
  }

  public getClaimableQuestCount(): number {
    if (!this.profile || !this.profile.quests) return 0;
    return this.profile.quests.filter((q) => !q.isClaimed && q.progress >= q.target).length;
  }

  private generateNextQuestBatch(): ResearchQuest[] {
    const questPool: Omit<ResearchQuest, 'progress' | 'isClaimed'>[] = [
      {
        id: `q_starter_${Date.now()}`,
        type: 'starter_attack',
        title: 'Starter-Power!',
        description: 'Greife 3x mit deinem Pokémon im Duell an!',
        icon: '⚡',
        target: 3
      },
      {
        id: `q_evolve_${Date.now()}`,
        type: 'evolve',
        title: 'Entwicklungs-Forscher',
        description: 'Führe 2 Pokémon-Entwicklungen im Duell durch!',
        icon: '🧬',
        target: 2
      },
      {
        id: `q_win_${Date.now()}`,
        type: 'win_match',
        title: 'Arena-Champion',
        description: 'Gewinne 1 Duell in der Arena oder Liga!',
        icon: '🏟️',
        target: 1
      },
      {
        id: `q_pack_${Date.now()}`,
        type: 'open_booster',
        title: 'Karten-Entdecker',
        description: 'Öffne 1 beliebiges Booster-Pack!',
        icon: '🎴',
        target: 1
      },
      {
        id: `q_energy_${Date.now()}`,
        type: 'attach_energy',
        title: 'Energie-Experte',
        description: 'Lege 4 Energien im Duell an deine Pokémon an!',
        icon: '🔋',
        target: 4
      },
      {
        id: `q_papa_${Date.now()}`,
        type: 'play_vs_papa',
        title: 'Familien-Duell',
        description: 'Spiele 1 Duell mit Papa am iPad!',
        icon: '🤝',
        target: 1
      }
    ];

    // Pick 3 random quests
    const shuffled = [...questPool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map((q) => ({
      ...q,
      progress: 0,
      isClaimed: false
    }));
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

  public getBattleAnimSpeed(): 'cinematic' | 'fast' {
    return this.profile?.settings?.fastAnimations ? 'fast' : 'cinematic';
  }

  public setBattleAnimSpeed(speed: 'cinematic' | 'fast') {
    if (!this.profile) return;
    this.profile.settings.fastAnimations = speed === 'fast';
    this.saveProfile(this.profile);
  }

  public updateSettings(partial: Partial<UserProfile['settings']>) {
    if (!this.profile) return;
    this.profile.settings = { ...this.profile.settings, ...partial };
    this.saveProfile(this.profile);
  }

  public unlockAllChapters() {
    if (!this.profile) return;
    this.profile.allChaptersUnlocked = true;
    const ALL_BADGES = ['rocko', 'misty', 'majorbob', 'erika', 'koga', 'sabrina', 'pyro', 'giovanni', 'gary'];
    ALL_BADGES.forEach((b) => {
      if (!this.profile!.badges.includes(b)) {
        this.profile!.badges.push(b);
      }
    });
    this.saveProfile(this.profile);
  }

  public getFavoriteStarter(): 'pikachu' | 'bisasam' | 'glumanda' | 'schiggy' {
    return this.profile?.favoriteStarter || 'pikachu';
  }

  public setFavoriteStarter(starter: 'pikachu' | 'bisasam' | 'glumanda' | 'schiggy') {
    if (!this.profile) return;
    this.profile.favoriteStarter = starter;
    this.saveProfile(this.profile);
  }

  public getLossStreak(): number {
    return this.profile?.lossStreak || 0;
  }

  public getAiDifficulty(): 'leicht' | 'normal' | 'schlau' {
    return this.profile?.aiDifficulty || 'leicht';
  }

  public setAiDifficulty(d: 'leicht' | 'normal' | 'schlau') {
    if (!this.profile) return;
    this.profile.aiDifficulty = d;
    this.saveProfile(this.profile);
  }

  public getRuleLevel(): 1 | 2 | 3 {
    return this.profile?.ruleLevel || 1;
  }

  public setRuleLevel(lvl: 1 | 2 | 3) {
    if (!this.profile) return;
    this.profile.ruleLevel = lvl;
    this.saveProfile(this.profile);
  }

  public resetSavegame(allCards: Card[]) {
    localStorage.removeItem(STORAGE_KEY);
    this.profile = getDefaultProfile(allCards);
    this.saveProfile(this.profile);
  }
}

export const storageService = new StorageService();
