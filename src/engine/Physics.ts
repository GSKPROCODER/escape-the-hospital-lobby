import RAPIER from '@dimforge/rapier3d-compat';

export class Physics {
  public world!: RAPIER.World;

  public async init() {
    await RAPIER.init();
    const gravity = { x: 0.0, y: -9.81 * 2, z: 0.0 }; // Extra gravity for snappy jumps
    this.world = new RAPIER.World(gravity);
  }

  public step(dt: number) {
    this.world.timestep = dt;
    this.world.step();
  }
}
