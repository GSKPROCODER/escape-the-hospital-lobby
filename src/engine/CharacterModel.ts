import * as THREE from 'three';

export interface AnimInput {
  dt: number;
  speed: number;      // horizontal speed (world units / s)
  maxSpeed: number;   // for normalising the gait
  grounded: boolean;
  vy: number;         // vertical velocity (for jump/fall pose)
}

/**
 * A stylized low-poly "patient" figure built from primitives, animated
 * procedurally (no skeleton / no external rig). Origin is the capsule centre,
 * so feet sit at roughly y = -1 to match the Rapier capsule collider.
 *
 * Structured so a rigged glTF + AnimationMixer can replace this later without
 * touching the Player controller — it only calls `update()` and reads `root`.
 */
export class CharacterModel {
  readonly root = new THREE.Group();

  private hips = new THREE.Group();
  private torso = new THREE.Group();
  private head = new THREE.Group();
  private armL = new THREE.Group();
  private armR = new THREE.Group();
  private legL = new THREE.Group();
  private legR = new THREE.Group();

  private gaitPhase = 0;
  private idleT = 0;
  private airBlend = 0; // 0 grounded .. 1 airborne
  private stepEvent = false;
  private lastStepCycle = -1;

  constructor() {
    const skin = new THREE.MeshStandardMaterial({ color: 0xc9b8a5, roughness: 0.8 });
    const gown = new THREE.MeshStandardMaterial({ color: 0x2f6f6a, roughness: 0.7, metalness: 0.05 });
    const gownDark = new THREE.MeshStandardMaterial({ color: 0x244f4c, roughness: 0.75 });
    const hair = new THREE.MeshStandardMaterial({ color: 0x14171a, roughness: 0.9 });
    const eye = new THREE.MeshStandardMaterial({ color: 0x0a0c0e, roughness: 0.4 });

    const box = (w: number, h: number, d: number, mat: THREE.Material) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.castShadow = true;
      return m;
    };

    // Hips anchor sits at ~ -0.15 (waist). Legs hang from here.
    this.hips.position.set(0, -0.15, 0);

    // Torso (tapered gown) grows upward from hips
    const torsoMesh = box(0.6, 0.7, 0.34, gown);
    torsoMesh.position.y = 0.35;
    this.torso.add(torsoMesh);
    // shoulders
    const shoulders = box(0.72, 0.18, 0.36, gownDark);
    shoulders.position.y = 0.68;
    this.torso.add(shoulders);
    this.hips.add(this.torso);

    // Head + hair + eyes
    const headMesh = box(0.34, 0.36, 0.32, skin);
    this.head.add(headMesh);
    const hairMesh = box(0.38, 0.16, 0.36, hair);
    hairMesh.position.y = 0.18;
    this.head.add(hairMesh);
    const eyeGeoOffsets: [number, number][] = [[-0.08, 0.02], [0.08, 0.02]];
    for (const [ex, ey] of eyeGeoOffsets) {
      const em = box(0.06, 0.05, 0.02, eye);
      em.position.set(ex, ey, 0.17);
      this.head.add(em);
    }
    this.head.position.y = 0.92;
    this.torso.add(this.head);

    // Arms — pivot at shoulder, arm extends downward from pivot
    const buildArm = (grp: THREE.Group, side: number) => {
      const upper = box(0.16, 0.42, 0.16, gown);
      upper.position.y = -0.21;
      grp.add(upper);
      const hand = box(0.17, 0.16, 0.17, skin);
      hand.position.y = -0.5;
      grp.add(hand);
      grp.position.set(side * 0.4, 0.64, 0);
      this.torso.add(grp);
    };
    buildArm(this.armL, -1);
    buildArm(this.armR, 1);

    // Legs — pivot at hip, leg extends downward
    const buildLeg = (grp: THREE.Group, side: number) => {
      const upper = box(0.2, 0.46, 0.2, gownDark);
      upper.position.y = -0.23;
      grp.add(upper);
      const foot = box(0.22, 0.12, 0.3, hair);
      foot.position.set(0, -0.5, 0.05);
      grp.add(foot);
      grp.position.set(side * 0.16, 0, 0);
      this.hips.add(grp);
    };
    buildLeg(this.legL, -1);
    buildLeg(this.legR, 1);

    this.root.add(this.hips);

    // Soft contact shadow blob under the feet
    const shadowTex = makeRadialShadowTexture();
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.1, 1.1),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.5, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.72; // Positioned just under the feet (-0.71)
    this.root.add(shadow);
  }

  setVisible(v: boolean) { this.root.visible = v; }
  consumeStepEvent(): boolean { const v = this.stepEvent; this.stepEvent = false; return v; }

  update(a: AnimInput) {
    const norm = Math.min(1, a.speed / Math.max(0.001, a.maxSpeed));

    // Blend toward airborne pose
    const airTarget = a.grounded ? 0 : 1;
    this.airBlend += (airTarget - this.airBlend) * Math.min(1, a.dt * 10);

    // --- Gait (walk/run) ---
    // frequency & amplitude scale with speed
    const freq = 6 + norm * 6;
    this.gaitPhase += a.dt * freq * (norm > 0.02 ? 1 : 0);

    // A footstep lands each half-stride while grounded and actually moving.
    if (a.grounded && norm > 0.15) {
      const cycle = Math.floor(this.gaitPhase / Math.PI);
      if (cycle !== this.lastStepCycle) { this.stepEvent = true; this.lastStepCycle = cycle; }
    }

    const swing = Math.sin(this.gaitPhase) * (0.35 + norm * 0.5);
    const swingArm = Math.sin(this.gaitPhase) * (0.3 + norm * 0.45);

    const ground = 1 - this.airBlend;

    // Legs swing opposite; arms counter-swing to legs
    this.legL.rotation.x = swing * ground;
    this.legR.rotation.x = -swing * ground;
    this.armL.rotation.x = -swingArm * ground;
    this.armR.rotation.x = swingArm * ground;

    // Forward lean when running
    this.torso.rotation.x = norm * 0.18 * ground;

    // Bob the hips slightly while walking; overall vertical bounce
    const bob = Math.abs(Math.sin(this.gaitPhase)) * 0.05 * norm * ground;

    // --- Idle breathing (only when basically still & grounded) ---
    this.idleT += a.dt;
    const idleAmt = (1 - norm) * ground;
    const breathe = Math.sin(this.idleT * 1.8) * 0.03 * idleAmt;
    const idleArmSway = Math.sin(this.idleT * 1.4) * 0.06 * idleAmt;
    this.armL.rotation.x += idleArmSway;
    this.armR.rotation.x += idleArmSway;
    this.head.rotation.y = Math.sin(this.idleT * 0.5) * 0.15 * idleAmt;

    this.hips.position.y = -0.15 + bob + breathe;

    // --- Air pose (jump/fall) ---
    if (this.airBlend > 0.001) {
      const rising = a.vy > 0;
      const tuck = rising ? -0.5 : -0.9;   // legs tuck more on fall
      const reach = rising ? -1.2 : -0.4;  // arms up on jump, spread on fall
      this.legL.rotation.x = THREE.MathUtils.lerp(this.legL.rotation.x, tuck, this.airBlend);
      this.legR.rotation.x = THREE.MathUtils.lerp(this.legR.rotation.x, tuck * 0.7, this.airBlend);
      this.armL.rotation.x = THREE.MathUtils.lerp(this.armL.rotation.x, reach, this.airBlend);
      this.armR.rotation.x = THREE.MathUtils.lerp(this.armR.rotation.x, reach, this.airBlend);
      this.torso.rotation.x = THREE.MathUtils.lerp(this.torso.rotation.x, -0.1, this.airBlend);
    }
  }
}

function makeRadialShadowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(0,0,0,0.75)');
  grad.addColorStop(0.6, 'rgba(0,0,0,0.35)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
