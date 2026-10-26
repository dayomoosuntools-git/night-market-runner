// 玩家：位置 (x, y) 是腳底；背包是食物 key 的陣列，sel 是「手上選中」那份
NM.Player = class {
  constructor(x, y, items) {
    const cfg = NM.config.player;
    this.x = x;
    this.y = y;
    this.applyUpgrades(items);
    this.bag = [];
    this.sel = 0;
    this.facing = 1;
    this.moving = false;
    this.t = 0;
  }

  update(dt, obstacles) {
    const cfg = NM.config.player;
    const st = NM.config.street;
    const inp = NM.input;
    let dx = (inp.isDown('right') ? 1 : 0) - (inp.isDown('left') ? 1 : 0);
    let dy = (inp.isDown('down') ? 1 : 0) - (inp.isDown('up') ? 1 : 0);
    this.moving = dx !== 0 || dy !== 0;
    if (this.moving) {
      const len = Math.hypot(dx, dy);
      this.x += (dx / len) * this.speed * dt;
      this.y += (dy / len) * this.speed * dt;
      if (dx !== 0) this.facing = dx;
    }

    // 推開圓形障礙物（垃圾桶、路人）
    for (const o of obstacles) {
      const ddx = this.x - o.x, ddy = this.y - o.y;
      const d = Math.hypot(ddx, ddy);
      const min = cfg.radius + o.radius;
      if (d < min && d > 0.001) {
        this.x = o.x + (ddx / d) * min;
        this.y = o.y + (ddy / d) * min;
      }
    }
    // 最後才夾在街道內，避免被路人推出街外
    this.x = Math.max(st.left, Math.min(st.right, this.x));
    this.y = Math.max(st.top, Math.min(st.bottom, this.y));
    this.t += dt;
  }

  // 依商店買的跑鞋、外送箱更新速度與背包格數（關卡中買了立刻生效）
  applyUpgrades(items) {
    const cfg = NM.config.player;
    this.bagSize = cfg.bagSize + items.bag;
    this.speed = cfg.speed * (1 + NM.config.shop.shoes.speedPerLevel * items.shoes);
  }

  get selectedFood() {
    return this.bag[this.sel];
  }

  get bagFull() {
    return this.bag.length >= this.bagSize;
  }

  addFood(food) {
    if (this.bagFull) return false;
    this.bag.push(food);
    this.sel = this.bag.length - 1;
    return true;
  }

  removeSelected() {
    const food = this.bag.splice(this.sel, 1)[0];
    if (this.sel >= this.bag.length) this.sel = Math.max(0, this.bag.length - 1);
    return food;
  }

  cycle(dir) {
    if (this.bag.length === 0) return;
    this.sel = (this.sel + dir + this.bag.length) % this.bag.length;
  }

  draw(ctx) {
    const h = NM.config.player.height;
    const bob = this.moving ? Math.abs(Math.sin(this.t * 14)) * 5 : 0;
    NM.draw.shadow(ctx, this.x, this.y, 20);
    NM.assets.drawSprite(ctx, 'characters/player', this.x, this.y - bob, h, { flip: this.facing < 0 });
    // 手上選中的餐點顯示在頭頂
    const food = this.selectedFood;
    if (food) NM.assets.drawFit(ctx, `food/${food}`, this.x, this.y - h - 18 - bob, 30, 30);
  }
};
