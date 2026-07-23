import { LevelConfig } from '../Level';
import { level01 } from './level01';
import { level02 } from './level02';
import { level03 } from './level03';

/** Built, playable levels (in order). */
export const LEVELS: LevelConfig[] = [level01, level02, level03];

/** Total levels the game is planned around (built + designed-but-not-built). */
export const TOTAL_LEVELS = 15;

/** Display names for every planned level (built ones match their config). */
export const LEVEL_NAMES: string[] = [
  'Reception Wing', 'Records Room', 'Ward A', 'Pharmacy', 'Radiology',
  'The Morgue', 'Stairwell', 'Ventilation', 'Operating Theatre', 'Flooded Basement',
  'Boiler Room', 'Security Wing', 'Quiet Ward', 'Generator Room', 'Main Exit Gauntlet',
];

export function getBuiltLevel(index1: number): LevelConfig | null {
  return LEVELS.find(l => l.index === index1) ?? null;
}
export function isBuilt(index1: number): boolean {
  return getBuiltLevel(index1) !== null;
}
export function highestBuiltIndex(): number {
  return LEVELS.reduce((m, l) => Math.max(m, l.index), 1);
}
