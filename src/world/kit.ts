import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

/**
 * Level build kit — data-driven helpers for enemy-safe hospital levels.
 * Everything sits on continuous floors (rooms + corridors), so the ground-
 * navigating enemy never meets a bottomless pit. Challenge comes from
 * hazard volumes (touch → respawn), sweeping hazards, timed auto-doors, and
 * keycard/locked-exit puzzles — all on solid ground.
 *
 * One kit instance owns one level's meshes/bodies and its runtime behaviour.
 */

interface HazardVol {
  center: THREE.Vector3;
  half: THREE.Vector3;
  mesh?: THREE.Mesh;
  mat?: THREE.MeshStandardMaterial;
  baseEmissive?: number;
  sweep?: { from: THREE.Vector3; to: THREE.Vector3; period: number; phase: number };
}
interface Door {
  body: RAPIER.RigidBody;
  mesh: THREE.Mesh;
  base: THREE.Vector3;
  slide: THREE.Vector3;
  period: number;
  phase: number;
}
interface FlickerLight {
  light: THREE.PointLight;
  mat: THREE.MeshStandardMaterial;
  base: number;
  seed: number;
  flicker: boolean;
}
interface Keycard {
  pos: THREE.Vector3;
  radius: number;
  mesh: THREE.Group;
  collected: boolean;
}
interface CheckpointStrip {
  z: number;
  mesh: THREE.Mesh;
  mat: THREE.MeshBasicMaterial;
  activated: boolean;
}

const PLAYER_PAD = new THREE.Vector3(0.4, 0, 0.4);

export class LevelKit {
  private meshes: THREE.Object3D[] = [];
  private bodies: RAPIER.RigidBody[] = [];
  private disposables: { dispose(): void }[] = [];
  private hazards: HazardVol[] = [];
  private doors: Door[] = [];
  private lights: FlickerLight[] = [];
  private keycard: Keycard | null = null;
  private checkpointStrips: CheckpointStrip[] = [];

  private pickupEvent = false;
  private exitMesh: THREE.Mesh | null = null;
  private exitLockedMat: THREE.MeshStandardMaterial | null = null;
  private exitOpenMat: THREE.MeshStandardMaterial | null = null;
  private wasUnlocked = false;
  private beaconMat: THREE.MeshBasicMaterial | null = null;
  private beaconLight: THREE.PointLight | null = null;

  readonly mat: {
    floor: THREE.MeshStandardMaterial; wall: THREE.MeshStandardMaterial;
    trim: THREE.MeshStandardMaterial; ceil: THREE.MeshStandardMaterial;
    metal: THREE.MeshStandardMaterial; prop: THREE.MeshStandardMaterial;
  };

  constructor(private scene: THREE.Scene, private world: RAPIER.World) {
    const floorTex = makeTileTexture();
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(0.35, 0.35);
    this.disposables.push(floorTex);
    this.mat = {
      floor: new THREE.MeshStandardMaterial({ map: floorTex, color: 0x9aa2a2, roughness: 0.9 }),
      wall: new THREE.MeshStandardMaterial({ color: 0x5a6a62, roughness: 0.95 }),   // mid clinical green
      trim: new THREE.MeshStandardMaterial({ color: 0x39463f, roughness: 0.7, metalness: 0.1 }),
      ceil: new THREE.MeshStandardMaterial({ color: 0x2c3438, roughness: 1 }),
      metal: new THREE.MeshStandardMaterial({ color: 0x8b969c, roughness: 0.35, metalness: 0.7 }),
      prop: new THREE.MeshStandardMaterial({ color: 0x6b7a72, roughness: 0.85 }),
    };
    Object.values(this.mat).forEach(m => this.disposables.push(m));
  }

  // ---------- static geometry ----------
  solid(mat: THREE.Material, x: number, y: number, z: number, w: number, h: number, d: number, cast = true): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = cast; mesh.receiveShadow = true;
    this.scene.add(mesh); this.meshes.push(mesh); this.disposables.push(mesh.geometry);
    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z));
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(w / 2, h / 2, d / 2), body);
    this.bodies.push(body);
    return mesh;
  }

  deco(mat: THREE.Material, geo: THREE.BufferGeometry, x: number, y: number, z: number, rotY = 0): THREE.Mesh {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z); mesh.rotation.y = rotY; mesh.castShadow = true;
    this.scene.add(mesh); this.meshes.push(mesh); this.disposables.push(geo);
    return mesh;
  }

  /** Floor slab (no shadow cast) + no walls. */
  floor(x: number, z: number, w: number, d: number) { this.solid(this.mat.floor, x, -0.5, z, w, 1, d, false); }

  /** A rectangular room: floor + 4 walls (with optional doorway gaps) + ceiling + a light. */
  room(x: number, z: number, w: number, d: number, opts: {
    h?: number; doors?: ('n' | 's' | 'e' | 'w')[]; doorW?: number; light?: number; ceiling?: boolean;
    flickerLight?: boolean;
  } = {}) {
    const h = opts.h ?? 5;
    const doors = new Set(opts.doors ?? []);
    const dw = opts.doorW ?? 3;
    const t = 0.4;
    const wallY = h / 2;
    this.floor(x, z, w, d);

    // Horizontal wall (runs along X) at z = zc, optional centred gap.
    const hWall = (zc: number, gap: boolean) => {
      if (!gap) { this.solid(this.mat.wall, x, wallY, zc, w, h, t, false); return; }
      const side = (w - dw) / 2;
      this.solid(this.mat.wall, x - (dw + side) / 2, wallY, zc, side, h, t, false);
      this.solid(this.mat.wall, x + (dw + side) / 2, wallY, zc, side, h, t, false);
      this.solid(this.mat.wall, x, h - 0.75, zc, dw, 1.5, t, false); // lintel
    };
    // Vertical wall (runs along Z) at x = xc, optional centred gap.
    const vWall = (xc: number, gap: boolean) => {
      if (!gap) { this.solid(this.mat.wall, xc, wallY, z, t, h, d, false); return; }
      const side = (d - dw) / 2;
      this.solid(this.mat.wall, xc, wallY, z - (dw + side) / 2, t, h, side, false);
      this.solid(this.mat.wall, xc, wallY, z + (dw + side) / 2, t, h, side, false);
      this.solid(this.mat.wall, xc, h - 0.75, z, t, 1.5, dw, false);
    };
    hWall(z + d / 2, doors.has('n'));
    hWall(z - d / 2, doors.has('s'));
    vWall(x + w / 2, doors.has('e'));
    vWall(x - w / 2, doors.has('w'));

    if (opts.ceiling !== false) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(w, 0.4, d), this.mat.ceil);
      c.position.set(x, h, z); c.receiveShadow = true;
      this.scene.add(c); this.meshes.push(c); this.disposables.push(c.geometry);
    }
    if (opts.light !== undefined) this.light(x, h - 0.6, z, 0xdfeee6, opts.light, Math.max(w, d) * 1.3, !!opts.flickerLight);
  }

  /** A corridor (floor + two side walls + ceiling + light) running along Z. */
  corridorZ(x: number, z0: number, z1: number, width: number, h = 4) {
    const zc = (z0 + z1) / 2, len = Math.abs(z1 - z0);
    this.floor(x, zc, width, len);
    this.solid(this.mat.wall, x - width / 2, h / 2, zc, 0.4, h, len, false);
    this.solid(this.mat.wall, x + width / 2, h / 2, zc, 0.4, h, len, false);
    const c = new THREE.Mesh(new THREE.BoxGeometry(width, 0.4, len), this.mat.ceil);
    c.position.set(x, h, zc); this.scene.add(c); this.meshes.push(c); this.disposables.push(c.geometry);
    if (len > 3) this.light(x, h - 0.5, zc, 0xdfeee6, 18, len + 6, false);
  }

  light(x: number, y: number, z: number, color: number, base: number, dist: number, flicker: boolean) {
    const light = new THREE.PointLight(color, base, dist, 2);
    light.position.set(x, y, z);
    this.scene.add(light); this.meshes.push(light);
    const mat = new THREE.MeshStandardMaterial({ color: 0x20282c, emissive: color, emissiveIntensity: 1.4 });
    this.disposables.push(mat);
    const fixture = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.5), mat);
    fixture.position.set(x, y + 0.28, z);
    this.scene.add(fixture); this.meshes.push(fixture); this.disposables.push(fixture.geometry);
    this.lights.push({ light, mat, base, seed: this.lights.length * 12.3, flicker });
  }

  // ---------- props ----------
  /** Low box you can jump onto / climb over (solid). */
  crate(x: number, y: number, z: number, w: number, h: number, d: number) {
    return this.solid(this.mat.prop, x, y, z, w, h, d);
  }

  /** Glowing wall EXIT sign (fog-exempt) — guidance + atmosphere. */
  sign(x: number, y: number, z: number, rotY = 0) {
    const mat = new THREE.MeshBasicMaterial({ color: 0x35e0c8, transparent: true, opacity: 0.85, fog: false });
    this.disposables.push(mat);
    const s = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.42, 0.08), mat);
    s.position.set(x, y, z); s.rotation.y = rotY;
    this.scene.add(s); this.meshes.push(s); this.disposables.push(s.geometry);
    const glow = new THREE.PointLight(0x35e0c8, 3, 4, 2);
    glow.position.set(x, y, z);
    this.scene.add(glow); this.meshes.push(glow);
  }

  /** Decorative overturned wheelchair (no collider). */
  wheelchair(x: number, z: number, rotY = 0) {
    const g = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.6), this.mat.metal); seat.position.y = 0.5; g.add(seat);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.1), this.mat.metal); back.position.set(0, 0.85, -0.28); g.add(back);
    for (const s of [-1, 1]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.06, 12), this.mat.trim);
      wheel.rotation.z = Math.PI / 2; wheel.position.set(s * 0.34, 0.4, 0.1); g.add(wheel);
    }
    g.position.set(x, 0, z); g.rotation.y = rotY; g.rotation.z = 0.5; // tipped over
    g.traverse(o => { if ((o as THREE.Mesh).isMesh) { (o as THREE.Mesh).castShadow = true; this.disposables.push((o as THREE.Mesh).geometry); } });
    this.scene.add(g); this.meshes.push(g);
  }

  // ---------- hazards ----------
  /**
   * Static hazard patch on the floor (touch → respawn). Reads as an actual
   * warning automatically — diagonal hazard-stripe texture (the universal
   * "danger" visual language) plus a slow automatic pulse — instead of a
   * flat, static, single-color rectangle that looks like an unfinished
   * placeholder.
   */
  hazardTile(x: number, z: number, w: number, d: number, color = 0xff7a1a) {
    const tex = makeHazardStripeTexture(color);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(Math.max(1, Math.round(w / 1.2)), Math.max(1, Math.round(d / 1.2)));
    this.disposables.push(tex);
    const mat = new THREE.MeshStandardMaterial({
      map: tex, color: 0xffffff, emissive: color, emissiveIntensity: 0.9, roughness: 0.5,
    });
    this.disposables.push(mat);
    const patch = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), mat);
    patch.position.set(x, 0.05, z);
    this.scene.add(patch); this.meshes.push(patch); this.disposables.push(patch.geometry);
    this.hazards.push({ center: new THREE.Vector3(x, 0.9, z), half: new THREE.Vector3(w / 2, 1.1, d / 2), mat, baseEmissive: 0.9 });
  }

  /** A glowing hazard that sweeps between two points (timing hazard). */
  sweepingHazard(from: THREE.Vector3, to: THREE.Vector3, size: THREE.Vector3, period: number, color = 0xff5030, phase = 0) {
    const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.2, roughness: 0.5 });
    this.disposables.push(mat);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size.x, size.y, size.z), mat);
    this.scene.add(mesh); this.meshes.push(mesh); this.disposables.push(mesh.geometry);
    this.hazards.push({
      center: from.clone(), half: new THREE.Vector3(size.x / 2, size.y / 2, size.z / 2), mesh, mat,
      baseEmissive: 1.2,
      sweep: { from: from.clone(), to: to.clone(), period, phase },
    });
  }

  // ---------- timed door ----------
  /** Solid door that slides open/closed on a cycle (pass when open). Never crushes fatally. */
  autoDoor(x: number, y: number, z: number, w: number, h: number, d: number, slide: THREE.Vector3, period: number, phase = 0) {
    const mesh = this.deco(this.mat.metal, new THREE.BoxGeometry(w, h, d), x, y, z);
    const body = this.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(x, y, z));
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(w / 2, h / 2, d / 2), body);
    this.bodies.push(body);
    this.doors.push({ body, mesh, base: new THREE.Vector3(x, y, z), slide: slide.clone(), period, phase });
  }

  // ---------- keycard / exit lock ----------
  keycardAt(x: number, y: number, z: number) {
    const g = new THREE.Group();
    const cardMat = new THREE.MeshStandardMaterial({ color: 0x35e0c8, emissive: 0x35e0c8, emissiveIntensity: 1.4, roughness: 0.3 });
    this.disposables.push(cardMat);
    const card = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.32, 0.04), cardMat);
    g.add(card); g.position.set(x, y, z);
    this.scene.add(g); this.meshes.push(g); this.disposables.push(card.geometry);
    this.keycard = { pos: new THREE.Vector3(x, y, z), radius: 1.3, mesh: g, collected: false };
  }

  /** The exit door mesh; if `locked`, exit requires the keycard. */
  exitDoor(x: number, y: number, z: number, locked: boolean) {
    this.exitLockedMat = new THREE.MeshStandardMaterial({ color: 0x3a1414, emissive: 0xff3b3b, emissiveIntensity: 0.7, roughness: 0.5 });
    this.exitOpenMat = new THREE.MeshStandardMaterial({ color: 0x123a34, emissive: 0x35e0c8, emissiveIntensity: 0.9, roughness: 0.5 });
    this.disposables.push(this.exitLockedMat, this.exitOpenMat);
    const startMat = locked ? this.exitLockedMat : this.exitOpenMat;
    this.exitMesh = this.deco(startMat, new THREE.BoxGeometry(3, 4.4, 0.25), x, y, z);
    if (!locked) this.wasUnlocked = true;
    // frame
    this.solid(this.mat.trim, x - 1.9, y, z, 0.8, 4.8, 0.5, false);
    this.solid(this.mat.trim, x + 1.9, y, z, 0.8, 4.8, 0.5, false);
    this.solid(this.mat.trim, x, y + 2.6, z, 4.6, 0.6, 0.5, false);

    // Guidance beacon — a beam of light that shows through the fog (fog-exempt),
    // red while locked, teal once open.
    const col = locked ? 0xff3b3b : 0x35e0c8;
    this.beaconMat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.28, depthWrite: false, fog: false });
    this.disposables.push(this.beaconMat);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 10, 12, 1, true), this.beaconMat);
    beam.position.set(x, y + 3, z - 0.6);
    this.scene.add(beam); this.meshes.push(beam); this.disposables.push(beam.geometry);
    this.beaconLight = new THREE.PointLight(col, 10, 16, 2);
    this.beaconLight.position.set(x, y + 1, z - 0.8);
    this.scene.add(this.beaconLight); this.meshes.push(this.beaconLight);
  }

  /**
   * A full-width glowing floor strip marking a checkpoint LINE (matches the
   * crossing-line activation in LevelManager — any x/height crossing it
   * counts, not just standing on a spot). Brightens once the player crosses.
   */
  checkpointStrip(z: number, width: number, xCenter = 0) {
    const mat = new THREE.MeshBasicMaterial({ color: 0x35e0c8, transparent: true, opacity: 0.32, depthWrite: false, fog: false });
    this.disposables.push(mat);
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(width, 1.0), mat);
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(xCenter, 0.05, z);
    this.scene.add(strip); this.meshes.push(strip); this.disposables.push(strip.geometry);
    this.checkpointStrips.push({ z, mesh: strip, mat, activated: false });
  }

  // ---------- runtime ----------
  update(dt: number, elapsed: number, reducedMotion: boolean, playerPos: THREE.Vector3) {
    // Sweeping hazards
    for (const h of this.hazards) {
      if (!h.sweep) continue;
      const s = h.sweep;
      const t = 0.5 - 0.5 * Math.cos((elapsed / s.period + s.phase) * Math.PI * 2);
      h.center.lerpVectors(s.from, s.to, t);
      if (h.mesh) h.mesh.position.copy(h.center);
    }
    // Every hazard warns for itself automatically — a slow emissive pulse so
    // it's never mistaken for painted floor decoration.
    for (const h of this.hazards) {
      if (!h.mat || h.baseEmissive === undefined) continue;
      const pulse = reducedMotion ? 1 : 0.75 + 0.35 * Math.sin(elapsed * 2.6 + h.center.x);
      h.mat.emissiveIntensity = h.baseEmissive * pulse;
    }
    // Doors
    for (const d of this.doors) {
      const t = 0.5 - 0.5 * Math.cos((elapsed / d.period + d.phase) * Math.PI * 2);
      const p = d.base.clone().addScaledVector(d.slide, t);
      d.body.setNextKinematicTranslation({ x: p.x, y: p.y, z: p.z });
      d.mesh.position.copy(p);
    }
    // Keycard
    if (this.keycard && !this.keycard.collected) {
      this.keycard.mesh.rotation.y += dt * 2;
      this.keycard.mesh.position.y = this.keycard.pos.y + Math.sin(elapsed * 2) * 0.1;
      if (playerPos.distanceTo(this.keycard.pos) < this.keycard.radius) {
        this.keycard.collected = true;
        this.keycard.mesh.visible = false;
        this.pickupEvent = true;
      }
    }
    // Exit unlock visual (door + beacon go teal)
    if (this.exitMesh && this.exitOpenMat && this.canExit() && !this.wasUnlocked) {
      this.exitMesh.material = this.exitOpenMat;
      this.beaconMat?.color.setHex(0x35e0c8);
      this.beaconLight?.color.setHex(0x35e0c8);
      this.wasUnlocked = true;
    }
    // Beacon gentle pulse
    if (this.beaconMat && !reducedMotion) {
      this.beaconMat.opacity = 0.22 + 0.12 * (0.5 + 0.5 * Math.sin(elapsed * 2.5));
    }
    // Checkpoint strips brighten once crossed — purely visual confirmation,
    // independent of LevelManager's own (authoritative) crossing check.
    for (const cp of this.checkpointStrips) {
      if (!cp.activated && playerPos.z <= cp.z) {
        cp.activated = true;
        cp.mat.opacity = 0.8;
        cp.mat.color.setHex(0x9ff5e2);
      }
    }
    // Lights flicker (subtle)
    for (const fl of this.lights) {
      let f = 1;
      if (fl.flicker && !reducedMotion) {
        f = 0.9 + Math.sin(elapsed * 11 + fl.seed) * 0.05 + Math.sin(elapsed * 4.7 + fl.seed) * 0.03;
        if (Math.random() < 0.005) f *= 0.55;
      }
      fl.light.intensity = fl.base * f;
      fl.mat.emissiveIntensity = 1.1 + f * 0.4;
    }
  }

  hazardHit(playerPos: THREE.Vector3): boolean {
    for (const h of this.hazards) {
      if (Math.abs(playerPos.x - h.center.x) <= h.half.x + PLAYER_PAD.x &&
          Math.abs(playerPos.y - h.center.y) <= h.half.y &&
          Math.abs(playerPos.z - h.center.z) <= h.half.z + PLAYER_PAD.z) {
        return true;
      }
    }
    return false;
  }

  canExit(): boolean {
    return !this.keycard || this.keycard.collected;
  }

  consumePickup(): boolean { const v = this.pickupEvent; this.pickupEvent = false; return v; }

  dispose() {
    this.meshes.forEach(m => this.scene.remove(m));
    this.meshes.length = 0;
    this.bodies.forEach(b => this.world.removeRigidBody(b));
    this.bodies.length = 0;
    this.hazards.length = 0; this.doors.length = 0; this.lights.length = 0;
    this.keycard = null; this.exitMesh = null; this.checkpointStrips.length = 0;
    this.disposables.forEach(d => d.dispose());
    this.disposables.length = 0;
  }
}

/** Diagonal hazard-stripe pattern (the universal caution-tape look) tinted by `color`. */
function makeHazardStripeTexture(color: number): THREE.CanvasTexture {
  const s = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = s;
  const ctx = canvas.getContext('2d')!;
  const hex = `#${color.toString(16).padStart(6, '0')}`;
  ctx.fillStyle = '#15181a';
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = hex;
  ctx.lineWidth = s / 6;
  ctx.lineCap = 'square';
  for (let i = -s; i < s * 2; i += s / 3) {
    ctx.beginPath();
    ctx.moveTo(i, s + 10);
    ctx.lineTo(i + s + 10, -10);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeTileTexture(): THREE.CanvasTexture {
  const s = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = s;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#333b3d'; ctx.fillRect(0, 0, s, s);
  const n = 4, t = s / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const shade = 120 + ((i + j) % 2) * 18 + Math.floor(Math.random() * 12);
    ctx.fillStyle = `rgb(${shade},${shade + 6},${shade + 4})`;
    ctx.fillRect(i * t + 2, j * t + 2, t - 4, t - 4);
    ctx.fillStyle = `rgba(20,28,24,${0.05 + Math.random() * 0.08})`;
    ctx.beginPath();
    ctx.arc(i * t + Math.random() * t, j * t + Math.random() * t, Math.random() * 12, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
