import * as THREE from 'three';
import { LevelConfig } from '../Level';
import { LevelKit } from '../kit';

// Ward A — two bed-bays separated by timed sliding auto-doors. Cross while
// they're open, dodge spilled-chemical hazard tiles, reach the ward exit.
let kit: LevelKit | null = null;

export const level03: LevelConfig = {
  id: 'level03',
  name: 'Ward A',
  index: 3,
  spawnPosition: new THREE.Vector3(0, 1.4, 6),
  fallY: -8,

  checkpoints: [
    { pos: new THREE.Vector3(0, 1.4, -4), trigger: new THREE.Vector3(0, 1, -4) },
    { pos: new THREE.Vector3(0, 1.4, -16), trigger: new THREE.Vector3(0, 1, -17) },
  ],
  winZone: { pos: new THREE.Vector3(0, 1.5, -29), radius: 3 },
  enemySpawn: new THREE.Vector3(0, 1.4, -24),
  patrol: [
    new THREE.Vector3(-4, 1.4, -24),
    new THREE.Vector3(4, 1.4, -22),
    new THREE.Vector3(0, 1.4, -9),
  ],

  build: (scene, world) => {
    kit = new LevelKit(scene, world);
    const k = kit;

    // Nurse station (z 0..8)
    k.room(0, 4, 12, 8, { doors: ['s'], doorW: 4, light: 30 });
    k.corridorZ(0, -2, 0, 4, 3.5);
    // auto-door 1 in the doorway
    k.autoDoor(0, 1.9, -1, 4, 3.6, 0.3, new THREE.Vector3(4, 0, 0), 4.5, 0);

    // Bed bay 1 (z -16..-2)
    k.room(0, -9, 14, 14, { doors: ['n', 's'], doorW: 4, light: 28, flickerLight: true });
    k.crate(-4.5, 0.6, -7, 2.4, 1, 1); // bed
    k.crate(4.5, 0.6, -11, 2.4, 1, 1);
    k.hazardTile(0, -9, 3, 3, 0xff7a1a); // central spill

    // Link + auto-door 2 (offset timing)
    k.corridorZ(0, -18, -16, 4, 3.5);
    k.autoDoor(0, 1.9, -17, 4, 3.6, 0.3, new THREE.Vector3(-4, 0, 0), 4.5, 0.5);

    // Bed bay 2 (z -30..-18)
    k.room(0, -24, 14, 12, { doors: ['n'], doorW: 4, light: 26 });
    k.crate(-4.5, 0.6, -22, 2.4, 1, 1);
    k.crate(4.5, 0.6, -26, 2.4, 1, 1);
    k.hazardTile(-3, -26, 2.5, 2.5, 0xff7a1a);
    k.hazardTile(3, -22, 2.5, 2.5, 0xff7a1a);

    // Ward exit (south wall)
    k.exitDoor(0, 2.2, -29.8, false);
    k.sign(0, 3.7, -29.4);
    k.wheelchair(-5, -12, 0.6);

    k.checkpointStrip(-4, 12); k.checkpointStrip(-17, 4);
  },

  update: (dt, elapsed, rm, playerPos) => kit?.update(dt, elapsed, rm, playerPos),
  hazardHit: (p) => kit?.hazardHit(p) ?? false,
  canExit: () => kit?.canExit() ?? true,
  objective: () => 'Reach the ward exit — mind the doors',
  consumePickup: () => kit?.consumePickup() ?? false,
  destroy: () => { kit?.dispose(); kit = null; },
};
