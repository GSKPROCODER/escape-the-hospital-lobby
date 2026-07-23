import { Save } from './Save';
import { GameSettings } from './Settings';
import { DifficultyId, DIFFICULTIES } from './Difficulty';
import { InputState } from './Input';
import { AudioEngine } from './Audio';
import { Loop } from './Loop';
import { Game } from '../game/Game';
import { UI, isTouch } from '../ui/UI';
import { TouchControls } from '../ui/TouchControls';
import { getBuiltLevel, highestBuiltIndex, TOTAL_LEVELS } from '../world/levels';

type SimMode = 'menu' | 'play' | 'frozen';

const CONTAINER_ID = 'game-container';

/**
 * Top-level coordinator: owns Save/Settings/Input/Audio/Game/UI and the loop,
 * and transitions between menu, difficulty-select, play, pause, win and fail.
 */
export class App {
  private save = new Save();
  private settings: GameSettings;
  private difficulty: DifficultyId;
  private input: InputState;
  private audio: AudioEngine;
  private game: Game;
  private ui: UI;
  private touch: TouchControls;
  private loop: Loop;

  private mode: SimMode = 'menu';
  private ambientOn = false;
  private lastDanger = false;
  private pendingLevel = 1;
  private heartbeatT = 0;
  private lastFrame = 0;

  constructor() {
    this.settings = this.save.getSettings();
    this.difficulty = this.save.getDifficulty();

    const container = document.getElementById(CONTAINER_ID);
    if (!container) throw new Error('game container missing');

    this.input = new InputState(container);
    this.audio = new AudioEngine(this.settings);
    this.game = new Game(CONTAINER_ID, this.input, this.audio);

    this.game.onWin = () => this.handleWin();
    this.game.onFail = () => this.handleFail();
    this.game.onDeath = (kind) => {
      this.ui.flashDeath(kind === 'caught' ? 'caught' : 'hurt');
      this.ui.toast(kind === 'caught' ? 'Caught! Back to the checkpoint' : 'Respawned', 'warn');
    };
    this.game.onCheckpoint = () => this.ui.toast('Checkpoint reached', 'good');
    this.game.onPickup = () => this.ui.toast('Keycard acquired — exit unlocked', 'good');

    this.ui = new UI({
      onPlay: () => { this.pendingLevel = this.furthestPlayable(); this.ui.showDifficulty(); },
      onLevels: () => this.ui.showLevelSelect(),
      onPlayLevel: (i) => { this.pendingLevel = i; this.ui.showDifficulty(); },
      onStartRun: (id) => this.beginRun(id),
      onResume: () => this.resume(),
      onRestart: () => this.startAt(this.game.getLevelIndex(), this.difficulty),
      onQuitToMenu: () => this.quitToMenu(),
      onPause: () => this.pause(),
      onRetry: () => this.startAt(this.game.getLevelIndex(), this.difficulty),
      onWinContinue: () => this.continueToNext(),
      getSettings: () => ({ ...this.settings }),
      getDifficulty: () => this.difficulty,
      getUnlocked: () => this.save.getUnlockedLevel(),
      getBest: (id) => this.save.getBestTime(id),
      onSettingsChange: (s) => this.updateSettings(s),
      sound: (k) => { if (k === 'hover') this.audio.hover(); else this.audio.click(); },
    });

    this.touch = new TouchControls(this.input);

    this.loop = new Loop(
      (dt) => this.update(dt),
      (alpha) => this.render(alpha),
    );

    this.applyBodyReducedMotion();
    document.addEventListener('visibilitychange', () => { if (document.hidden) this.pause(); });
    window.addEventListener('blur', () => this.pause());
    // Losing the pointer lock (e.g. Esc) while playing pauses the game.
    document.addEventListener('pointerlockchange', () => {
      if (this.mode === 'play' && !isTouch() && !this.input.hasPointerLock) this.pause();
    });
  }

  async start() {
    setBootStatus('Building the hospital…');
    await this.game.init(this.settings);
    setBootStatus('Ready');
    this.mode = 'menu';
    this.ui.showMenu();
    this.loop.start();
    hideBootScreen();
  }

  // ---------------- loop ----------------
  private update(dt: number) {
    if (this.mode === 'play') {
      if (this.input.pausePressed) { this.input.pausePressed = false; this.pause(); return; }
      this.game.updatePlay(dt);
    } else if (this.mode === 'menu') {
      this.game.updateMenu(dt);
    }
  }

  private render(alpha: number) {
    this.game.render(alpha);
    if (this.mode === 'play') {
      // rough frame delta for UI-side timers (heartbeat)
      const now = performance.now();
      const fdt = this.lastFrame ? Math.min(0.1, (now - this.lastFrame) / 1000) : 0;
      this.lastFrame = now;

      this.ui.updateTimer(this.game.getPlayTime());
      this.ui.updateLives(this.game.getLives());
      this.ui.updateObjective(this.game.getObjective());
      const danger = this.game.isDanger();
      if (danger && !this.lastDanger) this.audio.growl();
      this.lastDanger = danger;
      this.ui.setDanger(danger);
      document.body.classList.toggle('danger', danger);

      // Heartbeat while in the enemy's sight.
      if (danger) {
        this.heartbeatT -= fdt;
        if (this.heartbeatT <= 0) { this.audio.heartbeat(); this.heartbeatT = 0.9; }
      } else {
        this.heartbeatT = 0;
      }
    } else {
      this.lastFrame = 0;
    }
  }

  // ---------------- transitions ----------------
  private furthestPlayable(): number {
    return Math.min(this.save.getUnlockedLevel(), highestBuiltIndex());
  }

  /** Difficulty chosen → load the pending level and start. */
  private beginRun(id: DifficultyId) {
    this.difficulty = id;
    this.save.setDifficulty(id);
    this.startAt(this.pendingLevel, id);
  }

  /** Load a specific level index at a difficulty and enter play. */
  private startAt(index1: number, id: DifficultyId) {
    this.pendingLevel = index1;
    this.audio.resume();
    if (!this.ambientOn) { this.audio.startAmbient(); this.ambientOn = true; }
    this.game.loadLevelByIndex(index1);
    this.game.startRun(id);
    this.enterPlayState();
  }

  private resume() {
    this.audio.resume();
    this.enterPlayState();
  }

  private continueToNext() {
    const next = this.game.getLevelIndex() + 1;
    if (next <= TOTAL_LEVELS && getBuiltLevel(next)) this.startAt(next, this.difficulty);
    else this.ui.showLevelSelect();
  }

  private enterPlayState() {
    this.mode = 'play';
    this.input.enabled = true;
    document.body.classList.add('playing');
    this.ui.showHUD(this.game.getLevelName(), this.game.getLevelIndex(), this.settings.cameraMode === 'first', this.game.getObjective());
    this.ui.updateLives(this.game.getLives());
    if (isTouch()) this.touch.setActive(true);
    else this.input.requestPointerLock();
  }

  private pause() {
    if (this.mode !== 'play') return;
    this.mode = 'frozen';
    this.input.enabled = false;
    this.input.clear();
    this.input.exitPointerLock();
    this.touch.setActive(false);
    document.body.classList.remove('danger', 'playing');
    this.audio.suspend(); // don't let ambience run on behind the pause screen / a hidden tab
    this.ui.showPause({
      levelIndex: this.game.getLevelIndex(),
      levelName: this.game.getLevelName(),
      time: formatTime(this.game.getPlayTime()),
      deaths: this.game.getDeaths(),
      lives: this.game.getLives(),
      difficulty: DIFFICULTIES[this.difficulty].label,
    });
  }

  private quitToMenu() {
    this.mode = 'menu';
    this.input.enabled = false;
    this.input.clear();
    this.input.exitPointerLock();
    this.touch.setActive(false);
    this.game.stopEnemy();
    document.body.classList.remove('danger', 'playing');
    this.ui.showMenu();
  }

  private handleWin() {
    this.freezeAfterRun();
    const idx = this.game.getLevelIndex();
    this.save.recordBestTime(this.game.getLevelId(), this.game.getPlayTime());
    this.save.unlockLevel(idx + 1);
    const hasNext = idx + 1 <= TOTAL_LEVELS && !!getBuiltLevel(idx + 1);
    this.ui.showWin(this.game.getLevelName(), formatTime(this.game.getPlayTime()), this.game.getDeaths(), hasNext);
  }

  private handleFail() {
    this.freezeAfterRun();
    this.ui.showFail();
  }

  private freezeAfterRun() {
    this.mode = 'frozen';
    this.input.enabled = false;
    this.input.clear();
    this.input.exitPointerLock();
    this.touch.setActive(false);
    this.game.stopEnemy();
    document.body.classList.remove('danger', 'playing');
  }

  // ---------------- settings ----------------
  private updateSettings(s: GameSettings) {
    this.settings = s;
    this.save.saveSettings(s);
    this.game.applySettings(s);
    this.applyBodyReducedMotion();
  }

  private applyBodyReducedMotion() {
    document.body.classList.toggle('reduced-motion', this.settings.reducedMotion);
  }
}

// ---------------- helpers ----------------
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const d = Math.floor((seconds * 10) % 10);
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  return `${pad(m)}:${pad(s)}.${d}`;
}
function setBootStatus(text: string) {
  const s = document.getElementById('boot-status');
  if (s) s.textContent = text;
}
function hideBootScreen() {
  const b = document.getElementById('boot-screen');
  if (b) { b.classList.add('hidden'); setTimeout(() => b.remove(), 700); }
}
