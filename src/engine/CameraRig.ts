import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { InputState } from '../core/Input';
import { CameraMode } from '../core/Settings';

/**
 * Third-person: spring-smoothed follow that trails behind the travel direction
 * and never clips through walls. First-person: camera at eye height.
 */
export class CameraRig {
  private yaw = Math.PI;
  private pitch = 0.16;
  private distance = 2.8;
  private mode: CameraMode = 'third';

  private readonly lookAt = new THREE.Vector3();     // chest target
  private readonly smoothPos = new THREE.Vector3();  // smoothed camera position
  private initialised = false;
  private menuAngle = 0;

  private readonly PITCH_MIN = -0.55;
  private readonly PITCH_MAX = 0.95;
  private readonly THIRD_DIST = 2.8;
  private readonly TP_HEIGHT = 1.15;   // look-at height above body centre
  private readonly FP_EYE = 0.75;      // eye height above body centre

  constructor(
    private camera: THREE.PerspectiveCamera,
    private world: RAPIER.World
  ) {}

  setMode(mode: CameraMode) {
    this.mode = mode;
    this.distance = mode === 'first' ? 0 : this.THIRD_DIST;
    this.initialised = false; // re-seat smoothing on next update
  }

  getYaw(): number { return this.yaw; }

  /**
   * Instantly re-seat the camera behind the player facing `heading` (used on
   * respawn so a stale camera angle never adds insult to a fresh death).
   */
  snapBehind(heading: number) {
    this.yaw = heading + Math.PI;
    this.pitch = 0.16;
    this.initialised = false;
  }

  /**
   * @param heading  player facing yaw (atan2(vx,vz))
   * @param moving   true when the player has meaningful horizontal speed
   */
  update(input: InputState, targetPos: THREE.Vector3, dt: number, heading: number, moving: boolean) {
    // Manual look (drag or Q/E already folded into lookDelta)
    this.yaw += input.lookDelta.x;
    this.pitch += input.lookDelta.y;
    this.pitch = Math.max(this.PITCH_MIN, Math.min(this.PITCH_MAX, this.pitch));

    const manualLook = Math.abs(input.lookDelta.x) > 1e-4;
    // Only auto-trail on mostly-forward/back input. The target heading is the
    // player's WORLD-space facing, which itself depends on the CURRENT camera
    // yaw for any input with a lateral component — chasing it during a strafe
    // creates a one-frame-delayed feedback loop with no stable fixed point
    // except pure-forward, so any held diagonal/strafe spins the camera
    // (and effective move direction) continuously. Gating on the RAW local
    // input (camera-independent) breaks the loop entirely.
    const forwardDominant = Math.abs(input.move.x) < 0.5;

    // ---- First person ----
    if (this.mode === 'first') {
      const eye = targetPos.clone().add(new THREE.Vector3(0, this.FP_EYE, 0));
      const dir = new THREE.Vector3(0, 0, -1)
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      this.camera.position.copy(eye);
      this.camera.lookAt(eye.clone().add(dir));
      this.initialised = false;
      return;
    }

    // ---- Third person ----
    // Gentle auto-trail: swing behind the direction of travel when not manually looking.
    if (!manualLook && moving && forwardDominant) {
      const target = heading + Math.PI; // behind the character
      this.yaw = lerpAngle(this.yaw, target, 1 - Math.exp(-dt * 2.2));
    }

    const desiredLookAt = targetPos.clone().add(new THREE.Vector3(0, this.TP_HEIGHT, 0));
    this.lookAt.lerp(desiredLookAt, this.initialised ? 1 - Math.exp(-dt * 18) : 1);

    const offset = new THREE.Vector3(0, 0, this.distance)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), this.pitch)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

    let dist = this.distance;
    // Wall collision — keep the camera in front of geometry.
    const rayDir = offset.clone().normalize();
    const ray = new RAPIER.Ray(this.lookAt, rayDir);
    const hit = this.world.castRay(ray, this.distance + 0.3, true);
    if (hit) dist = Math.max(0.6, hit.timeOfImpact - 0.3);

    const desiredPos = this.lookAt.clone().add(rayDir.multiplyScalar(dist));

    if (!this.initialised) {
      this.smoothPos.copy(desiredPos);
      this.initialised = true;
    } else {
      // Snap tighter when a wall pulled the camera in, otherwise smooth.
      const rate = hit ? 40 : 14;
      this.smoothPos.lerp(desiredPos, 1 - Math.exp(-dt * rate));
    }

    this.camera.position.copy(this.smoothPos);
    this.camera.lookAt(this.lookAt);
  }

  /** Slow cinematic orbit behind the main menu. */
  menuUpdate(dt: number, focus: THREE.Vector3, reducedMotion: boolean) {
    if (!reducedMotion) this.menuAngle += dt * 0.1;
    const r = 7.5;
    const h = 2.8 + Math.sin(this.menuAngle * 0.6) * 0.5;
    this.camera.position.set(
      focus.x + Math.cos(this.menuAngle) * r,
      focus.y + h,
      focus.z + Math.sin(this.menuAngle) * r
    );
    this.camera.lookAt(focus.x, focus.y + 0.6, focus.z);
    this.yaw = -this.menuAngle + Math.PI;
    this.initialised = false;
  }
}

function lerpAngle(a: number, b: number, t: number): number {
  let diff = (b - a) % (Math.PI * 2);
  if (diff > Math.PI) diff -= Math.PI * 2;
  if (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
