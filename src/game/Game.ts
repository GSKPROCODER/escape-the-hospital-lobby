import * as THREE from 'three';
import { Renderer } from '../engine/Renderer';
import { Physics } from '../engine/Physics';
import { CameraRig } from '../engine/CameraRig';
import { Player } from '../engine/Player';
import { LevelManager } from '../world/LevelManager';
import { InputState } from '../core/Input';
import { AudioEngine } from '../core/Audio';
import { GameSettings } from '../core/Settings';
import { DifficultyId, DIFFICULTIES } from '../core/Difficulty';
import { Enemy } from '../ai/Enemy';

const MENU_FOCUS = new THREE.Vector3(0, 1, -3);
const RESPAWN_GRACE = 1.6; // seconds of catch-immunity after a respawn

/**
 * Owns the 3D world and stepping. App decides which update to call
 * (menu cinematic vs. gameplay) and reacts to the event callbacks below.
 */
export class Game {
  readonly renderer: Renderer;
  private physics = new Physics();
  private cameraRig!: CameraRig;
  private player!: Player;
  private levels!: LevelManager;
  private enemy!: Enemy;

  private elapsed = 0;
  private playTime = 0;
  private reducedMotion = false;
  private ready = false;

  private difficulty: DifficultyId = 'normal';
  private lives = 5;         // -1 = unlimited
  private deaths = 0;
  private graceTimer = 0;
  private finished = false;  // won or failed this run

  // Event callbacks (set by App)
  onWin: (() => void) | null = null;
  onFail: (() => void) | null = null;
  onCheckpoint: (() => void) | null = null;
  onDeath: ((kind: 'caught' | 'hazard' | 'fall') => void) | null = null;
  onPickup: (() => void) | null = null;

  constructor(
    containerId: string,
    private input: InputState,
    private audio: AudioEngine
  ) {
    this.renderer = new Renderer(containerId);
  }

  async init(settings: GameSettings) {
    await this.physics.init();
    this.cameraRig = new CameraRig(this.renderer.camera, this.physics.world);
    this.levels = new LevelManager(this.renderer.scene, this.physics.world);
    this.levels.loadByIndex(1);
    this.player = new Player(this.renderer.scene, this.physics.world, this.levels.getSpawnPosition());
    this.enemy = new Enemy(
      this.renderer.scene, this.physics.world,
      this.levels.getEnemySpawn(), DIFFICULTIES.normal.enemy, this.levels.getPatrol()
    );
    this.applySettings(settings);
    this.ready = true;
  }

  isReady() { return this.ready; }

  applySettings(s: GameSettings) {
    this.renderer.setQuality(s.quality);
    this.cameraRig.setMode(s.cameraMode);
    this.player?.setModelVisible(s.cameraMode === 'third');
    this.input.setSensitivity(s.lookSensitivity);
    this.input.setInvertY(s.invertY);
    this.audio.applySettings(s);
    this.reducedMotion = s.reducedMotion;
  }

  // ---------- menu ----------
  updateMenu(dt: number) {
    this.elapsed += dt;
    this.physics.step(dt);
    this.cameraRig.menuUpdate(dt, MENU_FOCUS, this.reducedMotion);
    this.input.tick(dt);
    this.player.update(dt, this.input, this.cameraRig.getYaw());
    this.enemy.setActive(false);
    this.levels.update(dt, this.elapsed, this.reducedMotion, this.player.getPosition());
    this.input.resetPerFrame();
  }

  /** Load a different built level (geometry only); startRun() then positions actors. */
  loadLevelByIndex(index1: number): boolean {
    return this.levels.loadByIndex(index1);
  }

  // ---------- gameplay ----------
  updatePlay(dt: number) {
    this.elapsed += dt;
    this.playTime += dt;
    if (this.graceTimer > 0) this.graceTimer -= dt;

    this.physics.step(dt);
    this.input.tick(dt);
    this.player.update(dt, this.input, this.cameraRig.getYaw());

    const moving = this.player.getHorizontalSpeed() > 0.5;
    this.cameraRig.update(this.input, this.player.getPosition(), dt, this.player.getFacing(), moving);

    const landed = this.player.consumeJustLanded();
    if (landed) this.audio.land();

    // Enemy hunt
    const noise = (this.input.sprint && moving) || landed;
    this.enemy.update(dt, { playerPos: this.player.getPosition(), noise });

    // Level dynamics (doors, sweeping hazards, keycard) — needs player position.
    this.levels.update(dt, this.elapsed, this.reducedMotion, this.player.getPosition());
    if (this.levels.consumePickup()) { this.audio.select(); this.onPickup?.(); }

    if (!this.finished) {
      const playerPos = this.player.getPosition();

      // Checkpoints
      const cp = this.levels.updateCheckpoints(playerPos);
      if (cp >= 0) { this.audio.select(); this.onCheckpoint?.(); }

      // Win (gated by canExit — e.g. keycard)
      if (this.levels.checkWin(playerPos)) { this.finished = true; this.onWin?.(); }

      // Death: fall / hazard (no life cost) or enemy catch (life cost on finite modes)
      else if (playerPos.y < this.levels.getFallY()) this.respawn('fall');
      else if (this.levels.hazardHit(playerPos)) this.respawn('hazard');
      else if (this.graceTimer <= 0 && this.enemy.didCatch(playerPos)) this.respawn('caught');
    }

    this.input.resetPerFrame();
  }

  private respawn(kind: 'caught' | 'hazard' | 'fall') {
    const costLife = kind === 'caught';
    this.deaths++;
    this.onDeath?.(kind);
    if (costLife) this.audio.growl();
    else this.audio.land();
    if (costLife && this.lives > 0) {
      this.lives--;
      if (this.lives <= 0) { this.finished = true; this.onFail?.(); return; }
    }
    this.player.respawn(this.levels.getSpawnPosition());
    this.enemy.reset(this.levels.getEnemySpawn());
    this.graceTimer = RESPAWN_GRACE;
  }

  render(alpha: number) {
    this.player.updateRender(alpha);
    this.renderer.render();
  }

  // ---------- run control ----------
  startRun(difficulty: DifficultyId) {
    this.difficulty = difficulty;
    const cfg = DIFFICULTIES[difficulty];
    this.lives = cfg.lives;
    this.deaths = 0;
    this.playTime = 0;
    this.finished = false;
    this.graceTimer = RESPAWN_GRACE;

    this.levels.resetProgress();
    this.enemy.setConfig(cfg.enemy, this.levels.getPatrol());
    this.player.respawn(this.levels.getSpawnPosition());
    this.enemy.reset(this.levels.getEnemySpawn());
    this.enemy.setActive(true);
  }

  stopEnemy() { this.enemy.setActive(false); }

  // ---------- HUD accessors ----------
  getPlayTime() { return this.playTime; }
  getLevelName() { return this.levels.getName(); }
  getLevelId() { return this.levels.getId(); }
  getLevelIndex() { return this.levels.getIndex(); }
  getObjective() { return this.levels.getObjective(); }
  getLives() { return this.lives; }
  getDeaths() { return this.deaths; }
  getDifficulty() { return this.difficulty; }
  isDanger() { return this.enemy.isSeen(); }
}
