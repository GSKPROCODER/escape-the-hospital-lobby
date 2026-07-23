export type DifficultyId = 'easy' | 'normal' | 'nightmare';

export interface DifficultyConfig {
  id: DifficultyId;
  label: string;
  blurb: string;
  /** -1 = unlimited */
  lives: number;
  enemy: {
    sightRange: number;
    fovDeg: number;      // full cone angle
    patrolSpeed: number;
    chaseSpeed: number;
    giveUpTime: number;  // seconds of no sight before giving up the chase
    hearingRadius: number;
    catchRadius: number;
  };
}

export const DIFFICULTIES: Record<DifficultyId, DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: 'Easy',
    blurb: 'Unlimited lives. The Presence is slow and loses interest quickly.',
    lives: -1,
    enemy: { sightRange: 10, fovDeg: 90, patrolSpeed: 1.6, chaseSpeed: 2.6, giveUpTime: 3, hearingRadius: 4, catchRadius: 1.2 },
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    blurb: 'Five lives. A balanced hunt — stay out of sight.',
    lives: 5,
    enemy: { sightRange: 16, fovDeg: 100, patrolSpeed: 2.0, chaseSpeed: 3.4, giveUpTime: 6, hearingRadius: 7, catchRadius: 1.2 },
  },
  nightmare: {
    id: 'nightmare',
    label: 'Nightmare',
    blurb: 'Two lives. It sees far, moves fast, and never stops.',
    lives: 2,
    enemy: { sightRange: 24, fovDeg: 120, patrolSpeed: 2.6, chaseSpeed: 4.4, giveUpTime: 12, hearingRadius: 11, catchRadius: 1.3 },
  },
};

export function isValidDifficulty(v: unknown): v is DifficultyId {
  return v === 'easy' || v === 'normal' || v === 'nightmare';
}
