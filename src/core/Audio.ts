import { GameSettings } from './Settings';

/**
 * Self-contained procedural audio (Web Audio API) — no external sound files,
 * so the build stays offline-friendly and CDN-free. Generates a low horror
 * ambient drone (music bus) plus short UI/gameplay blips (sfx bus).
 *
 * Howler is a project dependency for later sample-based audio, but this slice
 * uses raw Web Audio so nothing needs shipping as an asset.
 */
export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain!: GainNode;
  private musicGain!: GainNode;
  private sfxGain!: GainNode;

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
      this.applyVolumes();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  /** Suspend audio processing (pause screen / tab hidden) so ambience doesn't run on. */
  suspend() {
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

  /** Layered detuned drone + filtered noise = cold hospital ambience. */
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
      osc.connect(g).connect(this.musicGain);
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
    noise.connect(lp).connect(ng).connect(this.musicGain);
    noise.start();
    this.ambientNodes.push(noise);
  }

  private blip(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.25) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g).connect(this.sfxGain);
    osc.start();
    osc.stop(ctx.currentTime + dur + 0.02);
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

  hover() { this.blip(520, 0.05, 'sine', 0.12); }
  click() { this.blip(300, 0.08, 'square', 0.18); this.blip(600, 0.06, 'square', 0.1); }
  jump() { this.blip(260, 0.12, 'sine', 0.22); }
  land() { this.blip(120, 0.1, 'sine', 0.2); }
  select() { this.blip(440, 0.1, 'triangle', 0.2); this.blip(660, 0.12, 'triangle', 0.14); }
}
