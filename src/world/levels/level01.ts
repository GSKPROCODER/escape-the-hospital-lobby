import * as THREE from 'three';
import { LevelConfig } from '../Level';
import { LevelKit } from '../kit';

// Reception Wing — Lobby → corridor → Waiting Room → corridor → Supply Room →
// corridor → Exit Foyer. Continuous floors throughout so the hunter never
// meets a pit. Progression runs toward -z. ~108m span, 4 rooms + 3 corridors,
// targeting a 2:30-3:00 first clear (widened from the original ~55m/25s
// layout — see BETTERMENT.md §3.3).
let kit: LevelKit | null = null;

export const level01: LevelConfig = {
  id: 'level01',
  name: 'Reception Wing',
  index: 1,
  spawnPosition: new THREE.Vector3(0, 1.4, 6),
  fallY: -8,

  checkpoints: [
    { pos: new THREE.Vector3(0, 1.4, -24), trigger: new THREE.Vector3(0, 1, -21) },
    { pos: new THREE.Vector3(0, 1.4, -44), trigger: new THREE.Vector3(0, 1, -41) },
    { pos: new THREE.Vector3(0, 1.4, -60), trigger: new THREE.Vector3(0, 1, -57) },
    { pos: new THREE.Vector3(0, 1.4, -89), trigger: new THREE.Vector3(0, 1, -86) },
  ],
  winZone: { pos: new THREE.Vector3(0, 1.5, -96.5), radius: 3 },
  enemySpawn: new THREE.Vector3(0, 1.4, -31),
  patrol: [
    new THREE.Vector3(0, 1.4, -31),
    new THREE.Vector3(-7, 1.4, -36),
    new THREE.Vector3(0, 1.4, -50),
    new THREE.Vector3(0, 1.4, -64),
    new THREE.Vector3(7, 1.4, -36),
  ],

  build: (scene, world) => {
    kit = new LevelKit(scene, world);
    const k = kit;

    // Lobby (spans z -4..10)
    k.room(0, 3, 16, 14, { doors: ['s'], doorW: 4, light: 34 });
    k.crate(4.5, 0.55, 2, 4, 1.1, 1.2);
    k.deco(k.mat.metal, new THREE.BoxGeometry(4.2, 0.1, 1.4), 4.5, 1.15, 2);
    k.wheelchair(-5, 0, 0.6);
    k.sign(0, 3.9, -3.7); // EXIT sign over the lobby doorway

    // Corridor lobby → waiting room (z -4..-21)
    k.corridorZ(0, -4, -21, 4, 4);

    // Waiting Room (spans z -41..-21) — enlarged from the original 14x12
    k.room(0, -31, 20, 20, { doors: ['n', 's'], doorW: 4, light: 40, flickerLight: true });
    k.crate(-7, 0.4, -26, 3, 0.8, 0.8);
    k.crate(7, 0.4, -26, 3, 0.8, 0.8);
    k.crate(-7, 0.4, -31, 3, 0.8, 0.8);
    k.crate(7, 0.4, -31, 3, 0.8, 0.8);
    k.crate(-7, 0.4, -36, 3, 0.8, 0.8);
    k.crate(7, 0.4, -36, 3, 0.8, 0.8);
    k.sign(0, 3.9, -40.7); // EXIT sign over the waiting-room far doorway
    k.wheelchair(8, -26, 2);
    // sweeping spark-pole hazard crossing the (now much wider) room
    k.sweepingHazard(
      new THREE.Vector3(-9, 1.1, -31), new THREE.Vector3(9, 1.1, -31),
      new THREE.Vector3(0.5, 2.2, 0.5), 3.6, 0xff5030
    );

    // Corridor waiting → supply (z -41..-57), with a spill tile to skirt.
    // Off-center (not spanning the x=0 centerline even with the player-capsule
    // padding) so walking straight through the corridor is genuinely safe —
    // drifting right is what gets you.
    k.corridorZ(0, -41, -57, 4, 4);
    k.hazardTile(1.2, -49, 1.0, 3, 0xff7a1a);

    // Supply Room (NEW — spans z -71..-57): a crate "staircase" to climb
    k.room(0, -64, 16, 14, { doors: ['n', 's'], doorW: 4, light: 24 });
    k.crate(-4, 0.4, -60, 3, 0.8, 2);
    k.crate(-4, 1.0, -63, 3, 0.8, 2);
    k.crate(5, 0.5, -68, 3, 1, 3);
    k.hazardTile(-1, -67, 3, 2, 0xff7a1a);
    k.sign(0, 3.7, -70.7);

    // Corridor supply → foyer (z -71..-86)
    k.corridorZ(0, -71, -86, 4, 4);

    // Exit Foyer (spans z -98..-86)
    k.room(0, -92, 14, 12, { doors: ['n'], doorW: 4, light: 26 });
    k.exitDoor(0, 2.2, -97.7, false); // unlocked

    // Checkpoint lines (full-width — any x/height crossing counts)
    k.checkpointStrip(-21, 5); k.checkpointStrip(-41, 5);
    k.checkpointStrip(-57, 5); k.checkpointStrip(-86, 5);
  },

  update: (dt, elapsed, rm, playerPos) => kit?.update(dt, elapsed, rm, playerPos),
  hazardHit: (p) => kit?.hazardHit(p) ?? false,
  canExit: () => kit?.canExit() ?? true,
  objective: () => 'Reach the exit — don’t get caught',
  consumePickup: () => kit?.consumePickup() ?? false,
  destroy: () => { kit?.dispose(); kit = null; },
};
