import { GameSettings, Quality, CameraMode } from '../core/Settings';
import { DifficultyId, DIFFICULTIES } from '../core/Difficulty';
import { TOTAL_LEVELS, LEVEL_NAMES, isBuilt } from '../world/levels';

export interface UIHooks {
  onPlay(): void;
  onLevels(): void;
  onPlayLevel(index1: number): void;
  onStartRun(id: DifficultyId): void;
  onResume(): void;
  onRestart(): void;
  onQuitToMenu(): void;
  onPause(): void;
  onRetry(): void;
  onWinContinue(): void;
  getSettings(): GameSettings;
  getDifficulty(): DifficultyId;
  getUnlocked(): number;
  getBest(levelId: string): number | undefined;
  onSettingsChange(s: GameSettings): void;
  sound(kind: 'hover' | 'click'): void;
}

type El = HTMLElement;

/** Small DOM helper. */
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, attrs: Record<string, string> = {}, children: (Node | string)[] = []
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(typeof c === 'string' ? document.createTextNode(c) : c);
  return node;
}

/**
 * Renders all HTML screens into #ui-layer and the HUD. Simulation state is
 * owned by App; this only builds DOM and reports interactions via hooks.
 */
export class UI {
  private root: El;
  private timerEl: El | null = null;
  private livesEl: El | null = null;
  private dangerEl: El | null = null;
  private objectiveEl: El | null = null;
  private pauseStats: { levelIndex: number; levelName: string; time: string; deaths: number; lives: number; difficulty: string } | null = null;

  constructor(private hooks: UIHooks) {
    const root = document.getElementById('ui-layer');
    if (!root) throw new Error('#ui-layer missing');
    this.root = root;
  }

  private clear() {
    this.root.replaceChildren();
    this.timerEl = this.livesEl = this.dangerEl = this.objectiveEl = null;
  }

  private button(label: string, cls: string, onClick: () => void): HTMLButtonElement {
    const b = el('button', { class: `btn ${cls}` }, [label]);
    b.addEventListener('mouseenter', () => this.hooks.sound('hover'));
    b.addEventListener('click', () => { this.hooks.sound('click'); onClick(); });
    return b;
  }

  // ---------------- Main menu ----------------
  showMenu() {
    this.clear();
    const brand = el('div', { class: 'brand' }, [
      el('div', { class: 'kicker' }, ['⚠ Quarantine Zone · No Exit']),
      el('h1', {}, [
        document.createTextNode('ESCAPE THE '),
        el('span', { class: 'glow' }, ['HOSPITAL']),
      ]),
      el('div', { class: 'tag' }, ['A 15-Level Horror Lobby']),
    ]);

    const col = el('div', { class: 'btn-col' }, []);
    col.append(
      this.button('Play', 'primary', () => this.hooks.onPlay()),
      this.button('Levels', '', () => this.hooks.onLevels()),
      this.button('Settings', '', () => this.showSettings(() => this.showMenu())),
      this.button('About', '', () => this.showAbout(() => this.showMenu())),
    );

    const screen = el('div', { class: 'screen' }, [brand, col,
      el('div', { class: 'footer-note' }, ['v0.1 · Vertical Slice — Reception Wing']),
    ]);
    this.root.append(screen);
  }

  // ---------------- Difficulty select ----------------
  showDifficulty() {
    this.clear();
    const current = this.hooks.getDifficulty();
    const panel = el('div', { class: 'panel' }, [
      el('h2', {}, ['Choose Your Fate']),
      el('div', { class: 'subtitle' }, ['How relentless should the Presence be?']),
    ]);

    const ids: DifficultyId[] = ['easy', 'normal', 'nightmare'];
    const cards = el('div', { class: 'diff-cards' }, []);
    for (const id of ids) {
      const d = DIFFICULTIES[id];
      const card = el('button', { class: `diff-card ${id === current ? 'suggested' : ''}` }, [
        el('div', { class: 'diff-name' }, [d.label]),
        el('div', { class: 'diff-lives' }, [d.lives < 0 ? '∞ lives' : `${d.lives} lives`]),
        el('div', { class: 'diff-blurb' }, [d.blurb]),
      ]);
      card.addEventListener('mouseenter', () => this.hooks.sound('hover'));
      card.addEventListener('click', () => { this.hooks.sound('click'); this.hooks.onStartRun(id); });
      cards.append(card);
    }
    panel.append(cards);

    const actions = el('div', { class: 'panel-actions' }, []);
    actions.append(this.button('Back', '', () => this.showMenu()));
    panel.append(actions);
    this.root.append(el('div', { class: 'screen dim' }, [panel]));
  }

  // ---------------- Level select ----------------
  showLevelSelect() {
    this.clear();
    const unlocked = this.hooks.getUnlocked();
    const panel = el('div', { class: 'panel wide' }, [
      el('h2', {}, ['Select a Wing']),
      el('div', { class: 'subtitle' }, ['15 wings stand between you and escape']),
    ]);
    const grid = el('div', { class: 'level-grid' }, []);
    for (let i = 1; i <= TOTAL_LEVELS; i++) {
      const built = isBuilt(i);
      const open = i <= unlocked;
      const playable = built && open;
      const state = playable ? 'playable' : (built ? 'locked' : 'soon');
      const id = `level${String(i).padStart(2, '0')}`;
      const best = this.hooks.getBest(id);
      const tile = el('button', { class: `level-tile ${state}` }, [
        el('div', { class: 'lt-num' }, [String(i)]),
        el('div', { class: 'lt-name' }, [LEVEL_NAMES[i - 1]]),
        el('div', { class: 'lt-meta' }, [
          playable ? (best !== undefined ? `Best ${fmt(best)}` : 'Play')
                   : (built ? '🔒 Locked' : 'Soon'),
        ]),
      ]);
      if (playable) {
        tile.addEventListener('mouseenter', () => this.hooks.sound('hover'));
        tile.addEventListener('click', () => { this.hooks.sound('click'); this.hooks.onPlayLevel(i); });
      } else {
        tile.setAttribute('disabled', 'true');
      }
      grid.append(tile);
    }
    panel.append(grid);
    const actions = el('div', { class: 'panel-actions' }, []);
    actions.append(this.button('Back', '', () => this.showMenu()));
    panel.append(actions);
    this.root.append(el('div', { class: 'screen dim' }, [panel]));
  }

  // ---------------- Win / Fail ----------------
  showWin(timeStr: string, deaths: number, hasNext: boolean) {
    this.clear();
    const panel = el('div', { class: 'panel center' }, [
      el('div', { class: 'kicker' }, ['✔ Wing Cleared']),
      el('h2', {}, ['You Escaped']),
      el('div', { class: 'subtitle' }, ['Reception Wing']),
      el('div', { class: 'result-grid' }, [
        el('div', { class: 'r-label' }, ['Time']), el('div', { class: 'r-value' }, [timeStr]),
        el('div', { class: 'r-label' }, ['Deaths']), el('div', { class: 'r-value' }, [String(deaths)]),
      ]),
      el('p', {}, [hasNext ? 'The next wing awaits — deeper into the dark.' : 'That is the last built wing for now — more are on the way.']),
    ]);
    const col = el('div', { class: 'btn-col' }, []);
    col.append(this.button(hasNext ? 'Next Wing' : 'Continue', 'primary', () => this.hooks.onWinContinue()));
    panel.append(col);
    this.root.append(el('div', { class: 'screen dim' }, [panel]));
  }

  showFail() {
    this.clear();
    const panel = el('div', { class: 'panel center' }, [
      el('div', { class: 'kicker danger-text' }, ['✖ Caught']),
      el('h2', {}, ['It Got You']),
      el('div', { class: 'subtitle' }, ['Out of lives']),
      el('p', {}, ['The Presence dragged you back into the dark. Try again?']),
    ]);
    const col = el('div', { class: 'btn-col' }, []);
    col.append(
      this.button('Retry', 'primary', () => this.hooks.onRetry()),
      this.button('Quit to Menu', 'danger', () => this.hooks.onQuitToMenu()),
    );
    panel.append(col);
    this.root.append(el('div', { class: 'screen dim' }, [panel]));
  }

  // ---------------- Settings ----------------
  showSettings(onBack: () => void) {
    this.clear();
    const s: GameSettings = this.hooks.getSettings();
    const commit = () => this.hooks.onSettingsChange(s);

    const panel = el('div', { class: 'panel' }, [
      el('h2', {}, ['Settings']),
      el('div', { class: 'subtitle' }, ['Changes apply and save instantly']),
    ]);

    panel.append(el('div', { class: 'section-label' }, ['Audio']));
    panel.append(this.slider('Master Volume', 0, 100, Math.round(s.masterVolume * 100), '%', v => { s.masterVolume = v / 100; commit(); }));
    panel.append(this.slider('Music', 0, 100, Math.round(s.musicVolume * 100), '%', v => { s.musicVolume = v / 100; commit(); }));
    panel.append(this.slider('Sound Effects', 0, 100, Math.round(s.sfxVolume * 100), '%', v => { s.sfxVolume = v / 100; commit(); }));

    panel.append(el('div', { class: 'section-label' }, ['Controls']));
    panel.append(this.slider('Look Sensitivity', 40, 200, Math.round(s.lookSensitivity * 100), '%', v => { s.lookSensitivity = v / 100; commit(); }));
    panel.append(this.toggleRow('Invert Vertical Look', s.invertY, v => { s.invertY = v; commit(); }));

    panel.append(el('div', { class: 'section-label' }, ['Graphics & Display']));
    const fsRow = el('div', { class: 'row' }, [
      el('label', {}, ['Fullscreen']),
      this.button('Toggle', '', () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      })
    ]);
    panel.append(fsRow);
    panel.append(this.segmentedRow<Quality>('Quality', ['low', 'medium', 'high'], s.quality,
      ['Low', 'Medium', 'High'], v => { s.quality = v; commit(); }));

    panel.append(el('div', { class: 'section-label' }, ['Camera & Accessibility']));
    panel.append(this.segmentedRow<CameraMode>('View', ['third', 'first'], s.cameraMode,
      ['Third-Person', 'First-Person'], v => { s.cameraMode = v; commit(); }));
    panel.append(this.toggleRow('Reduced Motion', s.reducedMotion, v => { s.reducedMotion = v; commit(); }));

    const actions = el('div', { class: 'panel-actions' }, []);
    actions.append(this.button('Back', 'primary', onBack));
    panel.append(actions);

    this.root.append(el('div', { class: 'screen dim' }, [panel]));
  }

  // ---------------- About ----------------
  showAbout(onBack: () => void) {
    this.clear();
    const panel = el('div', { class: 'panel' }, [
      el('h2', {}, ['About']),
      el('div', { class: 'subtitle' }, ['Escape the Hospital Lobby']),
      el('p', {}, ['You wake trapped inside an abandoned hospital. Fifteen wings stand between you and the dawn — each a gauntlet of jumps, hazards, and puzzles. Reach the doors and escape.']),
    ]);

    panel.append(el('div', { class: 'section-label' }, ['Keyboard & Mouse']));
    const kb = el('div', { class: 'keys-grid' }, []);
    const kbRows: [string, string][] = [
      ['W A S D', 'Move'],
      ['Mouse', 'Look around (free)'],
      ['Q / E', 'Turn camera'],
      ['Space', 'Jump'],
      ['Shift', 'Sprint'],
      ['F', 'Interact'],
      ['Esc / P', 'Pause'],
    ];
    for (const [k, d] of kbRows) { kb.append(el('div', { class: 'k' }, [k]), el('div', { class: 'd' }, [d])); }
    panel.append(kb);

    panel.append(el('div', { class: 'section-label' }, ['Touch']));
    const tc = el('div', { class: 'keys-grid' }, []);
    const tcRows: [string, string][] = [
      ['Left stick', 'Move'],
      ['Right drag', 'Look around'],
      ['JUMP', 'Jump'],
      ['USE', 'Interact'],
      ['⏸', 'Pause'],
    ];
    for (const [k, d] of tcRows) { tc.append(el('div', { class: 'k' }, [k]), el('div', { class: 'd' }, [d])); }
    panel.append(tc);

    panel.append(el('div', { class: 'section-label' }, ['Credits']));
    panel.append(el('div', { class: 'credits' }, [
      'Built with TypeScript · Three.js · Rapier (physics) · Vite.',
      el('br', {}, []),
      'Procedural character, environment, audio & UI — no external assets.',
      el('br', {}, []),
      'A cross-platform web game. © 2026.',
    ]));

    const actions = el('div', { class: 'panel-actions' }, []);
    actions.append(this.button('Back', 'primary', onBack));
    panel.append(actions);

    this.root.append(el('div', { class: 'screen dim' }, [panel]));
  }

  // ---------------- Pause ----------------
  showPause(stats: { levelIndex: number; levelName: string; time: string; deaths: number; lives: number; difficulty: string }) {
    this.clear();
    this.pauseStats = stats;
    const panel = el('div', { class: 'panel center' }, [
      el('div', { class: 'kicker' }, ['⏸ Paused']),
      el('h2', {}, [stats.levelName]),
      el('div', { class: 'subtitle' }, [`Level ${stats.levelIndex} · ${stats.difficulty}`]),
      el('div', { class: 'stat-strip' }, [
        stat('Time', stats.time),
        stat('Deaths', String(stats.deaths)),
        stat('Lives', stats.lives < 0 ? '∞' : String(stats.lives)),
      ]),
    ]);
    const col = el('div', { class: 'btn-col' }, []);
    col.append(
      this.button('Resume', 'primary', () => this.hooks.onResume()),
      this.button('Restart Wing', '', () => this.hooks.onRestart()),
      this.button('Settings', '', () => this.showSettings(() => this.showPause(this.pauseStats!))),
      this.button('Quit to Menu', 'danger', () => this.hooks.onQuitToMenu()),
    );
    panel.append(col);
    this.root.append(el('div', { class: 'screen dim' }, [panel]));
  }

  // ---------------- transient feedback ----------------
  flashDeath(kind: 'caught' | 'hurt') {
    const fade = document.getElementById('fx-fade');
    if (!fade) return;
    fade.classList.remove('caught', 'hurt');
    // force reflow so the animation restarts
    void fade.offsetWidth;
    fade.classList.add(kind);
  }

  toast(text: string, tone: 'good' | 'warn' | 'plain' = 'plain') {
    const layer = document.getElementById('toast-layer');
    if (!layer) return;
    const t = el('div', { class: `toast ${tone === 'plain' ? '' : tone}` }, [text]);
    layer.append(t);
    setTimeout(() => t.remove(), 2300);
  }

  // ---------------- HUD ----------------
  showHUD(levelName: string, levelIndex: number, firstPerson: boolean, objective: string) {
    this.clear();
    const pauseBtn = el('button', { class: 'hud-pause-btn', 'aria-label': 'Pause' }, ['⏸']);
    pauseBtn.addEventListener('click', () => { this.hooks.sound('click'); this.hooks.onPause(); });

    const timer = el('div', { class: 'hud-timer' }, ['00:00.0']);
    this.timerEl = timer;

    const lives = el('div', { class: 'hud-lives' }, ['∞']);
    this.livesEl = lives;

    const top = el('div', { class: 'hud-top' }, [
      el('div', { class: 'hud-left' }, [
        el('div', { class: 'hud-level' }, [document.createTextNode(`Level ${levelIndex} · `), el('b', {}, [levelName])]),
        lives,
      ]),
      timer,
      pauseBtn,
    ]);

    const objectiveEl = el('div', { class: 'hud-objective' }, [`◎ ${objective}`]);
    this.objectiveEl = objectiveEl;

    const danger = el('div', { class: 'hud-danger' }, ['⚠ SEEN']);
    this.dangerEl = danger;

    const hint = el('div', { class: 'hud-hint' }, [
      isTouch() ? 'Left stick move · right drag look · JUMP'
                : 'WASD move · move mouse to look · Space jump · Q/E turn · Esc pause',
    ]);
    setTimeout(() => hint.style.opacity = '0', 7000);

    const hud = el('div', { id: 'hud' }, [top, objectiveEl, danger, hint]);
    if (firstPerson) hud.append(el('div', { class: 'crosshair' }, []));
    this.root.append(hud);
  }

  updateTimer(seconds: number) {
    if (!this.timerEl) return;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const d = Math.floor((seconds * 10) % 10);
    this.timerEl.textContent = `${pad(m)}:${pad(s)}.${d}`;
  }

  updateLives(lives: number) {
    if (!this.livesEl) return;
    this.livesEl.textContent = lives < 0 ? '∞' : '♥ '.repeat(Math.max(0, lives)).trim() || '—';
  }

  updateObjective(text: string) {
    if (this.objectiveEl) this.objectiveEl.textContent = `◎ ${text}`;
  }

  setDanger(on: boolean) {
    this.dangerEl?.classList.toggle('show', on);
  }

  // ---------------- reusable controls ----------------
  private slider(label: string, min: number, max: number, value: number, unit: string, onInput: (v: number) => void): El {
    const val = el('span', { class: 'value' }, [`${value}${unit}`]);
    const input = el('input', { type: 'range', min: String(min), max: String(max), value: String(value) });
    input.addEventListener('input', () => {
      const v = Number((input as HTMLInputElement).value);
      val.textContent = `${v}${unit}`;
      onInput(v);
    });
    return el('div', { class: 'row' }, [el('label', {}, [label]), el('div', { class: 'row', style: 'gap:.8rem' }, [input, val])]);
  }

  private toggleRow(label: string, value: boolean, onChange: (v: boolean) => void): El {
    const toggle = el('div', { class: `toggle ${value ? 'on' : ''}`, role: 'switch' }, []);
    let state = value;
    toggle.addEventListener('click', () => {
      state = !state;
      toggle.classList.toggle('on', state);
      this.hooks.sound('click');
      onChange(state);
    });
    return el('div', { class: 'row' }, [el('label', {}, [label]), toggle]);
  }

  private segmentedRow<T extends string>(label: string, values: T[], current: T, labels: string[], onChange: (v: T) => void): El {
    const seg = el('div', { class: 'segmented' }, []);
    const btns: HTMLButtonElement[] = [];
    values.forEach((v, i) => {
      const b = el('button', { class: v === current ? 'active' : '' }, [labels[i]]);
      b.addEventListener('click', () => {
        btns.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        this.hooks.sound('click');
        onChange(v);
      });
      btns.push(b);
      seg.append(b);
    });
    return el('div', { class: 'row' }, [el('label', {}, [label]), seg]);
  }

  hideAll() { this.clear(); this.timerEl = null; }
}

function stat(key: string, val: string): HTMLElement {
  return el('div', { class: 'stat' }, [
    el('div', { class: 's-val' }, [val]),
    el('div', { class: 's-key' }, [key]),
  ]);
}
function pad(n: number): string { return n < 10 ? `0${n}` : String(n); }
function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60), d = Math.floor((seconds * 10) % 10);
  return `${pad(m)}:${pad(s)}.${d}`;
}
export function isTouch(): boolean {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
}
