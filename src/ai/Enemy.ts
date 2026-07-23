import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { EnemyModel } from '../engine/EnemyModel';
import { EnemyBrain, Vec2 } from './EnemyAI';
import { DifficultyConfig } from '../core/Difficulty';

export interface EnemyContext {
  playerPos: THREE.Vector3;
  noise: boolean; // player made noise this frame (sprint / hard landing)
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * The "Presence": kinematic hunter driven by EnemyBrain. Handles perception
 * (FOV + Rapier line-of-sight + hearing), steering with obstacle avoidance,
 * and catch detection. Purely reactive; the brain decides *where* to go.
 */
export class Enemy {
  readonly model = new EnemyModel();
  private body: RAPIER.RigidBody;
  private collider: RAPIER.Collider;
  private controller: RAPIER.KinematicCharacterController;
  private brain: EnemyBrain;

  private cfg: DifficultyConfig['enemy'];
  private patrol: THREE.Vector3[];
  private facing = 0;
  private vy = 0;
  private active = false;
  private seen = false;
  private lungeTimer = 0;
  private lungeCooldown = 0;

  constructor(
    private scene: THREE.Scene,
    private world: RAPIER.World,
    spawn: THREE.Vector3,
    cfg: DifficultyConfig['enemy'],
    patrol: THREE.Vector3[]
  ) {
    this.cfg = cfg;
    this.patrol = patrol;
    this.scene.add(this.model.root);
    this.model.setVisible(false);

    const bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(spawn.x, spawn.y, spawn.z);
    this.body = this.world.createRigidBody(bodyDesc);
    this.collider = this.world.createCollider(RAPIER.ColliderDesc.capsule(0.6, 0.45), this.body);

    this.controller = this.world.createCharacterController(0.05);
    this.controller.enableSnapToGround(0.4);
    this.controller.enableAutostep(0.35, 0.2, true);

    this.brain = new EnemyBrain({
      patrolSpeed: cfg.patrolSpeed,
      chaseSpeed: cfg.chaseSpeed,
      giveUpTime: cfg.giveUpTime,
      waypoints: patrol.map(p => ({ x: p.x, z: p.z })),
    });
  }

  setConfig(cfg: DifficultyConfig['enemy'], patrol: THREE.Vector3[]) {
    this.cfg = cfg;
    this.patrol = patrol;
    this.brain.setConfig({
      patrolSpeed: cfg.patrolSpeed,
      chaseSpeed: cfg.chaseSpeed,
      giveUpTime: cfg.giveUpTime,
      waypoints: patrol.map(p => ({ x: p.x, z: p.z })),
    });
  }

  reset(spawn: THREE.Vector3) {
    this.body.setNextKinematicTranslation({ x: spawn.x, y: spawn.y, z: spawn.z });
    this.vy = 0;
    this.seen = false;
    this.lungeTimer = 0;
    this.lungeCooldown = 0;
    this.brain.reset({ x: spawn.x, z: spawn.z });
  }

  /**
   * Fair respawn: reset to the patrol waypoint FURTHEST from where the
   * player just respawned, instead of blindly to `enemySpawn` — prevents
   * spawn-camping when a checkpoint happens to sit near the enemy's spawn.
   */
  resetAwayFrom(respawnPos: THREE.Vector3) {
    if (this.patrol.length === 0) { this.reset(respawnPos); return; }
    let best = this.patrol[0];
    let bestDist = -1;
    for (const wp of this.patrol) {
      const d = wp.distanceTo(respawnPos);
      if (d > bestDist) { bestDist = d; best = wp; }
    }
    this.reset(best);
  }

  setActive(v: boolean) {
    this.active = v;
    this.model.setVisible(v);
  }

  isSeen(): boolean { return this.seen; }
  getState() { return this.brain.state; }

  getPosition(): THREE.Vector3 {
    const p = this.body.translation();
    return new THREE.Vector3(p.x, p.y, p.z);
  }

  didCatch(playerPos: THREE.Vector3): boolean {
    if (!this.active) return false;
    const p = this.body.translation();
    const horiz = Math.hypot(playerPos.x - p.x, playerPos.z - p.z);
    return horiz <= this.cfg.catchRadius && Math.abs(playerPos.y - p.y) < 2;
  }

  update(dt: number, ctx: EnemyContext) {
    if (!this.active) return;

    const pos = this.body.translation();
    const self3 = new THREE.Vector3(pos.x, pos.y, pos.z);
    const selfXZ: Vec2 = { x: pos.x, z: pos.z };

    // ---- Perception ----
    const canSee = this.canSeePlayer(self3, ctx.playerPos);
    this.seen = canSee;
    const distXZ = Math.hypot(ctx.playerPos.x - pos.x, ctx.playerPos.z - pos.z);
    const heard = (ctx.noise && distXZ <= this.cfg.hearingRadius)
      ? { x: ctx.playerPos.x, z: ctx.playerPos.z }
      : null;

    // ---- Brain ----
    const out = this.brain.update(dt, { canSee, player: { x: ctx.playerPos.x, z: ctx.playerPos.z }, heard }, selfXZ);

    // ---- Steering toward target with obstacle avoidance ----
    let dir = new THREE.Vector3(out.target.x - pos.x, 0, out.target.z - pos.z);
    const planarDist = dir.length();
    if (planarDist > 0.05) {
      dir.normalize();
      dir = this.avoidObstacles(self3, dir);
      if (dir.lengthSq() > 1e-4) this.facing = Math.atan2(dir.x, dir.z);
    } else {
      dir.set(0, 0, 0);
    }

    // gravity
    this.vy += this.world.gravity.y * dt;
    const grounded = this.controller.computedGrounded();
    if (grounded) this.vy = Math.max(this.vy, -2);

    // Occasional lunge while actively chasing in sight — a real burst of
    // speed so a fleeing player must actually evade, not just outwalk it.
    this.lungeCooldown = Math.max(0, this.lungeCooldown - dt);
    if (out.state === 'chase' && canSee && this.lungeTimer <= 0 && this.lungeCooldown <= 0) {
      this.lungeTimer = 0.8;
      this.lungeCooldown = 4.0;
    }
    if (this.lungeTimer > 0) this.lungeTimer -= dt;
    const lungeMult = this.lungeTimer > 0 ? 1.4 : 1;

    const speed = out.speed * lungeMult;
    const desired = new THREE.Vector3(dir.x * speed * dt, this.vy * dt, dir.z * speed * dt);
    this.controller.computeColliderMovement(this.collider, desired);
    const mv = this.controller.computedMovement();
    this.body.setNextKinematicTranslation({ x: pos.x + mv.x, y: pos.y + mv.y, z: pos.z + mv.z });

    // ---- Present ----
    const np = this.body.translation();
    this.model.root.position.set(np.x, np.y, np.z);
    this.model.root.rotation.y = this.facing;
    this.model.update(dt, dir.lengthSq() > 0 ? speed : 0, out.intensity);
  }

  // FOV + range + Rapier line-of-sight (walls block)
  private canSeePlayer(self: THREE.Vector3, player: THREE.Vector3): boolean {
    const to = new THREE.Vector3().subVectors(player, self);
    const dist = to.length();
    if (dist > this.cfg.sightRange) return false;

    const toXZ = new THREE.Vector3(to.x, 0, to.z);
    if (toXZ.lengthSq() < 1e-4) return true;
    toXZ.normalize();

    // Sense anything very close regardless of facing.
    const closeSense = dist < 2.5;
    if (!closeSense) {
      const facingDir = new THREE.Vector3(Math.sin(this.facing), 0, Math.cos(this.facing));
      const cos = facingDir.dot(toXZ);
      const halfFov = THREE.MathUtils.degToRad(this.cfg.fovDeg) / 2;
      if (cos < Math.cos(halfFov)) return false;
    }

    // Line of sight — cast from eye toward player, ignore self collider.
    const eye = self.clone().add(new THREE.Vector3(0, 0.6, 0));
    const target = player.clone().add(new THREE.Vector3(0, 0.2, 0));
    const rd = new THREE.Vector3().subVectors(target, eye);
    const rlen = rd.length();
    rd.normalize();
    const ray = new RAPIER.Ray(eye, rd);
    const hit = this.world.castRay(ray, rlen, true, undefined, undefined, this.collider);
    if (hit && hit.timeOfImpact < rlen - 0.7) return false; // wall in the way
    return true;
  }

  // A direction is safe only if the path ahead is clear of walls AND there is
  // floor to step onto (ledge-avoidance — the enemy never walks off an edge).
  private avoidObstacles(self: THREE.Vector3, dir: THREE.Vector3): THREE.Vector3 {
    const origin = self.clone().add(new THREE.Vector3(0, 0.4, 0));
    const probe = 1.6;
    const DOWN = new THREE.Vector3(0, -1, 0);

    const safe = (d: THREE.Vector3) => {
      // 1) no wall directly ahead
      const wall = this.world.castRay(new RAPIER.Ray(origin, d), probe, true, undefined, undefined, this.collider);
      if (wall && wall.timeOfImpact < probe - 0.05) return false;
      // 2) floor exists just ahead (else it's a ledge)
      const ahead = self.clone().add(d.clone().multiplyScalar(probe * 0.7)).add(new THREE.Vector3(0, 0.3, 0));
      const ground = this.world.castRay(new RAPIER.Ray(ahead, DOWN), 2.0, true, undefined, undefined, this.collider);
      return !!ground; // ground within 2m below → safe to step
    };

    if (safe(dir)) return dir;
    for (const deg of [25, -25, 50, -50, 80, -80, 120, -120]) {
      const rot = dir.clone().applyAxisAngle(UP, THREE.MathUtils.degToRad(deg));
      if (safe(rot)) return rot;
    }
    return new THREE.Vector3(0, 0, 0); // no safe step — hold position at the edge
  }

  dispose() {
    this.scene.remove(this.model.root);
    this.world.removeRigidBody(this.body);
  }
}
