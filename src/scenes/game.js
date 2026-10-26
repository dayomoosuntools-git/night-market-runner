// 遊戲主場景：接單 → 到攤位取餐 → 交給指定客人；時間內賺到目標金額就過關
NM.GameScene = class {
  // items：從上一關帶過來的商店道具；從標題進來或重玩都是全新的，不累計之前買的
  constructor(levelIndex, items = NM.GameScene.noItems()) {
    const cfg = NM.config;
    this.levelIndex = levelIndex;
    this.level = cfg.levels[levelIndex];
    this.timeLeft = this.level.duration;
    this.money = 0;
    this.stats = { delivered: 0, timeouts: 0, wrong: 0, discards: 0, wasted: 0, penalties: 0, workPay: 0, spent: 0 };

    this.items = { ...items }; // shoes 跑鞋等級、bag 外送箱等級、magic 百寶袋數量
    this.player = new NM.Player(cfg.player.start.x, cfg.player.start.y, this.items);
    // 上一關沒開、這一關才開的攤位算「新開張」
    const prev = levelIndex > 0 ? cfg.levels[levelIndex - 1].stalls : this.level.stalls;
    this.stalls = cfg.stalls.map((s) => new NM.Stall({
      ...s,
      open: this.level.stalls.includes(s.food),
      isNew: !prev.includes(s.food),
    }));
    const fresh = this.stalls.filter((s) => s.open && s.isNew);
    // 關掉操作說明後，畫面中間公告新開的攤位在哪一排
    this.newsTime = fresh.length ? 5 : 0;
    this.news = fresh.map((s) => `${cfg.foods[s.food].name}（${s.row === 'top' ? '上排' : '下排'}）`).join('、');
    this.trashCans = cfg.trashCans.map((t) => ({ ...t, radius: 22 }));
    this.customers = [];
    this.crowd = Array.from({ length: this.level.crowd || 0 }, () => new NM.Crowd(true));
    this.nextId = 1;
    this.spawnTimer = 1.2;
    this.queueTimer = this.level.queueEvery;
    this.waitingAt = null; // { stall, t } 排隊等待中
    this.floats = [];
    this.target = null;
    this.paused = false;
    this.help = new NM.HelpPanel(this.level); // 開場先看操作說明，玩家按關閉才開始計時
    this.magicTime = 0;   // 百寶袋剩餘秒數
    // 打工事件：老闆娘出現的時間點，boss 是正在街上等人的老闆娘，work 是進行中的打工
    const scale = this.level.duration / 90;
    this.workTimes = cfg.work.eventTimes.map((t) => (t + (Math.random() * 8 - 4)) * scale);
    this.boss = null;
    this.work = null;
    // 商店攤：固定在上排中間，隨時可以光顧；shop 是打開中的商店面板
    const k = cfg.shop.kiosk;
    const lay = cfg.stallLayout[k.row];
    this.kiosk = { x: k.x, baseline: lay.baseline, height: k.height, point: { x: k.x, y: cfg.street.top } };
    this.shop = null;
    NM.audio.music('game');
    NM.stats.recordPlay();
  }

  // ---------- 更新 ----------
  update(dt) {
    const inp = NM.input;
    if (this.help) {
      this.help.update(dt);
      if (this.help.closed) this.help = null;
      return;
    }
    if (this.work) return this.updateWork(dt);
    // 逛商店時夜市暫停
    if (this.shop) {
      this.shop.update(dt);
      if (this.shop.closed) this.shop = null;
      return;
    }
    if (inp.wasPressed('pause')) this.paused = !this.paused;
    if (this.paused) {
      if (inp.wasPressed('confirm')) NM.main.setScene(new NM.TitleScene(this.levelIndex));
      return;
    }
    if (!this.tickWorld(dt)) return;

    this.player.update(dt, [...this.trashCans, ...this.crowd]);
    if (inp.wasPressed('prev')) this.player.cycle(-1);
    if (inp.wasPressed('next')) this.player.cycle(1);
    if (inp.wasPressed('magic')) this.useMagic();
    this.updateBoss(dt);

    this.target = this.findTarget();
    this.updateQueueWait(dt);
    if (inp.wasPressed('action') && this.target && !this.waitingAt) this.interact(this.target);
  }

  // 打工時玩家站著不動，但夜市照常運作
  updateWork(dt) {
    if (!this.tickWorld(dt)) return;
    this.work.update(dt);
    if (!this.work.finished) return;
    const pay = this.work.money;
    this.work = null;
    NM.audio.music('game');
    this.addMoney(pay);
    this.stats.workPay += pay;
    this.float(`打工工資 +$${pay}`, this.player.x, this.player.y - 110, '#7dff7d');
  }

  // 計時、客人、人潮、攤位排隊；時間到就結算並回傳 false
  tickWorld(dt) {
    const before = this.timeLeft;
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.finish();
      return false;
    }
    // 最後 10 秒音樂加快，最後 5 秒每秒滴答
    NM.audio.rush = this.timeLeft <= 10;
    if (this.timeLeft <= 5 && Math.ceil(this.timeLeft) !== Math.ceil(before)) NM.audio.play('tick');
    this.magicTime = Math.max(0, this.magicTime - dt);
    this.newsTime = Math.max(0, this.newsTime - dt);

    for (const c of this.crowd) c.update(dt);
    this.updateSpawning(dt);
    this.updateQueues(dt);

    for (const c of this.customers) {
      if (c.update(dt) === 'timeout') {
        this.addMoney(-NM.config.timeoutPenalty);
        this.stats.timeouts++;
        this.stats.penalties += NM.config.timeoutPenalty;
        this.float(`超時 -$${NM.config.timeoutPenalty}`, c.x, c.y - 120, '#ff6b6b');
        NM.audio.play('timeout');
      }
    }
    this.customers = this.customers.filter((c) => !c.gone);

    for (const f of this.floats) f.t += dt;
    this.floats = this.floats.filter((f) => f.t < 1.2);
    return true;
  }

  useMagic() {
    const p = this.player;
    if (this.magicTime > 0) return;
    if (this.items.magic <= 0) {
      this.float('沒有百寶袋（商店可買）', p.x, p.y - 110, '#aaa');
      return;
    }
    this.items.magic--;
    this.magicTime = NM.config.shop.magic.duration;
    NM.audio.play('magic');
    this.float('百寶袋發動！自動拿對的餐', p.x, p.y - 110, '#d9a5ff');
  }

  // 老闆娘照時間表出現，等一陣子沒人理就離開
  updateBoss(dt) {
    const elapsed = this.level.duration - this.timeLeft;
    if (!this.boss && this.workTimes.length && elapsed >= this.workTimes[0]) {
      // 街上太擠找不到位置就下一幀再試，不會錯過這次打工
      const pos = this.findFreeSpot();
      if (pos) {
        this.workTimes.shift();
        this.boss = { ...pos, stay: NM.config.work.eventStay, radius: 16 };
        this.float('老闆娘缺人手！', pos.x, pos.y - 130, '#ffb347');
        NM.audio.play('boss');
      }
    }
    if (!this.boss) return;
    this.boss.stay -= dt;
    if (this.boss.stay <= 0) {
      this.float('老闆娘走了…', this.boss.x, this.boss.y - 110, '#aaa');
      this.boss = null;
    }
  }

  updateSpawning(dt) {
    const lv = this.level;
    const waiting = this.customers.filter((c) => c.waiting).length;
    if (waiting >= lv.maxCustomers) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = lv.spawnEvery * (0.8 + Math.random() * 0.4);
    this.spawnCustomer();
  }

  spawnCustomer() {
    const cc = NM.config.customer;
    const pos = this.findFreeSpot();
    if (!pos) return;
    this.customers.push(new NM.Customer({
      id: this.nextId++, ...pos,
      food: pick(this.level.stalls),
      patience: this.level.patience,
      sprite: pick(cc.sprites),
    }));
  }

  // 街上找一個不跟客人、攤位、垃圾桶、玩家、老闆娘擠在一起的位置
  findFreeSpot() {
    const cc = NM.config.customer;
    const area = cc.spawnArea;
    const blockers = [
      ...this.customers,
      ...this.trashCans,
      ...this.stalls.map((s) => s.point),
      this.kiosk.point,
      this.player,
      ...(this.boss ? [this.boss] : []),
    ];
    for (let tries = 0; tries < 30; tries++) {
      const x = area.left + Math.random() * (area.right - area.left);
      const y = area.top + Math.random() * (area.bottom - area.top);
      if (!blockers.some((b) => Math.hypot(b.x - x, b.y - y) < cc.minGap)) return { x, y };
    }
    return null;
  }

  updateQueues(dt) {
    for (const s of this.stalls) s.update(dt);
    if (!this.level.queueEvery) return;
    this.queueTimer -= dt;
    if (this.queueTimer > 0) return;
    this.queueTimer = this.level.queueEvery * (0.8 + Math.random() * 0.4);
    const candidates = this.stalls.filter((s) => s.open && !s.queue);
    if (candidates.length) pick(candidates).startQueue();
  }

  // 排隊中：要待在攤位旁邊，走開就取消
  updateQueueWait(dt) {
    const w = this.waitingAt;
    if (!w) return;
    const reach = NM.config.player.reach;
    if (dist(this.player, w.stall.point) > reach) {
      this.waitingAt = null;
      this.float('離開隊伍', this.player.x, this.player.y - 100, '#aaa');
      return;
    }
    w.t += dt;
    if (w.t >= w.need) {
      this.waitingAt = null;
      this.giveFood(w.stall);
    }
  }

  // 找出射程內最近、可互動的東西
  findTarget() {
    const reach = NM.config.player.reach;
    const p = this.player;
    const options = [];
    for (const c of this.customers) if (c.waiting) options.push({ type: 'customer', obj: c, d: dist(p, c) });
    for (const s of this.stalls) if (s.open) options.push({ type: 'stall', obj: s, d: dist(p, s.point) });
    for (const t of this.trashCans) options.push({ type: 'trash', obj: t, d: dist(p, t) });
    if (this.boss) options.push({ type: 'work', obj: this.boss, d: dist(p, this.boss) });
    options.push({ type: 'shop', obj: this.kiosk, d: dist(p, this.kiosk.point) });
    const inRange = options.filter((o) => o.d <= reach);
    inRange.sort((a, b) => a.d - b.d);
    return inRange[0] || null;
  }

  interact(target) {
    const p = this.player;
    const cfg = NM.config;

    if (target.type === 'shop') {
      this.shop = new NM.ShopPanel(this);
      NM.audio.play('shopOpen');
      return;
    }

    if (target.type === 'work') {
      this.boss = null;
      this.work = new NM.WorkScene(this);
      NM.audio.music('work');
      return;
    }

    if (target.type === 'stall') {
      const stall = target.obj;
      if (p.bagFull) {
        this.float('手滿了！先交餐或丟掉', p.x, p.y - 110, '#ffc93c');
        NM.audio.play('full');
        return;
      }
      if (stall.queue) {
        this.waitingAt = { stall, t: 0, need: stall.queue.wait };
        NM.audio.play('queue');
        return;
      }
      this.giveFood(stall);
      return;
    }

    if (target.type === 'customer') {
      const c = target.obj;
      // 百寶袋發動中：背包裡有客人要的就自動換到那份
      if (this.magicTime > 0 && p.selectedFood !== c.food && p.bag.includes(c.food)) p.sel = p.bag.indexOf(c.food);
      const food = p.selectedFood;
      if (!food) {
        this.float('手上沒有餐點', p.x, p.y - 110, '#ffc93c');
        return;
      }
      if (food !== c.food) {
        c.shake = 0.4;
        this.stats.wrong++;
        this.float('不是這個！', c.x, c.y - 120, '#ff6b6b');
        NM.audio.play('wrong');
        return;
      }
      p.removeSelected();
      const price = cfg.foods[food].price;
      const tip = Math.round(price * cfg.tipRate * c.ratio);
      c.state = 'served';
      this.addMoney(price + tip);
      this.stats.delivered++;
      this.float(`+$${price + tip}${tip ? `（小費 ${tip}）` : ''}`, c.x, c.y - 120, '#7dff7d');
      NM.audio.play('deliver');
      return;
    }

    if (target.type === 'trash') {
      if (!p.selectedFood) {
        this.float('沒有東西可丟', p.x, p.y - 110, '#aaa');
        return;
      }
      p.removeSelected();
      this.addMoney(-cfg.discardCost);
      this.stats.discards++;
      this.stats.wasted += cfg.discardCost;
      this.float(`丟棄 -$${cfg.discardCost}`, target.obj.x, target.obj.y - 80, '#ff6b6b');
      NM.audio.play('discard');
    }
  }

  giveFood(stall) {
    if (!this.player.addFood(stall.food)) return;
    this.float(`拿到 ${NM.config.foods[stall.food].name}`, this.player.x, this.player.y - 110, '#ffe9b0');
    NM.audio.play('pickup');
  }

  addMoney(v) {
    this.money += v;
  }

  float(text, x, y, color) {
    this.floats.push({ text, x, y, color, t: 0 });
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    // 打工到一半時間到，已賺的工資照算
    if (this.work) {
      this.addMoney(this.work.money);
      this.stats.workPay += this.work.money;
      this.work = null;
    }
    NM.audio.music(null);
    const cleared = this.money >= this.level.target;
    NM.save.recordLevel(this.levelIndex, cleared, this.money);
    NM.audio.play(cleared ? 'levelClear' : 'levelFail');
    NM.main.setScene(new NM.ResultScene({
      levelIndex: this.levelIndex,
      cleared,
      money: this.money,
      target: this.level.target,
      stats: this.stats,
      items: this.items,
    }));
  }

  // ---------- 繪製 ----------
  draw(ctx) {
    const a = NM.assets;
    const W = NM.config.width, H = NM.config.height;
    const tgt = this.target;

    a.drawFit(ctx, 'backgrounds/street_map', W / 2, H / 2, W, H);
    ctx.fillStyle = 'rgba(10, 12, 35, 0.25)';
    ctx.fillRect(0, 0, W, H);

    // 上排攤位一定在所有角色後面，下排一定在前面
    for (const s of this.stalls) if (s.row === 'top') s.draw(ctx, tgt && tgt.obj === s);
    this.drawKiosk(ctx, this.kiosk, tgt && tgt.obj === this.kiosk);

    const sprites = [
      ...this.customers.map((c) => ({ y: c.y, draw: () => c.draw(ctx, tgt && tgt.obj === c) })),
      ...this.trashCans.map((t) => ({ y: t.y, draw: () => this.drawTrash(ctx, t, tgt && tgt.obj === t) })),
      ...this.crowd.map((c) => ({ y: c.y, draw: () => c.draw(ctx) })),
      { y: this.player.y, draw: () => this.player.draw(ctx) },
    ];
    if (this.boss) sprites.push({ y: this.boss.y, draw: () => this.drawBoss(ctx, this.boss, tgt && tgt.obj === this.boss) });
    sprites.sort((m, n) => m.y - n.y).forEach((s) => s.draw());

    for (const s of this.stalls) if (s.row === 'bottom') s.draw(ctx, tgt && tgt.obj === s);

    if (this.help) return this.help.draw(ctx);
    if (this.work) return this.work.draw(ctx);
    if (this.shop) return this.shop.draw(ctx);

    this.drawQueueWait(ctx);
    this.drawFloats(ctx);
    this.drawHUD(ctx);
    if (this.newsTime > 0) this.drawNews(ctx);
    if (this.paused) this.drawPause(ctx);
  }

  drawKiosk(ctx, k, highlighted) {
    ctx.save();
    if (highlighted) {
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = 18;
    }
    NM.assets.drawSprite(ctx, 'stalls/shop', k.x, k.baseline, k.height);
    ctx.restore();
  }

  drawBoss(ctx, b, highlighted) {
    const d = NM.draw;
    ctx.save();
    if (highlighted) {
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = 16;
    }
    d.shadow(ctx, b.x, b.y, 18);
    NM.assets.drawSprite(ctx, 'characters/crowd_2', b.x, b.y, 80);
    ctx.restore();
    const by = b.y - 118;
    d.panel(ctx, b.x - 62, by - 22, 124, 40, { fill: '#fff3b0', border: '#d9361e', radius: 10 });
    d.text(ctx, '缺人手！打工', b.x, by + 5, { size: 16, color: '#d9361e', stroke: null });
    d.bar(ctx, b.x - 40, by + 24, 80, 5, b.stay / NM.config.work.eventStay);
  }

  drawTrash(ctx, t, highlighted) {
    ctx.save();
    if (highlighted) {
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = 16;
    }
    NM.draw.shadow(ctx, t.x, t.y, 22);
    NM.assets.drawSprite(ctx, 'props/trash_can', t.x, t.y, 60);
    ctx.restore();
    NM.draw.text(ctx, `丟棄 -$${NM.config.discardCost}`, t.x, t.y + 20, { size: 12, color: '#ccc' });
  }

  drawQueueWait(ctx) {
    const w = this.waitingAt;
    if (!w) return;
    const p = this.player;
    NM.draw.text(ctx, '排隊等餐…', p.x, p.y - 128, { size: 14, color: '#ffe9b0' });
    NM.draw.bar(ctx, p.x - 30, p.y - 122, 60, 8, w.t / w.need);
  }

  drawFloats(ctx) {
    for (const f of this.floats) {
      const k = f.t / 1.2;
      ctx.save();
      ctx.globalAlpha = 1 - k;
      NM.draw.text(ctx, f.text, f.x, f.y - k * 40, { size: 20, color: f.color });
      ctx.restore();
    }
  }

  drawHUD(ctx) {
    const a = NM.assets;
    const d = NM.draw;
    const W = NM.config.width;

    // 訂單欄
    const orders = this.customers.filter((c) => c.waiting);
    orders.forEach((c, i) => {
      const x = 14 + i * 84, y = 8;
      a.drawFit(ctx, 'ui/order_card', x + 38, y + 46, 76, 92);
      d.text(ctx, `#${c.id}`, x + 38, y + 26, { size: 15, color: '#fff', strokeWidth: 3 });
      a.drawFit(ctx, `food/${c.food}`, x + 38, y + 52, 40, 36);
      d.bar(ctx, x + 12, y + 78, 52, 6, c.ratio);
    });

    // 計時與金錢
    d.panel(ctx, W - 290, 10, 276, 84);
    const t = Math.ceil(this.timeLeft);
    const timeStr = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
    d.text(ctx, this.level.name, W - 276, 38, { size: 18, color: '#ffb347', align: 'left' });
    d.text(ctx, timeStr, W - 30, 42, { size: 30, color: t <= 10 ? '#ff6b6b' : '#fff', align: 'right' });
    a.drawFit(ctx, 'ui/coin', W - 262, 70, 26, 26);
    d.text(ctx, `${d.money(this.money)} / $${this.level.target}`, W - 242, 78, { size: 20, color: this.money >= this.level.target ? '#7dff7d' : '#ffe9b0', align: 'left' });

    // 背包
    const p = this.player;
    const slot = 58, gap = 8;
    const total = p.bagSize * slot + (p.bagSize - 1) * gap;
    // 放在下排第一、二個攤位之間，避免擋住攤位
    const bx = 400 - total / 2, by = NM.config.height - slot - 12;
    d.panel(ctx, bx - 12, by - 26, total + 24, slot + 34, { fill: 'rgba(20, 22, 48, 0.8)', border: null });
    d.text(ctx, 'Q / E 切換手上餐點', bx + total / 2, by - 8, { size: 13, color: '#bbb', stroke: null });
    for (let i = 0; i < p.bagSize; i++) {
      const x = bx + i * (slot + gap);
      const selected = i === p.sel && p.bag[i];
      d.panel(ctx, x, by, slot, slot, { fill: '#2a2e55', border: selected ? '#ffe066' : '#555a8a', radius: 6, lineWidth: selected ? 4 : 2 });
      if (p.bag[i]) a.drawFit(ctx, `food/${p.bag[i]}`, x + slot / 2, by + slot / 2, slot - 12, slot - 12);
    }
    this.drawMagic(ctx, bx + total + 22, by);

    // 互動提示
    const tgt = this.target;
    if (tgt && !this.waitingAt) {
      const label = { stall: '取餐', customer: '交餐', trash: '丟棄', work: '打工', shop: '逛商店' }[tgt.type];
      d.text(ctx, `空白鍵：${label}`, p.x, p.y + 26, { size: 14, color: '#ffe066' });
    }
  }

  // 背包右邊的百寶袋欄：數量、發動中倒數
  drawMagic(ctx, x, y) {
    const d = NM.draw;
    const n = this.items.magic;
    const on = this.magicTime > 0;
    if (!n && !on) return;
    d.panel(ctx, x, y - 26, 96, 92, { fill: on ? 'rgba(90, 40, 130, 0.9)' : 'rgba(20, 22, 48, 0.8)', border: on ? '#d9a5ff' : null });
    NM.assets.drawFit(ctx, 'ui/magic_bag', x + 30, y + 20, 44, 44);
    d.text(ctx, `×${n}`, x + 74, y + 30, { size: 18 });
    if (on) d.bar(ctx, x + 10, y + 52, 76, 6, this.magicTime / NM.config.shop.magic.duration);
    else d.text(ctx, 'F 發動', x + 48, y + 60, { size: 13, color: '#bbb', stroke: null });
  }

  drawNews(ctx) {
    const W = NM.config.width;
    ctx.save();
    ctx.globalAlpha = Math.min(1, this.newsTime);
    NM.draw.panel(ctx, W / 2 - 330, 300, 660, 70, { fill: 'rgba(150, 30, 25, 0.92)', border: '#ffe066', radius: 14, lineWidth: 4 });
    NM.draw.text(ctx, '新攤位開張！快去光顧', W / 2, 328, { size: 22, color: '#ffe066' });
    NM.draw.text(ctx, this.news, W / 2, 358, { size: 20 });
    ctx.restore();
  }

  drawPause(ctx) {
    const W = NM.config.width, H = NM.config.height;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, W, H);
    NM.draw.text(ctx, '暫停', W / 2, H / 2 - 10, { size: 48, color: '#ffb347' });
    NM.draw.text(ctx, 'Esc 繼續　Enter 回標題', W / 2, H / 2 + 40, { size: 20 });
  }
};

NM.GameScene.noItems = () => ({ shoes: 0, bag: 0, magic: 0 });

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
