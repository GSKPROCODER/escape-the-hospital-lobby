import * as THREE from 'three';

/**
 * A gaunt, taller-than-player "Presence" built from primitives with reactive
 * procedural animation. Origin at capsule centre; feet near y = -1.1.
 * `intensity` (0 patrol .. 1 chase) drives lurch speed and forward lunge.
 */
export class EnemyModel {
  readonly root = new THREE.Group();

  private torso = new THREE.Group();
  private head = new THREE.Group();
  private armL = new THREE.Group();
  private armR = new THREE.Group();
  private legL = new THREE.Group();
  private legR = new THREE.Group();
  private eyeMat: THREE.MeshStandardMaterial;

  private phase = 0;
  private stepEvent = false;
  private lastStepCycle = -1;

  constructor() {
    const skin = new THREE.MeshStandardMaterial({ color: 0x9aa39b, roughness: 1.0 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x39423f, roughness: 1.0 });
    this.eyeMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xff2b2b, emissiveIntensity: 2.2 });

    const box = (w: number, h: number, d: number, mat: THREE.Material) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.castShadow = true;
      return m;
    };

    // Elongated torso
    const torsoMesh = box(0.55, 1.0, 0.32, dark);
    torsoMesh.position.y = 0.2;
    this.torso.add(torsoMesh);
    this.root.add(this.torso);

    // Head with glowing eyes
    const headMesh = box(0.3, 0.34, 0.3, skin);
    this.head.add(headMesh);
    for (const ex of [-0.07, 0.07]) {
      const eye = box(0.06, 0.06, 0.02, this.eyeMat);
      eye.position.set(ex, 0.02, 0.16);
      this.head.add(eye);
    }
    this.head.position.y = 0.95;
    this.torso.add(this.head);

    // Long arms (reach low)
    const buildArm = (grp: THREE.Group, side: number) => {
      const upper = box(0.13, 0.62, 0.13, skin);
      upper.position.y = -0.31;
      grp.add(upper);
      const hand = box(0.16, 0.2, 0.12, skin);
      hand.position.y = -0.66;
      grp.add(hand);
      grp.position.set(side * 0.33, 0.62, 0);
      this.torso.add(grp);
    };
    buildArm(this.armL, -1);
    buildArm(this.armR, 1);

    // Legs
    const buildLeg = (grp: THREE.Group, side: number) => {
      const upper = box(0.16, 0.6, 0.16, dark);
      upper.position.y = -0.3;
      grp.add(upper);
      grp.position.set(side * 0.14, -0.3, 0);
      this.torso.add(grp);
    };
    buildLeg(this.legL, -1);
    buildLeg(this.legR, 1);

    // Contact shadow
    const shadowTex = radialShadow();
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.2),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.5, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.12;
    this.root.add(shadow);
  }

  setVisible(v: boolean) { this.root.visible = v; }
  consumeStepEvent(): boolean { const v = this.stepEvent; this.stepEvent = false; return v; }

  update(dt: number, speed: number, intensity: number) {
    const freq = 3 + intensity * 5;
    this.phase += dt * freq * (speed > 0.05 ? 1 : 0.25);

    if (speed > 0.05) {
      const cycle = Math.floor(this.phase / Math.PI);
      if (cycle !== this.lastStepCycle) { this.stepEvent = true; this.lastStepCycle = cycle; }
    }

    const swing = Math.sin(this.phase) * (0.25 + intensity * 0.5);

    this.legL.rotation.x = swing;
    this.legR.rotation.x = -swing;
    // arms reach forward more when chasing
    this.armL.rotation.x = -0.4 - intensity * 0.9 + swing * 0.3;
    this.armR.rotation.x = -0.4 - intensity * 0.9 - swing * 0.3;
    // hunch / lunge forward with intensity
    this.torso.rotation.x = 0.1 + intensity * 0.35;
    // subtle head twitch
    this.head.rotation.z = Math.sin(this.phase * 1.7) * 0.06 * (0.4 + intensity);

    this.eyeMat.emissiveIntensity = 1.6 + intensity * 2.2 + Math.sin(this.phase * 3) * 0.3;
  }
}

function radialShadow(): THREE.Texture {
  const size = 128;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(0,0,0,0.7)');
  g.addColorStop(0.6, 'rgba(0,0,0,0.3)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  return t;
}
