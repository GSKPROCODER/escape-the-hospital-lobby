export class Loop {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private fixedTimeStep: number = 1 / 60; // 60Hz physics

  constructor(
    private updateFn: (dt: number) => void,
    private renderFn: (alpha: number) => void
  ) {}

  public start() {
    this.lastTime = performance.now();
    requestAnimationFrame(this.tick);
  }

  private tick = (time: number) => {
    // Convert to seconds
    const currentTime = time / 1000;
    let frameTime = currentTime - (this.lastTime / 1000);
    this.lastTime = time;

    // Cap frame time to avoid spiral of death on long pauses
    if (frameTime > 0.25) {
      frameTime = 0.25;
    }

    this.accumulator += frameTime;

    while (this.accumulator >= this.fixedTimeStep) {
      this.updateFn(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    // Alpha for rendering interpolation
    const alpha = this.accumulator / this.fixedTimeStep;
    this.renderFn(alpha);

    requestAnimationFrame(this.tick);
  };
}
