export type Quality = 'low' | 'medium' | 'high';
export type CameraMode = 'third' | 'first';

export interface GameSettings {
  masterVolume: number; // 0..1
  musicVolume: number;  // 0..1
  sfxVolume: number;    // 0..1
  lookSensitivity: number; // 0.4..2.0 (multiplier)
  invertY: boolean;
  quality: Quality;
  cameraMode: CameraMode;
  reducedMotion: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  lookSensitivity: 1.0,
  invertY: false,
  quality: 'high',
  cameraMode: 'third',
  reducedMotion: false,
};

/** Clamp/repair a loaded settings object against the defaults + valid ranges. */
export function sanitizeSettings(raw: Partial<GameSettings> | null | undefined): GameSettings {
  const s = { ...DEFAULT_SETTINGS, ...(raw ?? {}) };
  const clamp01 = (n: number) => Math.min(1, Math.max(0, Number.isFinite(n) ? n : 0));
  s.masterVolume = clamp01(s.masterVolume);
  s.musicVolume = clamp01(s.musicVolume);
  s.sfxVolume = clamp01(s.sfxVolume);
  s.lookSensitivity = Math.min(2.0, Math.max(0.4, Number.isFinite(s.lookSensitivity) ? s.lookSensitivity : 1));
  s.invertY = !!s.invertY;
  s.reducedMotion = !!s.reducedMotion;
  if (s.quality !== 'low' && s.quality !== 'medium' && s.quality !== 'high') s.quality = 'high';
  if (s.cameraMode !== 'third' && s.cameraMode !== 'first') s.cameraMode = 'third';
  return s;
}
