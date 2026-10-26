// 攤位：按空白鍵立即拿到現成餐點；有排隊時要原地等 1～2 秒
NM.Stall = class {
  constructor({ food, x, row, open, isNew }) {
    const layout = NM.config.stallLayout[row];
    const st = NM.config.street;
    this.food = food;
    this.x = x;
    this.row = row;
    this.open = open;
    this.isNew = isNew; // 這一關才新開的攤位，招牌旁掛「新開張」
    this.t = Math.random() * 6;
    this.baseline = layout.baseline;
    this.height = layout.height;
    this.queue = null; // { timeLeft, wait }
    // 互動點在街道邊緣、正對攤位
    this.point = { x, y: row === 'top' ? st.top : st.bottom };
  }

  startQueue() {
    const q = NM.config.queue;
    this.queue = {
      timeLeft: q.durationMin + Math.random() * (q.durationMax - q.durationMin),
      wait: q.waitMin + Math.random() * (q.waitMax - q.waitMin),
    };
  }

  update(dt) {
    this.t += dt;
    if (!this.queue) return;
    this.queue.timeLeft -= dt;
    if (this.queue.timeLeft <= 0) this.queue = null;
  }

  draw(ctx, highlighted) {
    const a = NM.assets;
    ctx.save();
    if (!this.open) ctx.filter = 'grayscale(0.8) brightness(0.5)';
    if (highlighted) {
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = 18;
    }
    const w = a.drawSprite(ctx, `stalls/${this.food}`, this.x, this.baseline, this.height);
    ctx.restore();

    const name = NM.config.foods[this.food].name;
    const tagY = this.row === 'top' ? this.baseline - 8 : this.baseline - this.height + 26;
    // 3D 攤車招牌已經寫著店名，只有休息中才另外標示
    if (!this.open) NM.draw.text(ctx, `${name}（休息中）`, this.x, tagY, { size: 16, color: '#ccc' });

    if (this.open && this.isNew) this.drawNewBadge(ctx);

    if (this.open && this.queue) {
      const qx = this.x + w / 2 + 6;
      a.drawSprite(ctx, 'props/queue_marker', qx, this.baseline - (this.row === 'top' ? 4 : 30), 64);
      NM.draw.text(ctx, '排隊中', qx, this.baseline - (this.row === 'top' ? 74 : 100), { size: 14, color: '#ff8c69' });
    }
  }

  // 招牌正上方的紅色彩帶，不擋到店名，輕輕擺動吸引目光
  drawNewBadge(ctx) {
    const x = this.x, y = this.baseline - this.height - 14;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.12 + Math.sin(this.t * 3) * 0.05);
    const s = 1 + Math.sin(this.t * 6) * 0.04;
    ctx.scale(s, s);
    ctx.shadowColor = '#ffd23f';
    ctx.shadowBlur = 14;
    NM.draw.panel(ctx, -42, -17, 84, 34, { fill: '#e8352a', border: '#ffe066', radius: 8, lineWidth: 3 });
    ctx.restore();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-0.12 + Math.sin(this.t * 3) * 0.05);
    ctx.scale(s, s);
    NM.draw.text(ctx, '新開張', 0, 1, { size: 18, color: '#fff6c8', stroke: '#8a1a12', baseline: 'middle' });
    ctx.restore();
  }
};
