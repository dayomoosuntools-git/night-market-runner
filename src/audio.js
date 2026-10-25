// 音效與背景音樂：用 Web Audio 即時合成，不需要音檔，雙擊 index.html 也能播
// 遊戲各處呼叫 NM.audio.play('事件名')；背景音樂用 NM.audio.music('title' | 'game' | 'work' | null)
// 想換成真的音檔：在 manifest.json 的 "audio" 填 { "deliver": "assets/audio/deliver.mp3" }，有檔案的事件會優先播檔案
NM.audio = {
  ctx: null,
  master: null,
  sfxBus: null,
  musicBus: null,
  files: {},
  muted: false,
  volume: { sfx: 1.2, music: 0.4 },   // 音效、背景音樂的音量

  // 音樂狀態
  track: null,
  pending: null,   // 解鎖前就要求的曲目
  step: 0,
  nextTime: 0,
  timer: null,
  rush: false,     // 最後倒數時加快節奏

  load() {
    for (const [name, src] of Object.entries(NM.manifest.audio || {})) this.files[name] = new Audio(src);
    try {
      this.muted = localStorage.getItem('nm-muted') === '1';
    } catch (e) { /* 忽略 */ }
  },

  // 瀏覽器規定要等玩家第一次按鍵後才能出聲
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = this.volume.sfx;
    this.sfxBus.connect(this.master);
    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = this.volume.music;
    this.musicBus.connect(this.master);
    if (this.pending !== null) this.music(this.pending);
  },

  toggleMute() {
    this.muted = !this.muted;
    try {
      localStorage.setItem('nm-muted', this.muted ? '1' : '0');
    } catch (e) { /* 忽略 */ }
    if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 1, this.ctx.currentTime, 0.03);
  },

  // ---------- 合成小工具 ----------
  // 單音：頻率可以滑到 slide，帶簡單的 attack / decay 包絡
  tone(freq, dur, { type = 'triangle', vol = 0.5, slide = null, delay = 0, bus = this.sfxBus } = {}) {
    const c = this.ctx;
    const t = c.currentTime + delay;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(bus);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  },

  // 白噪音：打擊、丟東西、沙沙聲
  noise(dur, { vol = 0.3, delay = 0, freq = 3000, bus = this.sfxBus, at = null } = {}) {
    const c = this.ctx;
    const t = at ?? c.currentTime + delay;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(bus);
    src.start(t);
  },

  // 依序彈一串音：notes = [[頻率, 開始秒, 長度], ...]
  seq(notes, opts = {}) {
    for (const [f, d, len] of notes) this.tone(f, len, { ...opts, delay: d });
  },

  // ---------- 音效 ----------
  sfx: {
    pickup(a) { a.seq([[660, 0, 0.08], [990, 0.06, 0.12]], { type: 'square', vol: 0.18 }); },
    deliver(a) {
      a.seq([[988, 0, 0.09], [1319, 0.08, 0.28]], { type: 'square', vol: 0.16 });
      a.tone(2637, 0.25, { type: 'sine', vol: 0.08, delay: 0.1 });
    },
    wrong(a) { a.tone(180, 0.28, { type: 'sawtooth', vol: 0.18, slide: 120 }); },
    full(a) { a.seq([[220, 0, 0.09], [220, 0.13, 0.09]], { type: 'square', vol: 0.15 }); },
    discard(a) {
      a.noise(0.18, { vol: 0.35, freq: 800 });
      a.tone(400, 0.25, { type: 'triangle', vol: 0.2, slide: 110 });
    },
    timeout(a) { a.seq([[523, 0, 0.14], [440, 0.13, 0.14], [349, 0.26, 0.3]], { type: 'triangle', vol: 0.22 }); },
    queue(a) { a.tone(1200, 0.05, { type: 'sine', vol: 0.15 }); },
    tick(a) { a.tone(1500, 0.05, { type: 'square', vol: 0.08 }); },
    select(a) { a.tone(880, 0.05, { type: 'square', vol: 0.1 }); },
    start(a) { a.seq([[523, 0, 0.1], [784, 0.1, 0.18]], { type: 'square', vol: 0.15 }); },
    levelClear(a) {
      a.seq([[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.12], [1047, 0.36, 0.45]], { type: 'square', vol: 0.18 });
      a.seq([[262, 0, 0.36], [392, 0.36, 0.45]], { type: 'triangle', vol: 0.2 });
    },
    levelFail(a) {
      a.seq([[392, 0, 0.2], [370, 0.2, 0.2], [349, 0.4, 0.2], [262, 0.6, 0.6]], { type: 'triangle', vol: 0.24 });
    },
    // 老闆娘出現：叮咚門鈴
    boss(a) { a.seq([[1319, 0, 0.3], [1047, 0.22, 0.45]], { type: 'sine', vol: 0.25 }); },
    shopOpen(a) { a.seq([[1568, 0, 0.12], [1976, 0.08, 0.12], [2349, 0.16, 0.25]], { type: 'sine', vol: 0.18 }); },
    buy(a) {
      a.noise(0.06, { vol: 0.2, freq: 5000 });
      a.seq([[1319, 0.04, 0.08], [1760, 0.1, 0.3]], { type: 'square', vol: 0.14 });
    },
    magic(a) {
      for (let i = 0; i < 8; i++) a.tone(700 + i * 180, 0.12, { type: 'sine', vol: 0.12, delay: i * 0.04 });
    },
    // 打工：接對的音高隨連擊升高
    workHit(a, combo = 0) {
      const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
      const n = scale[Math.min(combo, scale.length - 1)];
      a.tone(523 * Math.pow(2, n / 12), 0.12, { type: 'square', vol: 0.13 });
    },
    workMiss(a) { a.tone(200, 0.12, { type: 'triangle', vol: 0.15, slide: 160 }); },
    combo(a) { a.seq([[1047, 0, 0.08], [1319, 0.07, 0.08], [1568, 0.14, 0.2]], { type: 'square', vol: 0.13 }); },
  },

  play(name, arg) {
    if (this.muted) return;
    const file = this.files[name];
    if (file) {
      file.cloneNode().play().catch(() => {});
      return;
    }
    if (!this.ctx || this.ctx.state !== 'running') return;
    const fn = this.sfx[name];
    if (fn) fn(this, arg);
  },

  // ---------- 背景音樂：16 拍一循環的小編曲，五聲音階帶夜市感 ----------
  tracks: {
    // 0 = 休止；數字是 C 大調五聲音階的級數（0 起算）
    title: {
      bpm: 92,
      melody: [4, 0, 3, 0, 2, 0, 1, 2, 3, 0, 2, 0, 1, 0, 0, 0, 2, 0, 3, 0, 4, 0, 5, 4, 3, 0, 2, 0, 1, 0, 0, 0],
      bass: [0, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 3, 0, 0, 0],
      drums: false,
    },
    game: {
      bpm: 128,
      melody: [3, 4, 5, 0, 5, 4, 3, 0, 2, 3, 4, 0, 2, 0, 1, 0, 3, 4, 5, 0, 6, 5, 4, 0, 3, 2, 1, 0, 2, 0, 3, 0],
      bass: [0, 0, 4, 0, 3, 0, 4, 0, 0, 0, 4, 0, 3, 0, 1, 0],
      drums: true,
    },
    work: {
      bpm: 150,
      melody: [5, 0, 5, 6, 5, 0, 3, 0, 4, 0, 4, 5, 4, 0, 2, 0, 3, 0, 3, 4, 3, 0, 1, 0, 2, 3, 4, 5, 6, 0, 0, 0],
      bass: [0, 0, 0, 0, 4, 0, 4, 0, 3, 0, 3, 0, 1, 0, 1, 0],
      drums: true,
    },
  },

  music(name) {
    this.pending = name;
    this.rush = false;
    if (!this.ctx) return;
    if (this.track === name) return;
    this.track = name;
    clearInterval(this.timer);
    this.timer = null;
    if (!name) return;
    this.step = 0;
    this.nextTime = this.ctx.currentTime + 0.1;
    this.timer = setInterval(() => this.schedule(), 25);
  },

  // 預先排好接下來 0.15 秒內的音符，節奏才會穩
  schedule() {
    const tr = this.tracks[this.track];
    if (!tr || !this.ctx) return;
    const pent = [262, 294, 330, 392, 440, 523, 587, 659];
    const stepLen = 60 / (tr.bpm * (this.rush ? 1.18 : 1)) / 2; // 八分音符
    while (this.nextTime < this.ctx.currentTime + 0.15) {
      const i = this.step;
      const t = this.nextTime;
      const delay = Math.max(0, t - this.ctx.currentTime);
      const m = tr.melody[i % tr.melody.length];
      if (m) this.tone(pent[m] * 2, stepLen * 1.6, { type: 'square', vol: 0.09, delay, bus: this.musicBus });
      if (i % 2 === 0) {
        const b = tr.bass[(i / 2) % tr.bass.length];
        if (b || i % 8 === 0) this.tone(pent[b] / 2, stepLen * 1.8, { type: 'triangle', vol: 0.32, delay, bus: this.musicBus });
      }
      if (tr.drums) {
        if (i % 4 === 0) this.tone(120, 0.12, { type: 'sine', vol: 0.5, slide: 50, delay, bus: this.musicBus });
        if (i % 4 === 2) this.noise(0.08, { vol: 0.25, freq: 2000, at: t, bus: this.musicBus });
        this.noise(0.03, { vol: 0.08, freq: 8000, at: t, bus: this.musicBus });
      }
      this.step++;
      this.nextTime += stepLen;
    }
  },
};
