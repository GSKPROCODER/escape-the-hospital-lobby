import { InputState } from '../core/Input';

/**
 * On-screen virtual joystick (move), drag-to-look zone, and JUMP/USE buttons.
 * Feeds the shared InputState so gameplay code stays device-agnostic.
 * Hidden unless activated (App enables it on touch devices during play).
 */
export class TouchControls {
  private rootEl: HTMLElement;
  private stickBase: HTMLElement;
  private stickKnob: HTMLElement;

  private moveId: number | null = null;
  private moveOrigin = { x: 0, y: 0 };
  private lookId: number | null = null;
  private lookLast = { x: 0, y: 0 };
  private readonly RADIUS = 55;

  constructor(private input: InputState) {
    this.rootEl = document.getElementById('touch-controls') ?? this.createRoot();

    const stickZone = div('touch-stick-zone');
    this.stickBase = div('touch-stick-base');
    this.stickKnob = div('touch-stick-knob');
    this.stickBase.append(this.stickKnob);
    stickZone.append(this.stickBase);

    const lookZone = div('touch-look-zone');

    const jumpBtn = div('touch-btn jump'); jumpBtn.textContent = 'JUMP';
    const useBtn = div('touch-btn interact'); useBtn.textContent = 'USE';

    this.rootEl.append(stickZone, lookZone, jumpBtn, useBtn);

    this.wireStick(stickZone);
    this.wireLook(lookZone);
    this.wireButton(jumpBtn, () => this.input.triggerJump());
    this.wireButton(useBtn, () => this.input.triggerInteract());
  }

  private createRoot(): HTMLElement {
    const r = document.createElement('div');
    r.id = 'touch-controls';
    document.body.append(r);
    return r;
  }

  setActive(active: boolean) {
    this.rootEl.classList.toggle('active', active);
    if (!active) this.resetStick();
  }

  private wireStick(zone: HTMLElement) {
    zone.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      this.moveId = t.identifier;
      this.moveOrigin = { x: t.clientX, y: t.clientY };
      this.stickBase.style.display = 'block';
      this.stickBase.style.left = `${t.clientX}px`;
      this.stickBase.style.top = `${t.clientY}px`;
      this.stickKnob.style.left = '50%';
      this.stickKnob.style.top = '50%';
      e.preventDefault();
    }, { passive: false });

    zone.addEventListener('touchmove', (e) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier !== this.moveId) continue;
        let dx = t.clientX - this.moveOrigin.x;
        let dy = t.clientY - this.moveOrigin.y;
        const len = Math.hypot(dx, dy);
        const clamped = Math.min(len, this.RADIUS);
        const ang = Math.atan2(dy, dx);
        const kx = Math.cos(ang) * clamped;
        const ky = Math.sin(ang) * clamped;
        this.stickKnob.style.left = `calc(50% + ${kx}px)`;
        this.stickKnob.style.top = `calc(50% + ${ky}px)`;
        // normalise to -1..1; forward (up) = -z
        const nx = (kx / this.RADIUS);
        const nz = (ky / this.RADIUS);
        this.input.setTouchMove(nx, nz);
      }
      e.preventDefault();
    }, { passive: false });

    const end = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === this.moveId) this.resetStick();
      }
    };
    zone.addEventListener('touchend', end);
    zone.addEventListener('touchcancel', end);
  }

  private resetStick() {
    this.moveId = null;
    this.input.setTouchMove(0, 0);
    this.stickBase.style.display = 'none';
  }

  private wireLook(zone: HTMLElement) {
    zone.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0];
      this.lookId = t.identifier;
      this.lookLast = { x: t.clientX, y: t.clientY };
      e.preventDefault();
    }, { passive: false });

    zone.addEventListener('touchmove', (e) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier !== this.lookId) continue;
        const dx = t.clientX - this.lookLast.x;
        const dy = t.clientY - this.lookLast.y;
        this.lookLast = { x: t.clientX, y: t.clientY };
        this.input.addTouchLook(dx * 1.1, dy * 1.1);
      }
      e.preventDefault();
    }, { passive: false });

    const end = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === this.lookId) this.lookId = null;
      }
    };
    zone.addEventListener('touchend', end);
    zone.addEventListener('touchcancel', end);
  }

  private wireButton(btn: HTMLElement, action: () => void) {
    btn.addEventListener('touchstart', (e) => { action(); e.preventDefault(); }, { passive: false });
  }
}

function div(cls: string): HTMLElement {
  const d = document.createElement('div');
  d.className = cls;
  return d;
}
