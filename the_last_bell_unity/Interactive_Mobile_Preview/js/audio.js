/**
 * The Last Bell — Procedural Web Audio Horror Soundscape & UI SFX
 * Completely self-contained: generates atmosphere, wind, clock ticks, and eerie bells via Web Audio API.
 */
class HorrorAudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.masterGain = null;
    this.ambienceGain = null;
    this.sfxGain = null;

    this.masterVol = 0.85;
    this.ambienceVol = 0.80;
    this.sfxVol = 0.90;

    this.ambientRunning = false;
    this.clockInterval = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVol, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Ambience bus
    this.ambienceGain = this.ctx.createGain();
    this.ambienceGain.gain.setValueAtTime(this.ambienceVol, this.ctx.currentTime);
    this.ambienceGain.connect(this.masterGain);

    // SFX bus
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  toggleSound() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    const now = this.ctx.currentTime;
    const target = this.isMuted ? 0 : this.masterVol;
    this.masterGain.gain.setTargetAtTime(target, now, 0.08);

    if (!this.isMuted && !this.ambientRunning) {
      this.startHorrorAmbience();
    }

    return !this.isMuted;
  }

  startHorrorAmbience() {
    if (this.ambientRunning || !this.ctx) return;
    this.ambientRunning = true;

    // 1. Sub Bass Drone (Dark Classroom Atmosphere)
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(52, this.ctx.currentTime);

    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(80, this.ctx.currentTime);
    subFilter.Q.setValueAtTime(3, this.ctx.currentTime);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    subOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.ambienceGain);
    subOsc.start();

    // 2. Wind Whistling Through Broken Window Panes
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.96 * b1 + white * 0.11;
      b2 = 0.86 * b2 + white * 0.25;
      output[i] = (b0 + b1 + b2) * 0.4;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(420, this.ctx.currentTime);
    windFilter.Q.setValueAtTime(5, this.ctx.currentTime);

    // LFO for slow wind modulation
    const windLFO = this.ctx.createOscillator();
    windLFO.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(260, this.ctx.currentTime);
    windLFO.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);
    windLFO.start();

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    whiteNoise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.ambienceGain);
    whiteNoise.start();

    // 3. Distant School Clock Ticking (Classroom Wall)
    this.startClockTicking();
  }

  startClockTicking() {
    this.clockInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      this.playClockTick();
    }, 1000);
  }

  playClockTick() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.015);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.ambienceGain);

    osc.start(now);
    osc.stop(now + 0.025);
  }

  // UI SFX: Button Hover
  playHover() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.06);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // UI SFX: Button Click (Mechanical clunk + metallic hit)
  playClick() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // Blood Drip SFX: two quick descending "plips" for the brush landing on a button
  playDrip() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Main droplet: fast downward pitch bend
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.12);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.20, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.18);

    // Echo droplet: quieter second drip right after
    const t2 = now + 0.16;
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(660, t2);
    osc2.frequency.exponentialRampToValueAtTime(180, t2 + 0.1);

    gain2.gain.setValueAtTime(0.0001, t2);
    gain2.gain.exponentialRampToValueAtTime(0.09, t2 + 0.008);
    gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.14);

    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(t2);
    osc2.stop(t2 + 0.16);
  }

  // Iconic Distant Bell Chime for "The Last Bell"
  playLastBellChime() {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Harmonic bell partials (fundamental, minor third, fifth, octave)
    const partials = [
      { freq: 440, gain: 0.35, decay: 3.2 },
      { freq: 523.25, gain: 0.28, decay: 2.8 },
      { freq: 659.25, gain: 0.20, decay: 2.4 },
      { freq: 880, gain: 0.15, decay: 1.8 }
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.freq, now);

      gain.gain.setValueAtTime(p.gain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + p.decay + 0.05);
    });
  }

  setMasterVolume(val) {
    this.masterVol = val;
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.04);
    }
  }

  setAmbienceVolume(val) {
    this.ambienceVol = val;
    if (this.ambienceGain) {
      this.ambienceGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.04);
    }
  }

  setSfxVolume(val) {
    this.sfxVol = val;
    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(val, this.ctx.currentTime, 0.04);
    }
  }
}

window.HorrorAudio = new HorrorAudioManager();
