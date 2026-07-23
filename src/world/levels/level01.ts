import * as THREE from 'three';
import { LevelConfig } from '../Level';
import { LevelKit } from '../kit';

// Reception Wing — Lobby → corridor → Waiting Room → corridor → Exit Foyer.
// Continuous floors throughout so the hunter never meets a pit. Progression
// runs toward -z. Challenge: climb-over furniture, a sweeping spark hazard,
// and a spill tile — all on solid ground.
let kit: LevelKit | null = null;

export const level01: LevelConfig = {
  id: 'level01',
  name: 'Reception Wing',
  index: 1,
  spawnPosition: new THREE.Vector3(0, 1.4, 6),
  fallY: -8,

  checkpoints: [
    { pos: new THREE.Vector3(0, 1.4, -6), trigger: new THREE.Vector3(0, 1, -6) },
    { pos: new THREE.Vector3(0, 1.4, -20), trigger: new THREE.Vector3(0, 1, -18) },
    { pos: new THREE.Vector3(0, 1.4, -35), trigger: new THREE.Vector3(0, 1, -35) },
  ],
  winZone: { pos: new THREE.Vector3(0, 1.5, -43.5), radius: 3 },
  enemySpawn: new THREE.Vector3(0, 1.4, -20),
  patrol: [
    new THREE.Vector3(0, 1.4, -20),
    new THREE.Vector3(-4, 1.4, -22),
    new THREE.Vector3(0, 1.4, -30),
    new THREE.Vector3(4, 1.4, -22),
  ],

  build: (scene, world) => {
    kit = new LevelKit(scene, world);
    const k = kit;

    // Lobby (spans z -4..10)
    k.room(0, 3, 16, 14, { doors: ['s'], doorW: 4, light: 34 });
    // reception desk (climb-over) to the side
    k.crate(4.5, 0.55, 2, 4, 1.1, 1.2);
    k.deco(k.mat.metal, new THREE.BoxGeometry(4.2, 0.1, 1.4), 4.5, 1.15, 2);
    k.wheelchair(-5, 0, 0.6);
    k.sign(0, 3.9, -3.7); // EXIT sign over the lobby doorway

    // Corridor lobby → waiting room (z -14..-4)
    k.corridorZ(0, -4, -14, 4, 4);

    // Waiting Room (z -26..-14)
    k.room(0, -20, 14, 12, { doors: ['n', 's'], doorW: 4, light: 28, flickerLight: true });
    // rows of seats to climb over
    k.crate(-4, 0.4, -18, 3, 0.8, 0.8);
    k.crate(4, 0.4, -18, 3, 0.8, 0.8);
    k.crate(-4, 0.4, -22, 3, 0.8, 0.8);
    k.crate(4, 0.4, -22, 3, 0.8, 0.8);
    k.sign(0, 3.9, -25.7); // EXIT sign over the waiting-room far doorway
    k.wheelchair(5, -16, 2);
    // sweeping spark-pole hazard crossing the room
    k.sweepingHazard(
      new THREE.Vector3(-5, 1.1, -20), new THREE.Vector3(5, 1.1, -20),
      new THREE.Vector3(0.5, 2.2, 0.5), 3.2, 0xff5030
    );

    // Corridor waiting → foyer (z -35..-26), with a spill tile to skirt
    k.corridorZ(0, -26, -35, 4, 4);
    k.hazardTile(1, -30, 2, 3, 0xff7a1a); // covers x 0..2 → pass on the left

    // Exit Foyer (z -45..-35)
    k.room(0, -40, 12, 10, { doors: ['n'], doorW: 4, light: 26 });
    k.exitDoor(0, 2.2, -44.7, false); // unlocked

    // Checkpoint lines (full-width — any x/height crossing counts)
    k.checkpointStrip(-6, 4); k.checkpointStrip(-18, 14); k.checkpointStrip(-35, 4);
  },

  update: (dt, elapsed, rm, playerPos) => kit?.update(dt, elapsed, rm, playerPos),
  hazardHit: (p) => kit?.hazardHit(p) ?? false,
  canExit: () => kit?.canExit() ?? true,
  objective: () => 'Reach the exit — don’t get caught',
  consumePickup: () => kit?.consumePickup() ?? false,
  destroy: () => { kit?.dispose(); kit = null; },
};
