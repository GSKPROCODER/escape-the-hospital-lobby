import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { LevelConfig } from './Level';
import { getBuiltLevel } from './levels';

export class LevelManager {
  private currentLevel: LevelConfig | null = null;
  private respawn: THREE.Vector3 | null = null;
  private reachedIndex = -1; // index of the last checkpoint passed

  constructor(
    private scene: THREE.Scene,
    private world: RAPIER.World
  ) {}

  loadLevel(level: LevelConfig) {
    if (this.currentLevel) this.currentLevel.destroy(this.scene, this.world);
    this.currentLevel = level;
    this.respawn = level.spawnPosition.clone();
    this.reachedIndex = -1;
    level.build(this.scene, this.world);
  }

  /** Load a built level by its 1-based index. Returns false if not built. */
  loadByIndex(index1: number): boolean {
    const lvl = getBuiltLevel(index1);
    if (!lvl) return false;
    this.loadLevel(lvl);
    return true;
  }

  update(dt: number, elapsed: number, reducedMotion: boolean, playerPos: THREE.Vector3) {
    this.currentLevel?.update?.(dt, elapsed, reducedMotion, playerPos);
  }

  resetProgress() {
    this.respawn = this.currentLevel ? this.currentLevel.spawnPosition.clone() : null;
    this.reachedIndex = -1;
  }

  /**
   * Checkpoints are progress LINES (z <= trigger.z), not spots to stand on —
   * any x, any height, even mid-air counts. Triggers are in monotonically
   * decreasing z order, so once one hasn't been crossed, none further have
   * either; take the furthest line crossed this frame (handles skipping
   * ahead in one jump without missing earlier checkpoints).
   */
  updateCheckpoints(playerPos: THREE.Vector3): number {
    if (!this.currentLevel) return -1;
    const cps = this.currentLevel.checkpoints;
    let activated = -1;
    for (let i = this.reachedIndex + 1; i < cps.length; i++) {
      if (playerPos.z <= cps[i].trigger.z) activated = i;
      else break;
    }
    if (activated >= 0) {
      this.reachedIndex = activated;
      this.respawn = cps[activated].pos.clone();
    }
    return activated;
  }

  checkWin(playerPos: THREE.Vector3): boolean {
    if (!this.currentLevel) return false;
    if (this.currentLevel.canExit && !this.currentLevel.canExit()) return false;
    return playerPos.distanceTo(this.currentLevel.winZone.pos) <= this.currentLevel.winZone.radius;
  }

  hazardHit(playerPos: THREE.Vector3): boolean {
    return this.currentLevel?.hazardHit?.(playerPos) ?? false;
  }

  consumePickup(): boolean {
    return this.currentLevel?.consumePickup?.() ?? false;
  }

  consumeDoorToggles(): boolean[] {
    return this.currentLevel?.consumeDoorToggles?.() ?? [];
  }

  getObjective(): string {
    return this.currentLevel?.objective?.() ?? 'Reach the exit — don’t get caught';
  }

  getSpawnPosition(): THREE.Vector3 { return (this.respawn ?? new THREE.Vector3(0, 5, 0)).clone(); }
  getFallY(): number { return this.currentLevel?.fallY ?? -20; }
  getName(): string { return this.currentLevel?.name ?? '—'; }
  getId(): string { return this.currentLevel?.id ?? 'level'; }
  getIndex(): number { return this.currentLevel?.index ?? 1; }
  getEnemySpawn(): THREE.Vector3 { return (this.currentLevel?.enemySpawn ?? new THREE.Vector3(0, 2, -15)).clone(); }
  getPatrol(): THREE.Vector3[] { return this.currentLevel?.patrol ?? []; }
}
