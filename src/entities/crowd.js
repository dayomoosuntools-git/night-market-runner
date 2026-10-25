// 路人：在街上左右閒逛，偶爾停下來看攤位；走出畫面就從另一頭重新出現
NM.Crowd = class {
  constructor(spread) {
    this.reset(spread);
  }

  // spread = true 時散佈在整條街（開場用），否則從畫面外走進來
  reset(spread) {
    const cc = NM.config.crowd;
    const st = NM.config.street;
    this.sprite = pick(cc.sprites);
    this.dir = Math.random() < 0.5 ? 1 : -1;
    this.speed = cc.speedMin + Math.random() * (cc.speedMax - cc.speedMin);
    this.x = spread ? st.left + Math.random() * (st.right - st.left) : (this.dir > 0 ? -40 : NM.config.width + 40);
    this.y = st.top + 15 + Math.random() * (st.bottom - st.top - 30);
    this.radius = cc.radius;
    this.pause = 0;
    this.nextPause = 2 + Math.random() * 5;
    this.t = Math.random() * 10;
  }

  update(dt) {
    this.t += dt;
    if (this.pause > 0) {
      this.pause -= dt;
      return;
    }
    this.nextPause -= dt;
    if (this.nextPause <= 0) {
      this.pause = 0.8 + Math.random() * 1.5;
      this.nextPause = 3 + Math.random() * 5;
    }
    this.x += this.dir * this.speed * dt;
    if (this.x < -60 || this.x > NM.config.width + 60) this.reset(false);
  }

  draw(ctx) {
    const h = NM.config.crowd.height;
    const bob = this.pause > 0 ? 0 : Math.abs(Math.sin(this.t * 9)) * 3;
    NM.draw.shadow(ctx, this.x, this.y, 16);
    NM.assets.drawSprite(ctx, `characters/${this.sprite}`, this.x, this.y - bob, h, { flip: this.dir < 0, alpha: 0.92 });
  }
};
