// 打工：關卡中找到老闆娘就能開始。餐點從右邊滑向出餐線，按對應數字鍵出餐；越來越快、連擊加倍，只加錢不扣錢
// 打工時關卡時間照走、客人耐心照扣（由 GameScene 繼續更新），工資在結束時加進關卡收入
NM.WorkScene = class {
  constructor(game) {
    this.game = game;
    this.foods = game.level.stalls; // 只出這一關有開的餐點，數字鍵 1～N 依序對應
    this.state = 'ready'; // ready | play | done
    this.countdown = 2;
    this.elapsed = 0;
    this.money = 0;
    this.items = [];
    this.spawnTimer = 0;
    this.combo = 0;
    this.stats = { hits: 0, wrong: 0, misses: 0, bestCombo: 0 };
    this.floats = [];
    this.bursts = [];
    this.shake = 0;
    this.keyFlash = {}; // 數字鍵按下的閃光 { index: { t, ok } }
  }

  get progress() {
    return Math.min(1, this.elapsed / NM.config.work.duration);
  }

  get mult() {
    return 1 + NM.config.work.comboSteps.filter((s) => this.combo >= s).length;
  }

  get finished() {
    return this.state === 'closed';
  }

  // ---------- 更新 ----------
  update(dt) {
    const inp = NM.input;
    for (const f of this.floats) f.t += dt;
    this.floats = this.floats.filter((f) => f.t < 0.9);
    for (const b of this.bursts) b.t += dt;
    this.bursts = this.bursts.filter((b) => b.t < 0.4);
    for (const k in this.keyFlash) {
      this.keyFlash[k].t -= dt;
      if (this.keyFlash[k].t <= 0) delete this.keyFlash[k];
    }
    this.shake = Math.max(0, this.shake - dt);

    if (this.state === 'done') {
      if (inp.wasPressed('confirm') || inp.wasPressed('action')) this.state = 'closed';
      return;
    }
    // 提早下班，已賺的照拿
    if (inp.wasPressed('pause')) return this.end();
    if (this.state === 'ready') {
      this.countdown -= dt;
      if (this.countdown <= 0) {
        this.state = 'play';
        NM.audio.play('start');
      }
      return;
    }

    const w = NM.config.work;
    this.elapsed += dt;
    if (this.elapsed >= w.duration) return this.end();

    const k = this.progress;
    const speed = w.speedStart + (w.speedEnd - w.speedStart) * k;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = (w.spawnStart + (w.spawnEnd - w.spawnStart) * k) * (0.75 + Math.random() * 0.5);
      // 前後兩份不要同一種，避免連按同一鍵
      let food = pick(this.foods);
      const last = this.items[this.items.length - 1];
      if (last && last.food === food) food = pick(this.foods.filter((f) => f !== food));
      this.items.push({ food, x: NM.config.width + 60, gold: Math.random() < w.goldChance });
    }
    for (const it of this.items) it.x -= speed * dt;

    // 越過出餐線 = 漏接（不扣錢，只中斷連擊）
    while (this.items.length && this.items[0].x < w.hitX) {
      this.items.shift();
      this.combo = 0;
      this.stats.misses++;
      this.float('漏單', w.hitX, 250, '#ff8c69');
      NM.audio.play('workMiss');
    }

    for (let i = 0; i < this.foods.length; i++) {
      if (inp.wasPressed(String(i + 1))) this.press(i);
    }
  }

  end() {
    this.state = 'done';
    NM.audio.play('levelClear');
  }

  press(i) {
    const w = NM.config.work;
    const front = this.items[0];
    if (!front) return;
    if (this.foods[i] === front.food) {
      this.items.shift();
      this.combo++;
      this.stats.hits++;
      this.stats.bestCombo = Math.max(this.stats.bestCombo, this.combo);
      const earn = w.pay * this.mult * (front.gold ? w.goldMult : 1);
      this.money += earn;
      this.keyFlash[i] = { t: 0.15, ok: true };
      this.bursts.push({ x: front.x, gold: front.gold, t: 0 });
      this.float(`+$${earn}`, front.x, 250, front.gold ? '#ffd700' : '#7dff7d');
      // 連擊剛好升級倍率時給一段上揚音
      NM.audio.play(w.comboSteps.includes(this.combo) ? 'combo' : 'workHit', this.combo);
    } else {
      this.combo = 0;
      this.stats.wrong++;
      this.shake = 0.25;
      this.keyFlash[i] = { t: 0.25, ok: false };
      this.float('按錯了！', front.x, 250, '#ff6b6b');
      NM.audio.play('wrong');
    }
  }

  float(text, x, y, color) {
    this.floats.push({ text, x, y, color, t: 0 });
  }

  // ---------- 繪製（疊在夜市畫面上） ----------
  draw(ctx) {
    const a = NM.assets, d = NM.draw;
    const W = NM.config.width, H = NM.config.height;
    const w = NM.config.work;

    ctx.fillStyle = 'rgba(10, 12, 35, 0.72)';
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    if (this.shake > 0) ctx.translate(Math.sin(this.shake * 80) * 6, 0);

    // 出餐檯
    const laneY = 330;
    d.panel(ctx, 40, laneY - 70, W - 80, 140, { fill: 'rgba(110, 62, 30, 0.92)', border: '#ffb347', radius: 16 });
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    for (let x = 60; x < W - 60; x += 40) ctx.fillRect(x, laneY - 60, 20, 120);

    // 出餐線
    ctx.save();
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 5;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(w.hitX, laneY - 70);
    ctx.lineTo(w.hitX, laneY + 70);
    ctx.stroke();
    ctx.restore();
    d.text(ctx, '出餐線', w.hitX, laneY + 92, { size: 16, color: '#ffe066' });

    // 老闆娘與玩家站在出餐線左邊
    a.drawSprite(ctx, 'characters/crowd_2', 95, laneY + 75, 120);
    a.drawSprite(ctx, 'characters/player', 175, laneY + 75, 115);

    // 餐點
    this.items.forEach((it, idx) => {
      const front = idx === 0;
      ctx.save();
      ctx.beginPath();
      ctx.arc(it.x, laneY, 42, 0, Math.PI * 2);
      ctx.fillStyle = it.gold ? '#fff3b0' : '#fffbe9';
      ctx.fill();
      ctx.lineWidth = front ? 5 : 3;
      ctx.strokeStyle = it.gold ? '#ffb300' : front ? '#ffe066' : '#1a1d3a';
      if (front) {
        ctx.shadowColor = '#ffe066';
        ctx.shadowBlur = 18;
      }
      ctx.stroke();
      ctx.restore();
      a.drawFit(ctx, `food/${it.food}`, it.x, laneY, 58, 58);
      if (it.gold) d.text(ctx, `×${w.goldMult}`, it.x + 34, laneY - 34, { size: 16, color: '#ffd700' });
    });

    for (const b of this.bursts) {
      const k = b.t / 0.4;
      ctx.save();
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = b.gold ? '#ffd700' : '#7dff7d';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(b.x, laneY, 42 + k * 40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    this.drawKeys(ctx);
    this.drawHUD(ctx);

    for (const f of this.floats) {
      const k = f.t / 0.9;
      ctx.save();
      ctx.globalAlpha = 1 - k;
      d.text(ctx, f.text, f.x, f.y - k * 40, { size: 22, color: f.color });
      ctx.restore();
    }

    if (this.state === 'ready') this.drawReady(ctx);
    if (this.state === 'done') this.drawDone(ctx);
  }

  // 數字鍵對照表
  drawKeys(ctx) {
    const a = NM.assets, d = NM.draw;
    const W = NM.config.width;
    const n = this.foods.length;
    const kw = 128, gap = 12;
    const x0 = (W - (n * kw + (n - 1) * gap)) / 2, y = 470;
    this.foods.forEach((food, i) => {
      const x = x0 + i * (kw + gap);
      const fl = this.keyFlash[i];
      const border = fl ? (fl.ok ? '#7dff7d' : '#ff4d4d') : '#555a8a';
      d.panel(ctx, x, y, kw, 150, { fill: fl ? '#3a3f70' : '#2a2e55', border, radius: 12, lineWidth: fl ? 5 : 3 });
      d.text(ctx, String(i + 1), x + kw / 2, y + 38, { size: 32, color: '#ffe066' });
      a.drawFit(ctx, `food/${food}`, x + kw / 2, y + 88, 64, 52);
      d.text(ctx, NM.config.foods[food].name, x + kw / 2, y + 138, { size: 15, color: '#ffe9b0' });
    });
  }

  drawHUD(ctx) {
    const a = NM.assets, d = NM.draw;
    const W = NM.config.width;
    const w = NM.config.work;
    const g = this.game;

    d.text(ctx, '打工：幫老闆娘出餐', 40, 50, { size: 30, color: '#ffb347', align: 'left' });
    d.text(ctx, '按數字鍵出「最前面」那份餐・Esc 提早下班', 40, 82, { size: 16, color: '#bbb', align: 'left' });

    // 打工計時條
    const left = Math.max(0, w.duration - this.elapsed);
    d.bar(ctx, 470, 40, 340, 16, left / w.duration);
    d.text(ctx, `打工剩 ${Math.ceil(left)} 秒`, 640, 90, { size: 20, color: left <= 5 ? '#ff6b6b' : '#fff' });

    // 提醒：關卡時間跟客人都還在跑
    const waiting = g.customers.filter((c) => c.waiting).length;
    const t = Math.ceil(g.timeLeft);
    d.text(ctx, `夜市還剩 ${t} 秒・${waiting} 位客人在等`, 640, 130, { size: 18, color: waiting ? '#ff8c69' : '#bbb' });

    a.drawFit(ctx, 'ui/coin', W - 230, 46, 30, 30);
    d.text(ctx, `工資 ${d.money(this.money)}`, W - 205, 56, { size: 26, color: '#ffe9b0', align: 'left' });
    if (this.combo >= 2) {
      const m = this.mult;
      d.text(ctx, `${this.combo} 連擊${m > 1 ? `　工資 ×${m}` : ''}`, W - 40, 100, { size: 22, color: m > 1 ? '#ffd700' : '#7dff7d', align: 'right' });
    }
  }

  drawReady(ctx) {
    const W = NM.config.width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, W, 450);
    NM.draw.text(ctx, '記好數字鍵對應的餐點！', W / 2, 200, { size: 30, color: '#ffe9b0' });
    NM.draw.text(ctx, String(Math.ceil(this.countdown)), W / 2, 330, { size: 110, color: '#ffe066', strokeWidth: 8 });
  }

  drawDone(ctx) {
    const d = NM.draw;
    const W = NM.config.width, H = NM.config.height;
    const s = this.stats;
    ctx.fillStyle = 'rgba(10, 12, 35, 0.8)';
    ctx.fillRect(0, 0, W, H);
    d.panel(ctx, W / 2 - 260, 140, 520, 420);
    d.text(ctx, '下班囉！', W / 2, 205, { size: 44, color: '#7dff7d' });
    d.text(ctx, `工資 ${d.money(this.money)} 加進這關收入`, W / 2, 265, { size: 26, color: '#ffe9b0' });
    const rows = [
      ['出餐', `${s.hits} 份`],
      ['最高連擊', `${s.bestCombo}`],
      ['按錯／漏單', `${s.wrong}／${s.misses}`],
    ];
    rows.forEach(([k, v], i) => {
      const y = 330 + i * 44;
      d.text(ctx, k, W / 2 - 160, y, { size: 22, color: '#bbb', align: 'left' });
      d.text(ctx, v, W / 2 + 160, y, { size: 22, align: 'right' });
    });
    d.text(ctx, 'Enter／空白鍵 回到夜市', W / 2, 520, { size: 22, color: '#ffe066' });
  }
};
