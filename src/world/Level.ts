import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export interface Checkpoint {
  pos: THREE.Vector3;   // respawn position
  trigger: THREE.Vector3; // world position; .z is the crossing line (any x/y counts)
}

export interface LevelConfig {
  id: string;
  name: string;
  index: number;              // 1-based level number
  spawnPosition: THREE.Vector3;
  fallY: number;              // Y below which the player has fallen
  checkpoints: Checkpoint[];
  winZone: { pos: THREE.Vector3; radius: number };
  enemySpawn: THREE.Vector3;
  patrol: THREE.Vector3[];
  build: (scene: THREE.Scene, world: RAPIER.World) => void;
  destroy: (scene: THREE.Scene, world: RAPIER.World) => void;
  /** Per-frame hook: animate hazards/doors/lights and resolve pickups. */
  update?: (dt: number, elapsed: number, reducedMotion: boolean, playerPos: THREE.Vector3) => void;
  /** True while the player is touching a hazard (→ respawn). */
  hazardHit?: (playerPos: THREE.Vector3) => boolean;
  /** Gate for the win-zone (e.g. requires a keycard). Default: always open. */
  canExit?: () => boolean;
  /** Current HUD objective text. */
  objective?: () => string;
  /** Returns true once when a pickup (keycard) was just collected. */
  consumePickup?: () => boolean;
  /** Drains door open/close events since the last call (true = opening). */
  consumeDoorToggles?: () => boolean[];
}
