import { GameSettings, sanitizeSettings, DEFAULT_SETTINGS } from './Settings';
import { DifficultyId, isValidDifficulty } from './Difficulty';

/**
 * Versioned localStorage wrapper. Holds settings now; progress (unlocked
 * levels, best times, checkpoints) will slot into the same store later.
 */
const STORAGE_KEY = 'etho.save.v1';

interface SaveData {
  version: number;
  settings: GameSettings;
  difficulty: DifficultyId;
  progress: {
    unlockedLevel: number;
    bestTimes: Record<string, number>;
  };
}

const DEFAULT_SAVE: SaveData = {
  version: 1,
  settings: { ...DEFAULT_SETTINGS },
  difficulty: 'normal',
  progress: { unlockedLevel: 1, bestTimes: {} },
};

export class Save {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredCloneSafe(DEFAULT_SAVE);
      const parsed = JSON.parse(raw) as Partial<SaveData>;
      return {
        version: 1,
        settings: sanitizeSettings(parsed.settings),
        difficulty: isValidDifficulty(parsed.difficulty) ? parsed.difficulty : 'normal',
        progress: {
          unlockedLevel: Math.max(1, Number(parsed.progress?.unlockedLevel) || 1),
          bestTimes: (parsed.progress?.bestTimes && typeof parsed.progress.bestTimes === 'object')
            ? parsed.progress.bestTimes as Record<string, number>
            : {},
        },
      };
    } catch {
      return structuredCloneSafe(DEFAULT_SAVE);
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      /* storage may be unavailable (private mode) — game still playable in-session */
    }
  }

  getSettings(): GameSettings {
    return { ...this.data.settings };
  }

  saveSettings(settings: GameSettings) {
    this.data.settings = sanitizeSettings(settings);
    this.persist();
  }

  getDifficulty(): DifficultyId {
    return this.data.difficulty;
  }

  setDifficulty(d: DifficultyId) {
    this.data.difficulty = d;
    this.persist();
  }

  getUnlockedLevel(): number {
    return this.data.progress.unlockedLevel;
  }

  unlockLevel(level: number) {
    if (level > this.data.progress.unlockedLevel) {
      this.data.progress.unlockedLevel = level;
      this.persist();
    }
  }

  getBestTime(levelId: string): number | undefined {
    return this.data.progress.bestTimes[levelId];
  }

  recordBestTime(levelId: string, seconds: number) {
    const prev = this.data.progress.bestTimes[levelId];
    if (prev === undefined || seconds < prev) {
      this.data.progress.bestTimes[levelId] = seconds;
      this.persist();
    }
  }
}

function structuredCloneSafe<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}
