import { GameSettings } from './Settings';

/**
 * Self-contained procedural audio (Web Audio API) — no external sound files,
 * so the build stays offline-friendly and CDN-free. Generates a low horror
 * ambient drone (3-layer intensity system) plus short UI/gameplay blips.
 *
 * Howler is a project dependency for later sample-based audio, but this slice
 * uses raw Web Audio so nothing needs shipping as an asset.
 */
export type MusicLevel = 'calm' | 'tension' | 'chase';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain!: GainNode;
  private musicGain!: GainNode;
  private sfxGain!: GainNode;

  // Music intensity sub-buses, all mixed under musicGain.
  private calmBus!: GainNode;
  private tensionBus!: GainNode;
  private chaseBus!: GainNode;
  private chaseInterval: number | null = null;

  private ambientStarted = false;
  private ambientNodes: AudioNode[] = [];

  private settings: GameSettings;

  constructor(settings: GameSettings) {
    this.settings = settings;
  }

  /** Must be called from a user gesture (click/tap) to satisfy autoplay policy. */
  resume() {
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.calmBus = this.ctx.createGain(); this.calmBus.gain.value = 1;
      this.tensionBus = this.ctx.createGain(); this.tensionBus.gain.value = 0;
      this.chaseBus = this.ctx.createGain(); this.chaseBus.gain.value = 0;
      this.calmBus.connect(this.musicGain);
      this.tensionBus.connect(this.musicGain);
      this.chaseBus.connect(this.musicGain);

      this.applyVolumes();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  /** Suspend audio processing (pause screen / tab hidden) so ambience doesn't run on. */
  suspend() {
    this.stopChaseLoop();
    if (this.ctx && this.ctx.state === 'running') void this.ctx.suspend();
  }

  applySettings(settings: GameSettings) {
    this.settings = settings;
    if (this.ctx) this.applyVolumes();
  }

  private applyVolumes() {
    const now = this.ctx!.currentTime;
    this.masterGain.gain.setTargetAtTime(this.settings.masterVolume, now, 0.05);
    this.musicGain.gain.setTargetAtTime(this.settings.musicVolume * 0.5, now, 0.05);
    this.sfxGain.gain.setTargetAtTime(this.settings.sfxVolume, now, 0.05);
  }

  /** Layered detuned drone + filtered noise (calm bed) + tension pulse layer. */
  startAmbient() {
    if (!this.ctx || this.ambientStarted) return;
    this.ambientStarted = true;
    const ctx = this.ctx;

    const freqs = [55, 82.4, 110]; // A1 / E2 / A2
    for (const f of freqs) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.12;
      // slow amplitude wobble for unease
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07 + Math.random() * 0.06;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.06;
      lfo.connect(lfoGain).connect(g.gain);
      osc.connect(g).connect(this.calmBus);
      osc.start();
      lfo.start();
      this.ambientNodes.push(osc, lfo);
    }

    // faint airy noise through a low-pass = ventilation hum
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const chan = buffer.getChannelData(0);
    for (let i = 0; i < chan.length; i++) chan[i] = (Math.random() * 2 - 1) * 0.5;
    noise.buffer = buffer;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 380;
    const ng = ctx.createGain();
    ng.gain.value = 0.05;
    noise.connect(lp).connect(ng).connect(this.calmBus);
    noise.start();
    this.ambientNodes.push(noise);

    // Tension layer — a slightly dissonant higher drone with a slow pulse,
    // mixed in via tensionBus (silent until setIntensity('tension'/'chase')).
    const tOsc = ctx.createOscillator();
    tOsc.type = 'sine';
    tOsc.frequency.value = 130.8; // clashes gently against the calm A-based drone
    const tGain = ctx.createGain();
    tGain.gain.value = 0.16;
    const tLfo = ctx.createOscillator();
    tLfo.frequency.value = 0.5; // ~1 pulse / 2s
    const tLfoGain = ctx.createGain();
    tLfoGain.gain.value = 0.1;
    tLfo.connect(tLfoGain).connect(tGain.gain);
    tOsc.connect(tGain).connect(this.tensionBus);
    tOsc.start();
    tLfo.start();
    this.ambientNodes.push(tOsc, tLfo);
  }

  /** Crossfade the 3 music layers by hunt state; toggles the chase percussion loop. */
  setIntensity(level: MusicLevel) {
    if (!this.ctx || !this.calmBus) return;
    const now = this.ctx.currentTime;
    const calmTarget = level === 'calm' ? 1 : level === 'tension' ? 0.5 : 0.25;
    const tensionTarget = level === 'tension' ? 1 : level === 'chase' ? 0.6 : 0;
    const chaseTarget = level === 'chase' ? 1 : 0;
    this.calmBus.gain.setTargetAtTime(calmTarget, now, 0.6);
    this.tensionBus.gain.setTargetAtTime(tensionTarget, now, 0.6);
    this.chaseBus.gain.setTargetAtTime(chaseTarget, now, 0.4);
    if (level === 'chase') this.startChaseLoop(); else this.stopChaseLoop();
  }

  private startChaseLoop() {
    if (this.chaseInterval !== null || !this.ctx) return;
    this.chaseInterval = window.setInterval(() => this.chaseHit(), 260);
  }
  private stopChaseLoop() {
    if (this.chaseInterval !== null) { clearInterval(this.chaseInterval); this.chaseInterval = null; }
  }
  private chaseHit() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(90, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.15);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(g).connect(this.chaseBus);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  }

  private blip(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.25, delay = 0) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(this.sfxGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  /** Low descending growl when the Presence spots the player. */
  growl() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.5);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 500;
    osc.connect(lp).connect(g).connect(this.sfxGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.62);
  }

  /** A double "lub-dub" heartbeat thump — played while the enemy has line of sight. */
  heartbeat() {
    if (!this.ctx) return;
    const thump = (t: number, freq: number, vol: number) => {
      const ctx = this.ctx!;
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(freq, ctx.currentTime + t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, ctx.currentTime + t + 0.12);
      g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
      g.gain.linearRampToValueAtTime(vol, ctx.currentTime + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + 0.16);
      osc.connect(g).connect(this.sfxGain);
      osc.start(ctx.currentTime + t); osc.stop(ctx.currentTime + t + 0.2);
    };
    thump(0, 70, 0.28);
    thump(0.18, 60, 0.2);
  }

  /** Short filtered-noise footstep burst, toned by surface. */
  footstepPlayer(surface: 'tile' | 'metal' | 'water' = 'tile') {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const dur = 0.06;
    const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
    const chan = buffer.getChannelData(0);
    for (let i = 0; i < chan.length; i++) chan[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = surface === 'metal' ? 'highpass' : surface === 'water' ? 'lowpass' : 'bandpass';
    filter.frequency.value = surface === 'metal' ? 1800 : surface === 'water' ? 500 : 1000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.14, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    src.connect(filter).connect(g).connect(this.sfxGain);
    src.start();
  }

  /** Heavier, duller footstep for the enemy — volume falls off with distance. */
  footstepEnemy(distance: number) {
    if (!this.ctx) return;
    const vol = Math.max(0, 0.22 * (1 - distance / 18));
    if (vol <= 0.005) return;
    const ctx = this.ctx;
    const dur = 0.09;
    const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
    const chan = buffer.getChannelData(0);
    for (let i = 0; i < chan.length; i++) chan[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass'; filter.frequency.value = 320;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    src.connect(filter).connect(g).connect(this.sfxGain);
    src.start();
  }

  /** Distinct rising chime for a keycard/pickup — separate from checkpoint(). */
  keycard() {
    this.blip(660, 0.09, 'triangle', 0.18, 0);
    this.blip(880, 0.14, 'triangle', 0.2, 0.07);
    this.blip(1100, 0.16, 'sine', 0.14, 0.14);
  }

  /** Soft affirming fifth chime for crossing a checkpoint line. */
  checkpoint() {
    this.blip(392, 0.08, 'sine', 0.16, 0);
    this.blip(523, 0.14, 'sine', 0.16, 0.05);
  }

  /** Sharp electric zap for a hazard-tile hit (distinct from a fall/land thud). */
  hazardZap() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);
    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
    osc.connect(g).connect(this.sfxGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }

  /** Door slide whoosh — pitch rises on open, falls on close. */
  doorSlide(opening: boolean) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    const startF = opening ? 220 : 340;
    const endF = opening ? 340 : 220;
    osc.frequency.setValueAtTime(startF, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(endF, ctx.currentTime + 0.35);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.connect(g).connect(this.sfxGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.42);
  }

  /** Rising triad stinger on clearing a wing. */
  winSting() {
    this.blip(261.6, 0.35, 'triangle', 0.22, 0);
    this.blip(329.6, 0.35, 'triangle', 0.2, 0.12);
    this.blip(392.0, 0.5, 'triangle', 0.22, 0.24);
    this.blip(523.3, 0.6, 'sine', 0.16, 0.36);
  }

  /** Falling dissonant cluster on running out of lives. */
  loseSting() {
    this.blip(220, 0.4, 'sawtooth', 0.2, 0);
    this.blip(207.65, 0.5, 'sawtooth', 0.18, 0.1);
    this.blip(110, 0.7, 'sine', 0.22, 0.2);
  }

  hover() { this.blip(520, 0.05, 'sine', 0.12); }
  click() { this.blip(300, 0.08, 'square', 0.18); this.blip(600, 0.06, 'square', 0.1); }
  jump() { this.blip(260, 0.12, 'sine', 0.22); }
  land() { this.blip(120, 0.1, 'sine', 0.2); }
  select() { this.blip(440, 0.1, 'triangle', 0.2); this.blip(660, 0.12, 'triangle', 0.14); }
}
