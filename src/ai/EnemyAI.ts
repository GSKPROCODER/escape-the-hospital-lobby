/**
 * Enemy finite-state brain — pure logic, no THREE/Rapier. Operates in the XZ
 * plane on plain {x,z} points so it is trivially testable. The Enemy actor
 * feeds it perception each tick and applies the returned movement target.
 */
export type EnemyState = 'patrol' | 'investigate' | 'chase' | 'search';

export interface Vec2 { x: number; z: number; }

export interface BrainConfig {
  patrolSpeed: number;
  chaseSpeed: number;
  giveUpTime: number;
  waypoints: Vec2[];
}

export interface Perception {
  canSee: boolean;
  player: Vec2;
  heard: Vec2 | null;
}

export interface BrainOutput {
  target: Vec2;
  speed: number;
  intensity: number; // 0 calm .. 1 full chase (drives animation/audio)
  state: EnemyState;
  seesPlayer: boolean;
}

const dist2 = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.z - b.z);

export class EnemyBrain {
  state: EnemyState = 'patrol';
  private wpIndex = 0;
  private lastKnown: Vec2 = { x: 0, z: 0 };
  private sinceSeen = 0;
  private searchTimer = 0;

  constructor(private cfg: BrainConfig) {}

  setConfig(cfg: BrainConfig) { this.cfg = cfg; }
  reset(spawn: Vec2) {
    this.state = 'patrol';
    this.wpIndex = 0;
    this.lastKnown = { ...spawn };
    this.sinceSeen = 0;
    this.searchTimer = 0;
  }

  update(dt: number, p: Perception, selfPos: Vec2): BrainOutput {
    const { chaseSpeed, patrolSpeed, giveUpTime, waypoints } = this.cfg;

    // Global: seeing the player always escalates to chase.
    if (p.canSee) {
      this.state = 'chase';
      this.lastKnown = { ...p.player };
      this.sinceSeen = 0;
    }

    let target: Vec2 = selfPos;
    let speed = patrolSpeed;
    let intensity = 0;

    switch (this.state) {
      case 'patrol': {
        if (p.heard) { this.state = 'investigate'; this.lastKnown = { ...p.heard }; break; }
        if (waypoints.length) {
          const wp = waypoints[this.wpIndex % waypoints.length];
          target = wp; speed = patrolSpeed; intensity = 0;
          if (dist2(selfPos, wp) < 0.8) this.wpIndex++;
        }
        break;
      }
      case 'investigate': {
        target = this.lastKnown; speed = chaseSpeed * 0.7; intensity = 0.5;
        if (p.heard) this.lastKnown = { ...p.heard };
        if (dist2(selfPos, this.lastKnown) < 1.0) { this.state = 'search'; this.searchTimer = 3; }
        break;
      }
      case 'chase': {
        target = { ...p.player }; speed = chaseSpeed; intensity = 1;
        if (!p.canSee) {
          this.sinceSeen += dt;
          target = this.lastKnown;
          if (this.sinceSeen > giveUpTime) { this.state = 'search'; this.searchTimer = 4; }
        }
        break;
      }
      case 'search': {
        target = this.lastKnown; speed = chaseSpeed * 0.6; intensity = 0.6;
        this.searchTimer -= dt;
        if (this.searchTimer <= 0) { this.state = 'patrol'; }
        break;
      }
    }

    return { target, speed, intensity, state: this.state, seesPlayer: p.canSee };
  }
}
