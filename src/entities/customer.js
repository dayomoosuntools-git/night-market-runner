// 客人：站在固定位置等指定餐點，耐心歸零就生氣離開
NM.Customer = class {
  constructor({ id, x, y, food, patience, sprite }) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.food = food;
    this.patience = patience;
    this.timeLeft = patience;
    this.sprite = sprite;
    this.state = 'waiting'; // waiting | served | angry
    this.fade = 1;
    this.shake = 0;
    this.age = 0;
  }

  get waiting() {
    return this.state === 'waiting';
  }

  get ratio() {
    return this.timeLeft / this.patience;
  }

  get gone() {
    return !this.waiting && this.fade <= 0;
  }

  // 回傳 'timeout' 表示這一幀剛超時
  update(dt) {
    this.age += dt;
    this.shake = Math.max(0, this.shake - dt);
    if (this.waiting) {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.state = 'angry';
        return 'timeout';
      }
    } else {
      this.fade -= dt * 1.4;
    }
    return null;
  }

  draw(ctx, highlighted) {
    const a = NM.assets;
    const h = NM.config.customer.height;
    const pop = Math.min(1, this.age / 0.25); // 出場時彈出
    const sx = this.shake > 0 ? Math.sin(this.shake * 60) * 4 : 0;
    const alpha = Math.max(0, this.fade);
    const x = this.x + sx;
    const lift = this.state === 'served' ? (1 - alpha) * 20 : 0;

    ctx.save();
    ctx.globalAlpha = alpha;
    NM.draw.shadow(ctx, x, this.y, 18);
    if (highlighted) {
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = 16;
    }
    a.drawSprite(ctx, `characters/${this.sprite}`, x, this.y - lift, h * pop);
    ctx.shadowBlur = 0;

    // 頭上的點餐泡泡：編號 + 餐點 + 耐心條
    const by = this.y - h - 34;
    NM.draw.panel(ctx, x - 26, by - 26, 52, 56, { fill: '#fffbe9', border: '#1a1d3a', radius: 8 });
    a.drawFit(ctx, `food/${this.food}`, x, by - 2, 36, 36);
    if (this.waiting) NM.draw.bar(ctx, x - 22, by + 22, 44, 5, this.ratio);
    NM.draw.text(ctx, `#${this.id}`, x - 30, by - 22, { size: 14, color: '#ffe066', align: 'right' });

    if (this.state === 'angry') NM.draw.text(ctx, '💢 太慢了！', x, this.y - h - 72, { size: 16, color: '#ff6b6b' });
    ctx.restore();
  }
};
