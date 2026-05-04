const NEAR_ZERO = 0.001;

const MUSIC = {
  space: { base: 55, scale: [0, 3, 5, 7, 10], padVol: 0.2, noteVol: 0.25, noteProb: 0.5, texProb: 0.35, tempo: 2500, padLife: 14, noteDur: [1.5, 3], filterBase: 400 },
  station: { base: 49, scale: [0, 2, 3, 5, 7, 8, 10], padVol: 0.18, noteVol: 0.22, noteProb: 0.55, texProb: 0.4, tempo: 2200, padLife: 12, noteDur: [1, 2.5], filterBase: 500 },
  combat: { base: 41.2, scale: [0, 1, 3, 6, 7, 10], padVol: 0.24, noteVol: 0.3, noteProb: 0.6, texProb: 0.45, tempo: 1500, padLife: 8, noteDur: [0.5, 1.5], filterBase: 600 },
  quest: { base: 38.89, scale: [0, 1, 3, 5, 7, 8, 10], padVol: 0.18, noteVol: 0.2, noteProb: 0.45, texProb: 0.4, tempo: 3000, padLife: 16, noteDur: [2, 4], filterBase: 350 },
  quest_echo: { base: 32.7, scale: [0, 1, 5, 6, 7, 11], padVol: 0.12, noteVol: 0.14, noteProb: 0.3, texProb: 0.55, tempo: 4000, padLife: 20, noteDur: [3, 6], filterBase: 220 },
  quest_titan: { base: 36.71, scale: [0, 1, 3, 6, 7, 10], padVol: 0.2, noteVol: 0.22, noteProb: 0.5, texProb: 0.5, tempo: 2000, padLife: 10, noteDur: [0.8, 2], filterBase: 450 },
  quest_leviathan: { base: 27.5, scale: [0, 2, 3, 7, 10], padVol: 0.14, noteVol: 0.16, noteProb: 0.35, texProb: 0.5, tempo: 3500, padLife: 18, noteDur: [2.5, 5], filterBase: 250 },
  quest_quarantine: { base: 41.2, scale: [0, 1, 4, 6, 7, 11], padVol: 0.16, noteVol: 0.18, noteProb: 0.4, texProb: 0.45, tempo: 2800, padLife: 14, noteDur: [1.5, 3.5], filterBase: 380 },
  quest_blackbox: { base: 30.87, scale: [0, 1, 2, 5, 7, 8], padVol: 0.1, noteVol: 0.12, noteProb: 0.25, texProb: 0.6, tempo: 4500, padLife: 22, noteDur: [3, 7], filterBase: 200 },
  quest_noir: { base: 46.25, scale: [0, 2, 3, 5, 7, 10], padVol: 0.15, noteVol: 0.18, noteProb: 0.45, texProb: 0.35, tempo: 2500, padLife: 12, noteDur: [1.5, 3], filterBase: 420 },
  quest_mirror: { base: 34.65, scale: [0, 2, 4, 5, 7, 9, 11], padVol: 0.12, noteVol: 0.14, noteProb: 0.35, texProb: 0.5, tempo: 3200, padLife: 16, noteDur: [2, 5], filterBase: 300 },
  quest_tribunal: { base: 43.65, scale: [0, 1, 3, 5, 6, 8, 10], padVol: 0.18, noteVol: 0.2, noteProb: 0.4, texProb: 0.4, tempo: 2600, padLife: 14, noteDur: [1.5, 3], filterBase: 360 },
  quest_oxygen: { base: 49, scale: [0, 1, 5, 7, 8], padVol: 0.2, noteVol: 0.24, noteProb: 0.55, texProb: 0.3, tempo: 1800, padLife: 8, noteDur: [0.6, 1.5], filterBase: 500 },
  quest_silence: { base: 24.5, scale: [0, 5, 7], padVol: 0.08, noteVol: 0.1, noteProb: 0.2, texProb: 0.65, tempo: 5000, padLife: 24, noteDur: [4, 8], filterBase: 180 },
};

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = localStorage.getItem('space_trader_sound') === 'off';
    this._unlocked = false;
    this._activated = false;
    this.disabled = false;
    this._ambientNodes = null;
    this._ambientType = null;
    this._musicNodes = [];
    this._musicType = null;
    this._musicTimers = [];
    this._engineNodes = null;
    this._engineType = null;
  }

  _ensure() {
    if (this.disabled || !this._activated) return null;
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.8;
        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.value = -4;
        comp.knee.value = 8;
        comp.ratio.value = 4;
        comp.attack.value = 0.003;
        comp.release.value = 0.15;
        this.master.connect(comp).connect(this.ctx.destination);
      } catch (e) {
        this.disabled = true;
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  _out() {
    return this.master || (this.ctx ? this.ctx.destination : null);
  }

  unlock() {
    if (this._unlocked) return;
    this._unlocked = true;
    const handler = () => {
      this._activated = true;
      this._ensure();
      document.removeEventListener('pointerdown', handler);
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('click', handler);
    };
    document.addEventListener('pointerdown', handler);
    document.addEventListener('touchstart', handler);
    document.addEventListener('click', handler);
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('space_trader_sound', this.muted ? 'off' : 'on');
    if (this.muted) {
      this.stopAmbient();
      this.stopMusic();
    }
    return this.muted;
  }

  _cleanup(nodes) {
    for (const n of nodes) {
      try { n.disconnect(); } catch (_) {}
    }
    this._musicNodes = this._musicNodes.filter(n => !nodes.includes(n));
  }

  _osc(type, freq, dur, vol = 0.3, sweep = null) {
    if (this.muted || this.disabled) return;
    const c = this._ensure();
    if (!c) return;
    const out = this._out();
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (sweep) o.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(NEAR_ZERO, t + dur);
    o.connect(g).connect(out);
    o.onended = () => this._cleanup([o, g]);
    o.start(t);
    o.stop(t + dur);
  }

  _filteredOsc(type, freq, dur, vol, sweep, filterType, filterFreq, filterSweep) {
    if (this.muted || this.disabled) return;
    const c = this._ensure();
    if (!c) return;
    const out = this._out();
    const t = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    const f = c.createBiquadFilter();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (sweep) o.frequency.exponentialRampToValueAtTime(sweep, t + dur);
    f.type = filterType;
    f.frequency.setValueAtTime(filterFreq, t);
    if (filterSweep) f.frequency.exponentialRampToValueAtTime(filterSweep, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(NEAR_ZERO, t + dur);
    o.connect(f).connect(g).connect(out);
    o.onended = () => this._cleanup([o, f, g]);
    o.start(t);
    o.stop(t + dur);
  }

  _noise(dur, vol = 0.2, filter = null) {
    if (this.muted || this.disabled) return;
    const c = this._ensure();
    if (!c) return;
    const out = this._out();
    const t = c.currentTime;
    const len = c.sampleRate * dur;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(NEAR_ZERO, t + dur);
    if (filter) {
      const f = c.createBiquadFilter();
      f.type = filter.type || 'lowpass';
      f.frequency.setValueAtTime(filter.freq || 1000, t);
      if (filter.sweep) f.frequency.exponentialRampToValueAtTime(filter.sweep, t + dur);
      if (filter.Q) f.Q.value = filter.Q;
      src.connect(f).connect(g).connect(out);
      src.onended = () => this._cleanup([src, f, g]);
    } else {
      src.connect(g).connect(out);
      src.onended = () => this._cleanup([src, g]);
    }
    src.start(t);
    src.stop(t + dur);
  }

  _arpeggio(type, freqs, interval, noteDur, vol) {
    if (this.muted || this.disabled) return;
    const c = this._ensure();
    if (!c) return;
    const out = this._out();
    const t = c.currentTime;
    freqs.forEach((f, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(vol, t + i * interval);
      g.gain.exponentialRampToValueAtTime(NEAR_ZERO, t + i * interval + noteDur);
      o.connect(g).connect(out);
      o.onended = () => this._cleanup([o, g]);
      o.start(t + i * interval);
      o.stop(t + i * interval + noteDur);
    });
  }

  // --- Ambient ---

  startAmbient(type = 'space') {
    if (this.muted || this.disabled) return;
    if (this._ambientType === type && this._ambientNodes) return;
    this.stopAmbient();
    this.stopSystemLayer();
    const c = this._ensure();
    if (!c) return;
    const out = this._out();
    const nodes = [];

    if (type === 'space') {
      // Deep sub-bass drone
      const drone = c.createOscillator();
      drone.type = 'sawtooth';
      drone.frequency.value = 32;
      const droneFilter = c.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.value = 60;
      droneFilter.Q.value = 2;
      const droneGain = c.createGain();
      droneGain.gain.value = 0.06;
      drone.connect(droneFilter).connect(droneGain).connect(out);
      drone.start();
      nodes.push(drone, droneFilter, droneGain);

      // Dissonant fifth - eerie
      const drone2 = c.createOscillator();
      drone2.type = 'sine';
      drone2.frequency.value = 46.25;
      const drone2Gain = c.createGain();
      drone2Gain.gain.value = 0.025;
      drone2.connect(drone2Gain).connect(out);
      drone2.start();
      nodes.push(drone2, drone2Gain);

      // Slow LFO on pitch - unsettling wobble
      const lfo = c.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.04;
      const lfoGain = c.createGain();
      lfoGain.gain.value = 3;
      lfo.connect(lfoGain).connect(drone.frequency);
      lfo.start();
      nodes.push(lfo, lfoGain);

      // Dark rumble noise
      const noiseLen = c.sampleRate * 3;
      const noiseBuf = c.createBuffer(1, noiseLen, c.sampleRate);
      const noiseData = noiseBuf.getChannelData(0);
      for (let i = 0; i < noiseLen; i++) noiseData[i] = Math.random() * 2 - 1;
      const noiseSrc = c.createBufferSource();
      noiseSrc.buffer = noiseBuf;
      noiseSrc.loop = true;
      const noiseFilter = c.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 150;
      noiseFilter.Q.value = 1;
      const noiseGain = c.createGain();
      noiseGain.gain.value = 0.025;
      noiseSrc.connect(noiseFilter).connect(noiseGain).connect(out);
      noiseSrc.start();
      nodes.push(noiseSrc, noiseFilter, noiseGain);

      // Noise volume LFO - breathing effect
      const noiseLfo = c.createOscillator();
      noiseLfo.type = 'sine';
      noiseLfo.frequency.value = 0.07;
      const noiseLfoGain = c.createGain();
      noiseLfoGain.gain.value = 0.015;
      noiseLfo.connect(noiseLfoGain).connect(noiseGain.gain);
      noiseLfo.start();
      nodes.push(noiseLfo, noiseLfoGain);

    } else if (type === 'station') {
      // Industrial hum
      const hum = c.createOscillator();
      hum.type = 'sawtooth';
      hum.frequency.value = 50;
      const humFilter = c.createBiquadFilter();
      humFilter.type = 'lowpass';
      humFilter.frequency.value = 80;
      humFilter.Q.value = 3;
      const humGain = c.createGain();
      humGain.gain.value = 0.04;
      hum.connect(humFilter).connect(humGain).connect(out);
      hum.start();
      nodes.push(hum, humFilter, humGain);

      // Metallic resonance
      const metal = c.createOscillator();
      metal.type = 'square';
      metal.frequency.value = 100;
      const metalFilter = c.createBiquadFilter();
      metalFilter.type = 'bandpass';
      metalFilter.frequency.value = 100;
      metalFilter.Q.value = 15;
      const metalGain = c.createGain();
      metalGain.gain.value = 0.008;
      metal.connect(metalFilter).connect(metalGain).connect(out);
      metal.start();
      nodes.push(metal, metalFilter, metalGain);

      // Dark vent noise
      const vent = c.createBufferSource();
      const ventLen = c.sampleRate * 2;
      const ventBuf = c.createBuffer(1, ventLen, c.sampleRate);
      const ventData = ventBuf.getChannelData(0);
      for (let i = 0; i < ventLen; i++) ventData[i] = Math.random() * 2 - 1;
      vent.buffer = ventBuf;
      vent.loop = true;
      const ventFilter = c.createBiquadFilter();
      ventFilter.type = 'lowpass';
      ventFilter.frequency.value = 250;
      ventFilter.Q.value = 0.8;
      const ventGain = c.createGain();
      ventGain.gain.value = 0.03;
      vent.connect(ventFilter).connect(ventGain).connect(out);
      vent.start();
      nodes.push(vent, ventFilter, ventGain);

    } else if (type === 'combat') {
      // Heavy pulsing sub-bass
      const bass = c.createOscillator();
      bass.type = 'sawtooth';
      bass.frequency.value = 30;
      const bassFilter = c.createBiquadFilter();
      bassFilter.type = 'lowpass';
      bassFilter.frequency.value = 55;
      bassFilter.Q.value = 4;
      const bassGain = c.createGain();
      bassGain.gain.value = 0.07;
      bass.connect(bassFilter).connect(bassGain).connect(out);
      bass.start();
      nodes.push(bass, bassFilter, bassGain);

      // Aggressive LFO pulse
      const lfo = c.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 0.5;
      const lfoGain = c.createGain();
      lfoGain.gain.value = 0.035;
      lfo.connect(lfoGain).connect(bassGain.gain);
      lfo.start();
      nodes.push(lfo, lfoGain);

      // Distorted mid growl
      const growl = c.createOscillator();
      growl.type = 'sawtooth';
      growl.frequency.value = 55;
      const growlFilter = c.createBiquadFilter();
      growlFilter.type = 'lowpass';
      growlFilter.frequency.value = 120;
      growlFilter.Q.value = 6;
      const growlGain = c.createGain();
      growlGain.gain.value = 0.02;
      growl.connect(growlFilter).connect(growlGain).connect(out);
      growl.start();
      nodes.push(growl, growlFilter, growlGain);

      // Rumble
      const rumbleLen = c.sampleRate * 2;
      const rumbleBuf = c.createBuffer(1, rumbleLen, c.sampleRate);
      const rumbleData = rumbleBuf.getChannelData(0);
      for (let i = 0; i < rumbleLen; i++) rumbleData[i] = Math.random() * 2 - 1;
      const rumbleSrc = c.createBufferSource();
      rumbleSrc.buffer = rumbleBuf;
      rumbleSrc.loop = true;
      const rumbleFilter = c.createBiquadFilter();
      rumbleFilter.type = 'lowpass';
      rumbleFilter.frequency.value = 100;
      const rumbleGain = c.createGain();
      rumbleGain.gain.value = 0.03;
      rumbleSrc.connect(rumbleFilter).connect(rumbleGain).connect(out);
      rumbleSrc.start();
      nodes.push(rumbleSrc, rumbleFilter, rumbleGain);

    } else if (type === 'quest') {
      const drone = c.createOscillator();
      drone.type = 'sine';
      drone.frequency.value = 38.89;
      const dGain = c.createGain();
      dGain.gain.value = 0.3;
      drone.connect(dGain).connect(out);
      drone.start();
      nodes.push(drone, dGain);

      const fifth = c.createOscillator();
      fifth.type = 'sine';
      fifth.frequency.value = 57.5;
      const fGain = c.createGain();
      fGain.gain.value = 0.15;
      fifth.connect(fGain).connect(out);
      fifth.start();
      nodes.push(fifth, fGain);

      const lfo = c.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.04;
      const lGain = c.createGain();
      lGain.gain.value = 3;
      lfo.connect(lGain).connect(drone.frequency);
      lfo.start();
      nodes.push(lfo, lGain);

      const nLen = c.sampleRate * 4;
      const nBuf = c.createBuffer(1, nLen, c.sampleRate);
      const nData = nBuf.getChannelData(0);
      for (let i = 0; i < nLen; i++) nData[i] = Math.random() * 2 - 1;
      const nSrc = c.createBufferSource();
      nSrc.buffer = nBuf;
      nSrc.loop = true;
      const nFilter = c.createBiquadFilter();
      nFilter.type = 'bandpass';
      nFilter.frequency.value = 200;
      nFilter.Q.value = 3;
      const nGain = c.createGain();
      nGain.gain.value = 0.12;
      nSrc.connect(nFilter).connect(nGain).connect(out);
      nSrc.start();
      nodes.push(nSrc, nFilter, nGain);

      const nLfo = c.createOscillator();
      nLfo.type = 'sine';
      nLfo.frequency.value = 0.05;
      const nlGain = c.createGain();
      nlGain.gain.value = 0.01;
      nLfo.connect(nlGain).connect(nGain.gain);
      nLfo.start();
      nodes.push(nLfo, nlGain);

    } else if (type === 'quest_echo') {
      // Cosmic horror drone - ultra-low with tritone dissonance
      const drone = c.createOscillator();
      drone.type = 'sawtooth'; drone.frequency.value = 27.5;
      const dFilter = c.createBiquadFilter();
      dFilter.type = 'lowpass'; dFilter.frequency.value = 45; dFilter.Q.value = 3;
      const dGain = c.createGain(); dGain.gain.value = 0.05;
      drone.connect(dFilter).connect(dGain).connect(out); drone.start();
      nodes.push(drone, dFilter, dGain);

      const tri = c.createOscillator();
      tri.type = 'sine'; tri.frequency.value = 38.89;
      const tGain = c.createGain(); tGain.gain.value = 0.025;
      tri.connect(tGain).connect(out); tri.start();
      nodes.push(tri, tGain);

      const lfo = c.createOscillator();
      lfo.type = 'sine'; lfo.frequency.value = 0.02;
      const lGain = c.createGain(); lGain.gain.value = 4;
      lfo.connect(lGain).connect(drone.frequency); lfo.start();
      nodes.push(lfo, lGain);

      const metal = c.createOscillator();
      metal.type = 'square'; metal.frequency.value = 55;
      const mFilter = c.createBiquadFilter();
      mFilter.type = 'bandpass'; mFilter.frequency.value = 55; mFilter.Q.value = 20;
      const mGain = c.createGain(); mGain.gain.value = 0.006;
      metal.connect(mFilter).connect(mGain).connect(out); metal.start();
      nodes.push(metal, mFilter, mGain);

      const nLen = c.sampleRate * 5;
      const nBuf = c.createBuffer(1, nLen, c.sampleRate);
      const nData = nBuf.getChannelData(0);
      for (let i = 0; i < nLen; i++) nData[i] = Math.random() * 2 - 1;
      const nSrc = c.createBufferSource();
      nSrc.buffer = nBuf; nSrc.loop = true;
      const nFilter = c.createBiquadFilter();
      nFilter.type = 'bandpass'; nFilter.frequency.value = 150; nFilter.Q.value = 5;
      const nGain = c.createGain(); nGain.gain.value = 0.015;
      nSrc.connect(nFilter).connect(nGain).connect(out); nSrc.start();
      nodes.push(nSrc, nFilter, nGain);

      const nLfo = c.createOscillator();
      nLfo.type = 'sine'; nLfo.frequency.value = 0.08;
      const nlGain = c.createGain(); nlGain.gain.value = 0.01;
      nLfo.connect(nlGain).connect(nGain.gain); nLfo.start();
      nodes.push(nLfo, nlGain);
    }

    this._ambientNodes = nodes;
    this._ambientType = type;
  }

  stopAmbient() {
    if (!this._ambientNodes) return;
    for (const n of this._ambientNodes) {
      try {
        if (n.stop) n.stop();
        n.disconnect();
      } catch (_) {}
    }
    this._ambientNodes = null;
    this._ambientType = null;
  }

  // --- Generative Music ---

  startMusic(type = 'space') {
    if (this.muted || this.disabled) return;
    if (this._musicType === type && this._musicTimers.length) return;
    this.stopMusic();
    const c = this._ensure();
    if (!c) return;
    const cfg = MUSIC[type];
    if (!cfg) return;
    this._musicType = type;
    this._newPad(type);
    this._musicTimers.push(setInterval(() => {
      if (!this.muted) this._newPad(type);
    }, cfg.padLife * 1000));
    this._musicTimers.push(setInterval(() => {
      if (this.muted) return;
      const r = Math.random();
      if (r < cfg.noteProb) this._musicNote(type);
      else if (r < cfg.noteProb + cfg.texProb) this._musicTexture(type);
    }, cfg.tempo));
  }

  stopMusic() {
    for (const t of this._musicTimers) clearInterval(t);
    this._musicTimers = [];
    for (const n of this._musicNodes) {
      try { if (n.stop) n.stop(); n.disconnect(); } catch (_) {}
    }
    this._musicNodes = [];
    this._musicType = null;
  }

  _newPad(type) {
    const c = this._ensure();
    if (!c || this.muted) return;
    const out = this._out();
    const t = c.currentTime;
    const cfg = MUSIC[type];
    const count = 2 + Math.floor(Math.random() * 2);
    const used = new Set();
    const fadeIn = 3, fadeOut = 3;
    const total = cfg.padLife;

    for (let i = 0; i < count; i++) {
      let idx;
      do { idx = Math.floor(Math.random() * cfg.scale.length); } while (used.has(idx) && used.size < cfg.scale.length);
      used.add(idx);
      const oct = Math.floor(Math.random() * 2);
      const freq = cfg.base * Math.pow(2, cfg.scale[idx] / 12 + oct);
      const osc = c.createOscillator();
      osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 12;
      const f = c.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = cfg.filterBase + Math.random() * 100;
      f.Q.value = 0.7;
      const g = c.createGain();
      g.gain.setValueAtTime(NEAR_ZERO, t);
      g.gain.exponentialRampToValueAtTime(cfg.padVol, t + fadeIn);
      g.gain.setValueAtTime(cfg.padVol, t + total - fadeOut);
      g.gain.exponentialRampToValueAtTime(NEAR_ZERO, t + total);
      osc.connect(f).connect(g).connect(out);
      osc.start(t);
      osc.stop(t + total + 0.1);
      osc.onended = () => this._cleanup([osc, f, g]);
      this._musicNodes.push(osc, f, g);
    }
  }

  _musicNote(type) {
    const c = this._ensure();
    if (!c || this.muted) return;
    const out = this._out();
    const t = c.currentTime;
    const cfg = MUSIC[type];
    const semi = cfg.scale[Math.floor(Math.random() * cfg.scale.length)];
    const oct = 1 + Math.floor(Math.random() * 2);
    const freq = cfg.base * Math.pow(2, semi / 12 + oct);
    const dur = cfg.noteDur[0] + Math.random() * (cfg.noteDur[1] - cfg.noteDur[0]);
    const att = dur * 0.3;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    osc.detune.value = (Math.random() - 0.5) * 8;
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cfg.filterBase * 2;
    f.Q.value = 1;
    const g = c.createGain();
    g.gain.setValueAtTime(NEAR_ZERO, t);
    g.gain.exponentialRampToValueAtTime(cfg.noteVol, t + att);
    g.gain.exponentialRampToValueAtTime(NEAR_ZERO, t + dur);
    osc.connect(f).connect(g).connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.1);
    osc.onended = () => this._cleanup([osc, f, g]);
    this._musicNodes.push(osc, f, g);
  }

  _musicTexture(type) {
    const c = this._ensure();
    if (!c || this.muted) return;
    const out = this._out();
    const t = c.currentTime;
    const cfg = MUSIC[type];
    const dur = 1 + Math.random() * 2;
    if (Math.random() > 0.5) {
      const len = Math.ceil(c.sampleRate * dur);
      const buf = c.createBuffer(1, len, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 150 + Math.random() * 300;
      f.Q.value = 3 + Math.random() * 5;
      const g = c.createGain();
      g.gain.setValueAtTime(NEAR_ZERO, t);
      g.gain.exponentialRampToValueAtTime(0.015, t + dur * 0.4);
      g.gain.exponentialRampToValueAtTime(NEAR_ZERO, t + dur);
      src.connect(f).connect(g).connect(out);
      src.start(t);
      src.stop(t + dur + 0.1);
      src.onended = () => this._cleanup([src, f, g]);
      this._musicNodes.push(src, f, g);
    } else {
      const semi = cfg.scale[Math.floor(Math.random() * cfg.scale.length)];
      const freq = cfg.base * Math.pow(2, semi / 12 + 2 + Math.floor(Math.random() * 2));
      const osc = c.createOscillator();
      osc.type = 'square';
      osc.frequency.value = freq;
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = freq;
      f.Q.value = 15 + Math.random() * 10;
      const g = c.createGain();
      g.gain.setValueAtTime(cfg.noteVol * 0.3, t);
      g.gain.exponentialRampToValueAtTime(NEAR_ZERO, t + dur);
      osc.connect(f).connect(g).connect(out);
      osc.start(t);
      osc.stop(t + dur + 0.1);
      osc.onended = () => this._cleanup([osc, f, g]);
      this._musicNodes.push(osc, f, g);
    }
  }

  // --- One-shot SFX ---

  laser() {
    // Muffled pulse laser - low thump with filtered tail
    this._filteredOsc('sawtooth', 180, 0.12, 0.2, 60, 'lowpass', 400, 80);
    this._osc('sine', 55, 0.08, 0.15);
    this._noise(0.05, 0.08, { type: 'lowpass', freq: 600, sweep: 100 });
  }

  plasma() {
    // Heavy plasma discharge - bass rumble with distorted mid
    this._filteredOsc('sawtooth', 80, 0.2, 0.2, 35, 'lowpass', 200, 50);
    this._osc('sine', 45, 0.15, 0.18);
    this._noise(0.12, 0.1, { type: 'bandpass', freq: 200, Q: 3, sweep: 60 });
  }

  railgun() {
    // Massive kinetic slug - deep slam + metallic ring
    this._osc('sine', 30, 0.3, 0.3, 15);
    this._noise(0.2, 0.25, { type: 'lowpass', freq: 400, sweep: 40 });
    this._filteredOsc('square', 50, 0.25, 0.15, 20, 'lowpass', 150, 30);
    this._noise(0.1, 0.08, { type: 'bandpass', freq: 800, Q: 8, sweep: 200 });
  }

  missile() {
    // Muffled launch thud + low roar
    this._osc('sine', 40, 0.15, 0.2);
    this._noise(0.4, 0.15, { type: 'lowpass', freq: 300, sweep: 80 });
    this._filteredOsc('sawtooth', 60, 0.35, 0.08, 200, 'lowpass', 250, 600);
  }

  hit() {
    // Metal impact - short deep thud
    this._noise(0.06, 0.25, { type: 'lowpass', freq: 800, sweep: 80 });
    this._osc('sine', 60, 0.08, 0.2);
    this._filteredOsc('square', 120, 0.04, 0.1, 40, 'bandpass', 300, 80);
  }

  explosion() {
    // Massive detonation - sub-bass boom with debris
    this._osc('sine', 25, 0.5, 0.3, 12);
    this._noise(0.6, 0.3, { type: 'lowpass', freq: 600, sweep: 30 });
    this._filteredOsc('sawtooth', 40, 0.4, 0.2, 15, 'lowpass', 200, 25);
    this._noise(0.3, 0.1, { type: 'bandpass', freq: 400, Q: 2, sweep: 80 });
  }

  shield() {
    // Deep energy field hum
    this._filteredOsc('sine', 80, 0.3, 0.15, 200, 'lowpass', 300, 600);
    this._filteredOsc('sawtooth', 60, 0.25, 0.06, 120, 'lowpass', 180, 400);
    this._noise(0.15, 0.04, { type: 'bandpass', freq: 200, Q: 4 });
  }

  warp() {
    // Heavy FTL jump - subsonic ramp up then slam
    this._osc('sine', 20, 0.7, 0.2, 400);
    this._filteredOsc('sawtooth', 30, 0.6, 0.1, 300, 'lowpass', 100, 800);
    this._noise(0.7, 0.12, { type: 'lowpass', freq: 150, sweep: 2000 });
    this._osc('sine', 40, 0.4, 0.15, 15);
  }

  click() {
    // Muted mechanical click
    this._filteredOsc('square', 200, 0.03, 0.1, 80, 'lowpass', 400, 100);
    this._noise(0.02, 0.05, { type: 'lowpass', freq: 500 });
  }

  buy() {
    // Low confirmation tone
    this._arpeggio('sine', [120, 180], 0.08, 0.12, 0.12);
    this._noise(0.04, 0.03, { type: 'lowpass', freq: 300 });
  }

  sell() {
    // Deeper descending tone
    this._arpeggio('sine', [200, 150, 120], 0.06, 0.1, 0.1);
  }

  error() {
    // Low distorted buzz
    this._filteredOsc('square', 40, 0.25, 0.15, 30, 'lowpass', 100, 40);
    this._filteredOsc('sawtooth', 50, 0.2, 0.08, 35, 'lowpass', 120, 50);
  }

  powerup() {
    // Deep rising power hum
    this._arpeggio('sine', [60, 90, 120], 0.1, 0.15, 0.12);
    this._noise(0.15, 0.04, { type: 'lowpass', freq: 200, sweep: 400 });
  }

  victory() {
    // Dark triumph - low brass-like
    this._arpeggio('sawtooth', [65, 82, 98, 131], 0.12, 0.25, 0.1);
    this._osc('sine', 32, 0.5, 0.08);
  }

  defeat() {
    // Crushing descent into void
    this._filteredOsc('sawtooth', 80, 0.8, 0.12, 15, 'lowpass', 200, 20);
    this._osc('sine', 30, 0.6, 0.1, 12);
    this._noise(0.5, 0.06, { type: 'lowpass', freq: 100, sweep: 20 });
  }

  alarm() {
    // Deep pulsing klaxon
    if (this.muted || this.disabled) return;
    const c = this._ensure();
    if (!c) return;
    const out = this._out();
    const t = c.currentTime;
    for (let i = 0; i < 3; i++) {
      const o = c.createOscillator();
      const g = c.createGain();
      const f = c.createBiquadFilter();
      o.type = 'sawtooth';
      o.frequency.value = 80;
      f.type = 'lowpass';
      f.frequency.value = 200;
      g.gain.setValueAtTime(0.15, t + i * 0.2);
      g.gain.exponentialRampToValueAtTime(NEAR_ZERO, t + i * 0.2 + 0.12);
      o.connect(f).connect(g).connect(out);
      o.onended = () => this._cleanup([o, f, g]);
      o.start(t + i * 0.2);
      o.stop(t + i * 0.2 + 0.15);
    }
    this._osc('sine', 35, 0.6, 0.1);
  }

  // --- Docking sound ---

  dock() {
    if (this.muted || this.disabled) return;
    const c = this._ensure();
    if (!c) return;
    const out = this._out();
    const t = c.currentTime;

    // Mechanical clamp - heavy metallic thunk
    const clamp = c.createOscillator();
    clamp.type = 'square';
    clamp.frequency.setValueAtTime(120, t);
    clamp.frequency.exponentialRampToValueAtTime(30, t + 0.15);
    const clampF = c.createBiquadFilter();
    clampF.type = 'lowpass'; clampF.frequency.value = 250; clampF.Q.value = 3;
    const clampG = c.createGain();
    clampG.gain.setValueAtTime(0.2, t);
    clampG.gain.exponentialRampToValueAtTime(NEAR_ZERO, t + 0.2);
    clamp.connect(clampF).connect(clampG).connect(out);
    clamp.start(t); clamp.stop(t + 0.25);
    clamp.onended = () => this._cleanup([clamp, clampF, clampG]);

    // Metal stress groan
    this._filteredOsc('sawtooth', 50, 0.3, 0.08, 35, 'lowpass', 120, 40);

    // Clamp impact noise
    this._noise(0.1, 0.15, { type: 'lowpass', freq: 600, sweep: 80 });

    // Second clamp after 0.2s
    const clamp2 = c.createOscillator();
    clamp2.type = 'square';
    clamp2.frequency.setValueAtTime(90, t + 0.2);
    clamp2.frequency.exponentialRampToValueAtTime(25, t + 0.35);
    const clamp2F = c.createBiquadFilter();
    clamp2F.type = 'lowpass'; clamp2F.frequency.value = 200; clamp2F.Q.value = 4;
    const clamp2G = c.createGain();
    clamp2G.gain.setValueAtTime(NEAR_ZERO, t);
    clamp2G.gain.setValueAtTime(0.18, t + 0.2);
    clamp2G.gain.exponentialRampToValueAtTime(NEAR_ZERO, t + 0.4);
    clamp2.connect(clamp2F).connect(clamp2G).connect(out);
    clamp2.start(t + 0.2); clamp2.stop(t + 0.45);
    clamp2.onended = () => this._cleanup([clamp2, clamp2F, clamp2G]);

    // Pressurization hiss - delayed filtered noise burst
    setTimeout(() => {
      if (this.muted || this.disabled) return;
      const c2 = this._ensure();
      if (!c2) return;
      const t2 = c2.currentTime;
      const hissLen = c2.sampleRate * 0.8;
      const hissBuf = c2.createBuffer(1, hissLen, c2.sampleRate);
      const hissData = hissBuf.getChannelData(0);
      for (let i = 0; i < hissLen; i++) hissData[i] = Math.random() * 2 - 1;
      const hissSrc = c2.createBufferSource();
      hissSrc.buffer = hissBuf;
      const hissF = c2.createBiquadFilter();
      hissF.type = 'bandpass'; hissF.frequency.value = 3000; hissF.Q.value = 2;
      const hissG = c2.createGain();
      hissG.gain.setValueAtTime(NEAR_ZERO, t2);
      hissG.gain.linearRampToValueAtTime(0.06, t2 + 0.1);
      hissG.gain.exponentialRampToValueAtTime(NEAR_ZERO, t2 + 0.8);
      hissSrc.connect(hissF).connect(hissG).connect(out);
      hissSrc.start(t2); hissSrc.stop(t2 + 0.8);
      hissSrc.onended = () => this._cleanup([hissSrc, hissF, hissG]);

      // Seal confirmation tone
      this._arpeggio('sine', [100, 150], 0.15, 0.2, 0.06);
    }, 400);
  }

  // --- Radio static ---

  radioStatic() {
    if (this.muted || this.disabled) return;
    const c = this._ensure();
    if (!c) return;
    const out = this._out();
    const t = c.currentTime;
    const dur = 0.15 + Math.random() * 0.25;

    // Bandpass-filtered noise burst - radio crackle
    const len = Math.ceil(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1200 + Math.random() * 800;
    bp.Q.value = 3 + Math.random() * 4;
    const hp = c.createBiquadFilter();
    hp.type = 'highpass'; hp.frequency.value = 400;
    const g = c.createGain();
    g.gain.setValueAtTime(NEAR_ZERO, t);
    g.gain.linearRampToValueAtTime(0.04, t + 0.02);
    g.gain.setValueAtTime(0.04, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(NEAR_ZERO, t + dur);
    src.connect(bp).connect(hp).connect(g).connect(out);
    src.start(t); src.stop(t + dur);
    src.onended = () => this._cleanup([src, bp, hp, g]);

    // Faint voice-like tone underneath
    if (Math.random() > 0.4) {
      const voice = c.createOscillator();
      voice.type = 'sawtooth';
      voice.frequency.value = 200 + Math.random() * 150;
      const vf = c.createBiquadFilter();
      vf.type = 'bandpass'; vf.frequency.value = 600 + Math.random() * 400; vf.Q.value = 8;
      const vg = c.createGain();
      vg.gain.setValueAtTime(0.015, t);
      vg.gain.exponentialRampToValueAtTime(NEAR_ZERO, t + dur * 0.8);
      voice.connect(vf).connect(vg).connect(out);
      voice.start(t); voice.stop(t + dur);
      voice.onended = () => this._cleanup([voice, vf, vg]);
    }
  }

  // --- Echolocator quest SFX ---

  echoScan() {
    this._filteredOsc('sine', 800, 0.8, 0.06, 200, 'bandpass', 600, 150);
    for (let i = 1; i <= 4; i++) {
      const vol = 0.04 / i;
      const freq = 800 - i * 120;
      setTimeout(() => {
        if (!this.muted && !this.disabled) {
          this._filteredOsc('sine', freq, 0.5, vol, freq * 0.3, 'bandpass', freq * 0.8, freq * 0.2);
        }
      }, i * 150);
    }
  }

  echoWhisper() {
    this._noise(0.6, 0.04, { type: 'bandpass', freq: 400, Q: 8, sweep: 200 });
    this._filteredOsc('sawtooth', 120, 0.4, 0.02, 80, 'bandpass', 300, 150);
    this._noise(0.3, 0.02, { type: 'bandpass', freq: 800, Q: 12, sweep: 400 });
  }

  echoGlitch() {
    for (let i = 0; i < 5; i++) {
      const freq = 100 + Math.random() * 2000;
      setTimeout(() => {
        if (!this.muted && !this.disabled) {
          this._filteredOsc('square', freq, 0.04, 0.08, freq * 0.5, 'bandpass', freq, freq * 0.3);
        }
      }, i * 60);
    }
    this._noise(0.15, 0.1, { type: 'highpass', freq: 2000 });
  }

  echoReveal() {
    this._filteredOsc('sine', 100, 1.5, 0.08, 800, 'lowpass', 200, 1200);
    this._osc('sine', 200, 1.2, 0.05, 400);
    this._noise(0.8, 0.04, { type: 'lowpass', freq: 300, sweep: 1500 });
    setTimeout(() => {
      if (!this.muted && !this.disabled) {
        this._arpeggio('sine', [200, 300, 400, 600], 0.1, 0.3, 0.06);
      }
    }, 800);
  }

  // --- Titan quest SFX ---

  titanAlarm() {
    this._filteredOsc('sawtooth', 90, 0.4, 0.18, 60, 'lowpass', 200, 80);
    this._noise(0.2, 0.12, { type: 'bandpass', freq: 600, Q: 4, sweep: 200 });
    this._osc('square', 120, 0.15, 0.1, 80);
  }

  titanHeat() {
    this._noise(0.8, 0.1, { type: 'lowpass', freq: 200, sweep: 60 });
    this._filteredOsc('sawtooth', 35, 0.6, 0.08, 25, 'lowpass', 80, 40);
    this._osc('sine', 45, 0.5, 0.06, 30);
  }

  titanGeiger() {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        if (!this.muted && !this.disabled) {
          this._noise(0.02, 0.12 + Math.random() * 0.06, { type: 'highpass', freq: 2000 + Math.random() * 2000 });
        }
      }, i * (40 + Math.random() * 80));
    }
  }

  titanRelief() {
    this._filteredOsc('sine', 100, 0.6, 0.08, 200, 'lowpass', 300, 500);
    this._osc('sine', 150, 0.4, 0.05, 250);
    this._noise(0.4, 0.03, { type: 'lowpass', freq: 400, sweep: 800 });
  }

  titanExplosion() {
    this._osc('sine', 20, 0.6, 0.3, 10);
    this._noise(0.8, 0.3, { type: 'lowpass', freq: 500, sweep: 25 });
    this._filteredOsc('sawtooth', 35, 0.5, 0.2, 12, 'lowpass', 150, 20);
    this._noise(0.4, 0.15, { type: 'bandpass', freq: 300, Q: 2, sweep: 60 });
  }

  // --- Leviathan quest SFX ---

  leviathanRumble() {
    this._osc('sine', 22, 0.8, 0.15, 18);
    this._noise(0.6, 0.08, { type: 'lowpass', freq: 100, sweep: 40 });
    this._filteredOsc('sawtooth', 28, 0.7, 0.06, 20, 'lowpass', 60, 30);
  }

  leviathanHeartbeat() {
    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        if (!this.muted && !this.disabled) {
          this._osc('sine', 30, 0.15, 0.2);
          this._noise(0.08, 0.1, { type: 'lowpass', freq: 80 });
        }
      }, i * 300);
    }
  }

  leviathanWake() {
    this._osc('sine', 18, 1.2, 0.2, 60);
    this._filteredOsc('sawtooth', 25, 1.0, 0.1, 80, 'lowpass', 80, 200);
    this._noise(0.8, 0.12, { type: 'lowpass', freq: 120, sweep: 300 });
  }

  leviathanWhisper() {
    this._noise(0.5, 0.04, { type: 'bandpass', freq: 300, Q: 10, sweep: 150 });
    this._filteredOsc('sine', 80, 0.6, 0.03, 60, 'bandpass', 250, 120);
  }

  leviathanPeace() {
    this._arpeggio('sine', [55, 82, 110, 165], 0.2, 0.5, 0.06);
    this._osc('sine', 55, 1.0, 0.05);
    this._noise(0.6, 0.02, { type: 'lowpass', freq: 200, sweep: 400 });
  }

  leviathanRoar() {
    this._osc('sine', 15, 1.0, 0.3, 8);
    this._noise(1.0, 0.25, { type: 'lowpass', freq: 300, sweep: 20 });
    this._filteredOsc('sawtooth', 20, 0.8, 0.15, 10, 'lowpass', 100, 15);
    this._filteredOsc('square', 50, 0.4, 0.1, 30, 'lowpass', 150, 40);
  }

  // --- Quarantine quest SFX ---

  quarantineStatic() {
    this._noise(0.4, 0.1, { type: 'bandpass', freq: 1000 + Math.random() * 500, Q: 4, sweep: 300 });
    this._filteredOsc('square', 60, 0.2, 0.04, 40, 'lowpass', 150, 60);
  }

  quarantineAlarm() {
    this._filteredOsc('square', 100, 0.3, 0.15, 70, 'lowpass', 250, 100);
    this._osc('sine', 150, 0.2, 0.1, 100);
    this._noise(0.15, 0.08, { type: 'bandpass', freq: 800, Q: 6 });
  }

  quarantineRelief() {
    this._arpeggio('sine', [100, 150, 200], 0.15, 0.3, 0.08);
    this._noise(0.3, 0.03, { type: 'lowpass', freq: 500, sweep: 1000 });
  }

  // --- Blackbox quest SFX ---

  blackboxBeacon() {
    this._filteredOsc('sine', 600, 0.3, 0.06, 400, 'bandpass', 500, 300);
    setTimeout(() => {
      if (!this.muted && !this.disabled) this._filteredOsc('sine', 600, 0.3, 0.04, 400, 'bandpass', 500, 300);
    }, 400);
  }

  blackboxStatic() {
    this._noise(0.5, 0.08, { type: 'bandpass', freq: 800, Q: 3, sweep: 200 });
    this._filteredOsc('sawtooth', 50, 0.3, 0.03, 35, 'lowpass', 100, 50);
  }

  blackboxAlarm() {
    this._filteredOsc('square', 70, 0.25, 0.12, 50, 'lowpass', 180, 70);
    this._noise(0.15, 0.1, { type: 'lowpass', freq: 400, sweep: 100 });
  }

  blackboxSilence() {
    this._osc('sine', 40, 0.8, 0.03, 35);
    this._noise(0.5, 0.015, { type: 'lowpass', freq: 60, sweep: 30 });
  }

  blackboxRelief() {
    this._arpeggio('sine', [80, 120, 160, 200], 0.12, 0.3, 0.06);
    this._osc('sine', 80, 0.6, 0.04);
  }

  // --- Noir quest SFX ---

  noirAmbient() {
    this._filteredOsc('sawtooth', 55, 0.8, 0.04, 45, 'lowpass', 120, 60);
    this._noise(0.5, 0.03, { type: 'lowpass', freq: 180, sweep: 80 });
  }

  noirTension() {
    this._filteredOsc('sawtooth', 40, 0.5, 0.08, 60, 'lowpass', 100, 200);
    this._osc('sine', 30, 0.4, 0.06, 45);
    this._noise(0.3, 0.06, { type: 'lowpass', freq: 250, sweep: 100 });
  }

  noirAsteroids() {
    this._noise(0.3, 0.15, { type: 'lowpass', freq: 400, sweep: 60 });
    this._osc('sine', 50, 0.2, 0.1, 25);
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        if (!this.muted && !this.disabled) this._noise(0.05, 0.1, { type: 'bandpass', freq: 300 + Math.random() * 400, Q: 5 });
      }, i * 100);
    }
  }

  noirRelief() {
    this._arpeggio('sine', [65, 98, 131], 0.15, 0.4, 0.07);
    this._osc('sine', 65, 0.6, 0.04);
  }

  // --- Mirror quest SFX ---

  mirrorChime() {
    this._arpeggio('sine', [523, 659, 784, 1047], 0.08, 0.4, 0.04);
    this._filteredOsc('sine', 262, 0.6, 0.03, 524, 'bandpass', 400, 800);
  }

  mirrorWhisper() {
    this._noise(0.6, 0.035, { type: 'bandpass', freq: 400, Q: 12, sweep: 200 });
    this._filteredOsc('sine', 150, 0.5, 0.02, 100, 'bandpass', 300, 150);
    this._filteredOsc('sine', 220, 0.4, 0.015, 180, 'bandpass', 350, 200);
  }

  // --- Tribunal quest SFX ---

  tribunalGavel() {
    this._noise(0.08, 0.2, { type: 'lowpass', freq: 500, sweep: 60 });
    this._osc('sine', 60, 0.12, 0.15);
    this._filteredOsc('square', 80, 0.08, 0.08, 40, 'lowpass', 200, 60);
  }

  // --- Oxygen quest SFX ---

  oxygenAlarm() {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (!this.muted && !this.disabled) {
          this._filteredOsc('square', 100, 0.12, 0.14, 80, 'lowpass', 200, 100);
        }
      }, i * 180);
    }
  }

  oxygenBeep() {
    this._osc('sine', 800, 0.08, 0.06);
    setTimeout(() => { if (!this.muted && !this.disabled) this._osc('sine', 800, 0.08, 0.06); }, 200);
  }

  oxygenSilence() {
    this._osc('sine', 30, 0.5, 0.02, 25);
  }

  oxygenRelief() {
    this._noise(0.5, 0.08, { type: 'bandpass', freq: 2000, Q: 2, sweep: 500 });
    this._arpeggio('sine', [150, 200, 300], 0.1, 0.25, 0.06);
  }

  // --- Silence quest SFX ---

  silenceHum() {
    this._filteredOsc('sine', 40, 1.2, 0.05, 35, 'lowpass', 60, 40);
    this._osc('sine', 60, 0.8, 0.025, 55);
  }

  silenceVoice() {
    this._noise(0.4, 0.04, { type: 'bandpass', freq: 350, Q: 15, sweep: 200 });
    this._filteredOsc('sawtooth', 120, 0.5, 0.025, 90, 'bandpass', 400, 200);
  }

  silenceRelief() {
    this._arpeggio('sine', [110, 165, 220], 0.2, 0.5, 0.05);
    this._osc('sine', 55, 0.8, 0.04);
  }

  silenceFade() {
    this._filteredOsc('sine', 60, 1.5, 0.06, 20, 'lowpass', 100, 25);
    this._noise(0.8, 0.02, { type: 'lowpass', freq: 80, sweep: 20 });
  }

  // --- System-type ambient layers ---

  startSystemLayer(type) {
    if (this.muted || this.disabled) return;
    this.stopSystemLayer();
    const methods = {
      military: '_radarPing',
      pirate: '_scannerSweep',
      industrial: '_machineClank',
      mining: '_drillPulse',
      tech: '_dataChirp',
      research: '_scanTone',
    };
    const method = methods[type];
    if (!method || !this[method]) return;
    this[method]();
    const intervals = {
      military: 4000,
      pirate: 5000,
      industrial: 3000,
      mining: 3500,
      tech: 4500,
      research: 6000,
    };
    this._systemLayerTimer = setInterval(() => {
      if (!this.muted && !this.disabled) this[method]();
    }, intervals[type] || 4000);
    this._systemLayerType = type;
  }

  stopSystemLayer() {
    if (this._systemLayerTimer) {
      clearInterval(this._systemLayerTimer);
      this._systemLayerTimer = null;
    }
    this._systemLayerType = null;
  }

  _radarPing() {
    // Sharp sonar-like ping with long decay
    this._filteredOsc('sine', 1200, 0.6, 0.04, 800, 'bandpass', 1000, 600);
    this._osc('sine', 1100, 0.08, 0.05);
  }

  _scannerSweep() {
    // Ominous low sweep - something scanning you
    this._filteredOsc('sawtooth', 60, 0.5, 0.03, 200, 'lowpass', 120, 400);
    this._noise(0.3, 0.02, { type: 'bandpass', freq: 300, Q: 5, sweep: 100 });
  }

  _machineClank() {
    // Metallic industrial clank
    this._noise(0.04, 0.08, { type: 'bandpass', freq: 800 + Math.random() * 600, Q: 8 });
    this._osc('square', 60 + Math.random() * 30, 0.06, 0.04);
    if (Math.random() > 0.5) {
      this._filteredOsc('square', 200, 0.08, 0.03, 80, 'bandpass', 400, 150);
    }
  }

  _drillPulse() {
    // Low grinding pulse
    this._filteredOsc('sawtooth', 40, 0.3, 0.05, 55, 'lowpass', 100, 150);
    this._noise(0.15, 0.04, { type: 'lowpass', freq: 250, sweep: 100 });
    this._osc('sine', 30, 0.2, 0.03);
  }

  _dataChirp() {
    // Digital data transmission chirp
    const freqs = [];
    for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) {
      freqs.push(400 + Math.random() * 800);
    }
    this._arpeggio('square', freqs, 0.04, 0.05, 0.02);
  }

  _scanTone() {
    // Slow ethereal scanning tone
    this._filteredOsc('sine', 300 + Math.random() * 200, 1.2, 0.025, 150, 'lowpass', 500, 200);
    this._osc('triangle', 200 + Math.random() * 100, 0.8, 0.015);
  }

  startEngine(shipType, idle = false) {
    if (this.muted || this.disabled) return;
    if (this._engineType === shipType && this._engineNodes) return;
    this.stopEngine();
    const c = this._ensure();
    if (!c) return;
    const out = this._out();
    const nodes = [];
    const v = idle ? 0.4 : 1;

    const makeNoise = (dur, filterType, filterFreq, vol) => {
      const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const f = c.createBiquadFilter();
      f.type = filterType;
      f.frequency.value = filterFreq;
      const g = c.createGain();
      g.gain.value = vol * v;
      src.connect(f).connect(g).connect(out);
      src.start();
      nodes.push(src, f, g);
      return { src, filter: f, gain: g };
    };

    const makeOsc = (type, freq, vol, filterType, filterFreq, filterQ) => {
      const osc = c.createOscillator();
      osc.type = type;
      osc.frequency.value = freq;
      const g = c.createGain();
      g.gain.value = vol * v;
      if (filterType) {
        const f = c.createBiquadFilter();
        f.type = filterType;
        f.frequency.value = filterFreq;
        if (filterQ) f.Q.value = filterQ;
        osc.connect(f).connect(g).connect(out);
        nodes.push(osc, f, g);
      } else {
        osc.connect(g).connect(out);
        nodes.push(osc, g);
      }
      osc.start();
      return { osc, gain: g };
    };

    const makeLfo = (freq, target, amount) => {
      const lfo = c.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = freq;
      const lg = c.createGain();
      lg.gain.value = amount;
      lfo.connect(lg).connect(target);
      lfo.start();
      nodes.push(lfo, lg);
    };

    if (shipType === 'scout') {
      const p = makeOsc('sine', 800, 0.04, 'bandpass', 900, 3);
      makeLfo(6, p.osc.frequency, 30);
      makeOsc('triangle', 1200, 0.02, 'bandpass', 1400);
      makeNoise(2, 'highpass', 2000, 0.015);

    } else if (shipType === 'trader') {
      makeOsc('sawtooth', 80, 0.06, 'lowpass', 120);
      makeOsc('sine', 60, 0.03);
      const n = makeNoise(2, 'lowpass', 200, 0.025);
      makeLfo(0.5, n.gain.gain, 0.012);

    } else if (shipType === 'fighter') {
      const p = makeOsc('sawtooth', 120, 0.07, 'bandpass', 200, 4);
      makeLfo(3, p.osc.frequency, 20);
      makeOsc('square', 180, 0.03, 'lowpass', 250);
      makeNoise(2, 'bandpass', 600, 0.05);

    } else if (shipType === 'cruiser') {
      makeOsc('sine', 50, 0.05);
      makeOsc('sawtooth', 55, 0.03, 'lowpass', 70);
      makeOsc('sine', 100, 0.02);
      const n = makeNoise(2, 'lowpass', 100, 0.02);
      makeLfo(0.2, n.gain.gain, 0.01);

    } else if (shipType === 'freighter') {
      const p = makeOsc('square', 35, 0.06, 'lowpass', 50, 5);
      const lfo = c.createOscillator();
      lfo.type = 'square';
      lfo.frequency.value = 1.5;
      const lg = c.createGain();
      lg.gain.value = 0.03 * v;
      lfo.connect(lg).connect(p.gain.gain);
      lfo.start();
      nodes.push(lfo, lg);
      makeOsc('sawtooth', 70, 0.025, 'lowpass', 90);
      makeNoise(2, 'lowpass', 150, 0.03);

    } else if (shipType === 'phantom') {
      makeOsc('sine', 300, 0.015);
      makeOsc('sine', 307, 0.015);
      const n = makeNoise(2, 'bandpass', 400, 0.01);
      makeLfo(0.1, n.filter.frequency, 200);

    } else if (shipType === 'titan') {
      makeOsc('sine', 22, 0.08);
      makeOsc('sawtooth', 30, 0.04, 'lowpass', 40);
      makeOsc('sine', 44, 0.03);
      const n = makeNoise(2, 'lowpass', 60, 0.04);
      makeLfo(0.15, n.gain.gain, 0.02);

    } else {
      makeOsc('sawtooth', 80, 0.04, 'lowpass', 120);
      makeNoise(2, 'lowpass', 200, 0.02);
    }

    this._engineNodes = nodes;
    this._engineType = shipType;
  }

  stopEngine() {
    if (!this._engineNodes) return;
    for (const n of this._engineNodes) {
      try { if (n.stop) n.stop(); n.disconnect(); } catch (_) {}
    }
    this._engineNodes = null;
    this._engineType = null;
  }
}
