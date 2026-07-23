import * as THREE from 'three';
import { LevelConfig } from '../Level';
import { LevelKit } from '../kit';

// Records Room — find the keycard hidden on a shelf, then reach the locked
// archive exit. Filing-cabinet aisles give the hunter cover to stalk you.
let kit: LevelKit | null = null;

export const level02: LevelConfig = {
  id: 'level02',
  name: 'Records Room',
  index: 2,
  spawnPosition: new THREE.Vector3(0, 1.4, 6),
  fallY: -8,

  checkpoints: [
    { pos: new THREE.Vector3(0, 1.4, -4), trigger: new THREE.Vector3(0, 1, -3), radius: 3 },
    { pos: new THREE.Vector3(0, 1.4, -12), trigger: new THREE.Vector3(0, 1, -12), radius: 3.5 },
  ],
  winZone: { pos: new THREE.Vector3(0, 1.5, -21), radius: 3 },
  enemySpawn: new THREE.Vector3(-6, 1.4, -17),
  patrol: [
    new THREE.Vector3(-6, 1.4, -10),
    new THREE.Vector3(6, 1.4, -12),
    new THREE.Vector3(-6, 1.4, -17),
    new THREE.Vector3(6, 1.4, -17),
  ],

  build: (scene, world) => {
    kit = new LevelKit(scene, world);
    const k = kit;

    // Entry foyer (z 0..8) → short link → records room
    k.room(0, 4, 10, 8, { doors: ['s'], doorW: 4, light: 28 });
    k.corridorZ(0, -2, 0, 4, 4);

    // Records room (z -22..-2)
    k.room(0, -12, 20, 20, { doors: ['n'], doorW: 4, light: 34, flickerLight: true });
    k.light(-6, 4.2, -16, 0xdfeee6, 22, 16, false); // fill for the aisles
    k.light(6, 4.2, -8, 0xdfeee6, 22, 16, false);

    // Filing-cabinet aisles (tall solids with gaps to weave through)
    const cab = (x: number, z: number) => k.crate(x, 1, z, 1.4, 2, 3);
    for (const z of [-7, -12, -17]) {
      cab(-6, z); cab(-2, z); cab(2, z); cab(6, z);
    }

    // Shelf + keycard (climb the shelf to reach it)
    k.crate(8.2, 1, -16, 1.6, 2, 2);           // shelf against the east wall
    k.keycardAt(8.2, 2.4, -16);

    // A spill hazard near the exit approach
    k.hazardTile(-1.5, -19, 3, 2, 0xff7a1a);

    // Locked archive exit (south wall)
    k.exitDoor(0, 2.2, -21.8, true);
    k.sign(0, 3.7, -21.4);
    k.wheelchair(-8, -4, 1);

    k.checkpointPad(0, -3); k.checkpointPad(0, -12);
  },

  update: (dt, elapsed, rm, playerPos) => kit?.update(dt, elapsed, rm, playerPos),
  hazardHit: (p) => kit?.hazardHit(p) ?? false,
  canExit: () => kit?.canExit() ?? true,
  objective: () => (kit && !kit.canExit()) ? 'Find the keycard to unlock the exit' : 'Reach the archive exit — don’t get caught',
  consumePickup: () => kit?.consumePickup() ?? false,
  destroy: () => { kit?.dispose(); kit = null; },
};
