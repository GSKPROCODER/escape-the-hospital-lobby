import * as THREE from 'three';
import { LevelConfig } from '../Level';
import { LevelKit } from '../kit';

// Records Room — find the keycard hidden deep in a filing-cabinet maze, then
// reach the locked archive exit through its own room. ~96m span, 3 rooms +
// 2 corridors, widened from the original ~30m layout (BETTERMENT.md §3.3).
let kit: LevelKit | null = null;

export const level02: LevelConfig = {
  id: 'level02',
  name: 'Records Room',
  index: 2,
  spawnPosition: new THREE.Vector3(0, 1.4, 6),
  fallY: -8,

  checkpoints: [
    { pos: new THREE.Vector3(0, 1.4, -20), trigger: new THREE.Vector3(0, 1, -17) },
    { pos: new THREE.Vector3(0, 1.4, -36), trigger: new THREE.Vector3(0, 1, -34) },
    { pos: new THREE.Vector3(0, 1.4, -54), trigger: new THREE.Vector3(0, 1, -51) },
    { pos: new THREE.Vector3(0, 1.4, -69), trigger: new THREE.Vector3(0, 1, -66) },
  ],
  winZone: { pos: new THREE.Vector3(0, 1.5, -77), radius: 3 },
  enemySpawn: new THREE.Vector3(-8, 1.4, -27),
  patrol: [
    new THREE.Vector3(-8, 1.4, -22),
    new THREE.Vector3(8, 1.4, -27),
    new THREE.Vector3(-8, 1.4, -32),
    new THREE.Vector3(8, 1.4, -37),
    new THREE.Vector3(-8, 1.4, -42),
  ],

  build: (scene, world) => {
    kit = new LevelKit(scene, world);
    const k = kit;

    // Entry foyer (spans z -1..9) → corridor → records room
    k.room(0, 4, 12, 10, { doors: ['s'], doorW: 4, light: 28 });
    k.corridorZ(0, -1, -17, 4, 4);

    // Records room (spans z -51..-17) — enlarged from the original 20x20
    k.room(0, -34, 26, 34, { doors: ['n', 's'], doorW: 4, light: 34, flickerLight: true });
    k.light(-9, 4.2, -37, 0xdfeee6, 22, 18, false);
    k.light(9, 4.2, -22, 0xdfeee6, 22, 18, false);
    k.light(0, 4.2, -44, 0xdfeee6, 20, 18, false);

    // Filing-cabinet aisles (5 rows × 4 columns — a real maze)
    const cab = (x: number, z: number) => k.crate(x, 1, z, 1.4, 2, 3);
    for (const z of [-22, -27, -32, -37, -42]) {
      cab(-9, z); cab(-4, z); cab(4, z); cab(9, z);
    }

    // Shelf + keycard, deep in the maze (climb the shelf to reach it)
    k.crate(11.2, 1, -37, 1.6, 2, 2);
    k.keycardAt(11.2, 2.4, -37);

    // A spill hazard near the records room's own exit
    k.hazardTile(-2, -48, 3, 2, 0xff7a1a);
    k.sign(0, 3.9, -50.7);

    // Corridor records → archive (z -51..-66)
    k.corridorZ(0, -51, -66, 4, 4);

    // Archive Exit room (NEW — spans z -78..-66)
    k.room(0, -72, 14, 12, { doors: ['n'], doorW: 4, light: 26 });
    k.exitDoor(0, 2.2, -77.7, true); // locked
    k.sign(0, 3.7, -77.3);
    k.wheelchair(-5, -69, 1);

    k.checkpointStrip(-17, 5); k.checkpointStrip(-34, 24);
    k.checkpointStrip(-51, 5); k.checkpointStrip(-66, 5);
  },

  update: (dt, elapsed, rm, playerPos) => kit?.update(dt, elapsed, rm, playerPos),
  hazardHit: (p) => kit?.hazardHit(p) ?? false,
  canExit: () => kit?.canExit() ?? true,
  objective: () => (kit && !kit.canExit()) ? 'Find the keycard to unlock the exit' : 'Reach the archive exit — don’t get caught',
  consumePickup: () => kit?.consumePickup() ?? false,
  destroy: () => { kit?.dispose(); kit = null; },
};
