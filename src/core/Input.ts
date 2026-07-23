/**
 * Unified input for desktop (keyboard + drag-to-look mouse) and touch
 * (virtual joystick + drag look, fed in by TouchControls). Gameplay code only
 * reads this object, so it never needs to know the device.
 *
 * Desktop look uses hold-left-mouse + drag (NO pointer lock) — this avoids
 * cursor capture, browser find-bar key leaks and surprise auto-pauses.
 */
export class InputState {
  move: { x: number; z: number } = { x: 0, z: 0 };
  lookDelta: { x: number; y: number } = { x: 0, y: 0 };

  jumpHeld = false;
  jumpPressed = false;
  interactPressed = false;
  sprint = false;
  pausePressed = false;

  enabled = false;

  private sensitivity = 1.0;
  private invertY = false;
  private readonly BASE_LOOK = 0.006;      // drag look scale
  private readonly KEY_TURN = 1.9;         // rad/s for Q/E turn

  private keys: Record<string, boolean> = {};
  private keyboardMove = { x: 0, z: 0 };
  private keyboardTurn = 0;                 // -1 (Q) .. +1 (E)
  private touchMove = { x: 0, z: 0 };
  private jumpReleaseTimer: number | null = null;

  // Keys we handle — always prevent their browser defaults while enabled.
  private readonly HANDLED = new Set([
    'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyF', 'KeyP',
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'Space', 'ShiftLeft', 'ShiftRight',
  ]);

  constructor(private container: HTMLElement) {
    this.setupKeyboard();
    this.setupMouse();
  }

  setSensitivity(mult: number) { this.sensitivity = mult; }
  setInvertY(v: boolean) { this.invertY = v; }

  // ---------- Keyboard ----------
  private setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyP') this.pausePressed = true;
      if (!this.enabled) return;
      if (this.HANDLED.has(e.code)) e.preventDefault();
      if (!this.keys[e.code]) this.onKeyEdge(e.code, true);
      this.keys[e.code] = true;
      this.recomputeKeyboardMove();
    });
    window.addEventListener('keyup', (e) => {
      if (this.enabled && this.HANDLED.has(e.code)) e.preventDefault();
      this.keys[e.code] = false;
      this.onKeyEdge(e.code, false);
      this.recomputeKeyboardMove();
    });
  }

  private onKeyEdge(code: string, down: boolean) {
    switch (code) {
      case 'Space':
        this.jumpHeld = down;
        if (down) this.jumpPressed = true;
        break;
      case 'KeyF':
        if (down) this.interactPressed = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.sprint = down;
        break;
    }
  }

  private recomputeKeyboardMove() {
    let x = 0, z = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) z -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) z += 1;
    if (this.keys['KeyA']) x -= 1;
    if (this.keys['KeyD']) x += 1;
    const len = Math.hypot(x, z);
    if (len > 0) { x /= len; z /= len; }
    this.keyboardMove = { x, z };
    // ArrowLeft/Right turn the camera (WASD strafes, arrows also turn as a fallback)
    this.keyboardTurn = (this.keys['KeyE'] || this.keys['ArrowRight'] ? 1 : 0)
                      - (this.keys['KeyQ'] || this.keys['ArrowLeft'] ? 1 : 0);
  }

  // ---------- Mouse (automatic free-look) ----------
  private setupMouse() {
    // Camera follows mouse movement automatically — no button to hold.
    // Works whether or not pointer lock engaged (movementX/Y are deltas either way).
    window.addEventListener('mousemove', (e) => {
      if (!this.enabled) return;
      this.lookDelta.x -= e.movementX * this.BASE_LOOK * this.sensitivity;
      const dy = e.movementY * this.BASE_LOOK * this.sensitivity;
      this.lookDelta.y -= this.invertY ? -dy : dy;
    });
    // Click the scene to (re)capture the pointer for hidden-cursor free-look.
    this.container.addEventListener('mousedown', () => {
      if (this.enabled) this.requestPointerLock();
    });
    // Never show the browser context menu over the game canvas.
    this.container.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // ---------- Pointer lock (optional; free-look still works without it) ----------
  requestPointerLock() {
    if (document.pointerLockElement !== this.container) {
      const p = this.container.requestPointerLock?.() as unknown as Promise<void> | undefined;
      if (p && typeof p.catch === 'function') p.catch(() => { /* cooldown/denied — free-look still works */ });
    }
  }
  exitPointerLock() {
    if (document.pointerLockElement === this.container) document.exitPointerLock?.();
  }
  get hasPointerLock() { return document.pointerLockElement === this.container; }

  // ---------- Touch (called by TouchControls) ----------
  setTouchMove(x: number, z: number) { this.touchMove = { x, z }; }
  addTouchLook(dx: number, dy: number) {
    this.lookDelta.x -= dx * this.BASE_LOOK * this.sensitivity;
    const ddy = dy * this.BASE_LOOK * this.sensitivity;
    this.lookDelta.y -= this.invertY ? -ddy : ddy;
  }
  triggerJump() {
    this.jumpHeld = true;
    this.jumpPressed = true;
    if (this.jumpReleaseTimer !== null) clearTimeout(this.jumpReleaseTimer);
    this.jumpReleaseTimer = window.setTimeout(() => { this.jumpHeld = false; }, 140);
  }
  triggerInteract() { this.interactPressed = true; }

  /** Merge active move sources and fold keyboard camera-turn into lookDelta. */
  tick(dt: number) {
    const tLen = Math.hypot(this.touchMove.x, this.touchMove.z);
    this.move = tLen > 0.001 ? { ...this.touchMove } : { ...this.keyboardMove };
    if (this.keyboardTurn !== 0) this.lookDelta.x -= this.keyboardTurn * this.KEY_TURN * dt;
  }

  resetPerFrame() {
    this.lookDelta.x = 0;
    this.lookDelta.y = 0;
    this.jumpPressed = false;
    this.interactPressed = false;
    this.pausePressed = false;
  }

  clear() {
    this.keys = {};
    this.keyboardMove = { x: 0, z: 0 };
    this.keyboardTurn = 0;
    this.touchMove = { x: 0, z: 0 };
    this.move = { x: 0, z: 0 };
    this.jumpHeld = false;
    this.sprint = false;
  }
}
