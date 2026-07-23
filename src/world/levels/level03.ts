import * as THREE from 'three';
import { LevelConfig } from '../Level';
import { LevelKit } from '../kit';

// Ward A — three bed-bays separated by three timed sliding auto-doors, each
// offset in phase. ~105m span, 4 rooms + 3 corridors, widened from the
// original ~38m layout (BETTERMENT.md §3.3).
let kit: LevelKit | null = null;

export const level03: LevelConfig = {
  id: 'level03',
  name: 'Ward A',
  index: 3,
  spawnPosition: new THREE.Vector3(0, 1.4, 6),
  fallY: -8,

  checkpoints: [
    { pos: new THREE.Vector3(0, 1.4, -20), trigger: new THREE.Vector3(0, 1, -17) },
    { pos: new THREE.Vector3(0, 1.4, -38), trigger: new THREE.Vector3(0, 1, -35) },
    { pos: new THREE.Vector3(0, 1.4, -54), trigger: new THREE.Vector3(0, 1, -51) },
    { pos: new THREE.Vector3(0, 1.4, -70), trigger: new THREE.Vector3(0, 1, -67) },
    { pos: new THREE.Vector3(0, 1.4, -85), trigger: new THREE.Vector3(0, 1, -82) },
  ],
  winZone: { pos: new THREE.Vector3(0, 1.5, -94.7), radius: 3 },
  enemySpawn: new THREE.Vector3(0, 1.4, -59),
  patrol: [
    new THREE.Vector3(-5, 1.4, -59),
    new THREE.Vector3(5, 1.4, -55),
    new THREE.Vector3(0, 1.4, -74),
    new THREE.Vector3(0, 1.4, -89),
    new THREE.Vector3(5, 1.4, -63),
  ],

  build: (scene, world) => {
    kit = new LevelKit(scene, world);
    const k = kit;

    // Nurse station (spans z -1..9)
    k.room(0, 4, 14, 10, { doors: ['s'], doorW: 4, light: 32 });
    k.corridorZ(0, -1, -17, 4, 3.5);
    k.autoDoor(0, 1.9, -15, 4, 3.6, 0.3, new THREE.Vector3(4, 0, 0), 5, 0);

    // Bed bay 1 (spans z -35..-17)
    k.room(0, -26, 14, 18, { doors: ['n', 's'], doorW: 4, light: 30, flickerLight: true });
    k.crate(-5, 0.6, -21, 2.4, 1, 1);
    k.crate(5, 0.6, -31, 2.4, 1, 1);
    k.hazardTile(0, -26, 3, 3, 0xff7a1a);

    // Link + auto-door 2 (offset timing)
    k.corridorZ(0, -35, -51, 4, 3.5);
    k.autoDoor(0, 1.9, -49, 4, 3.6, 0.3, new THREE.Vector3(-4, 0, 0), 5, 0.5);

    // Bed bay 2 (spans z -67..-51)
    k.room(0, -59, 14, 16, { doors: ['n', 's'], doorW: 4, light: 28 });
    k.crate(-5, 0.6, -55, 2.4, 1, 1);
    k.crate(5, 0.6, -63, 2.4, 1, 1);
    k.hazardTile(-3, -63, 2.5, 2.5, 0xff7a1a);
    k.hazardTile(3, -55, 2.5, 2.5, 0xff7a1a);

    // Link + auto-door 3 (third phase offset)
    k.corridorZ(0, -67, -82, 4, 3.5);
    k.autoDoor(0, 1.9, -80, 4, 3.6, 0.3, new THREE.Vector3(4, 0, 0), 5, 0.25);

    // Bed bay 3 / Recovery Ward (NEW — spans z -96..-82)
    k.room(0, -89, 14, 14, { doors: ['n'], doorW: 4, light: 26 });
    k.crate(-4, 0.6, -86, 2.4, 1, 1);
    k.crate(4, 0.6, -92, 2.4, 1, 1);
    k.hazardTile(0, -89, 3, 3, 0xff7a1a);

    // Ward exit (south wall)
    k.exitDoor(0, 2.2, -95.7, false);
    k.sign(0, 3.7, -95.3);
    k.wheelchair(-5, -85, 0.6);

    k.checkpointStrip(-17, 5); k.checkpointStrip(-35, 5);
    k.checkpointStrip(-51, 5); k.checkpointStrip(-67, 5);
    k.checkpointStrip(-82, 5);
  },

  update: (dt, elapsed, rm, playerPos) => kit?.update(dt, elapsed, rm, playerPos),
  hazardHit: (p) => kit?.hazardHit(p) ?? false,
  canExit: () => kit?.canExit() ?? true,
  objective: () => 'Reach the ward exit — mind the doors',
  consumePickup: () => kit?.consumePickup() ?? false,
  destroy: () => { kit?.dispose(); kit = null; },
};
