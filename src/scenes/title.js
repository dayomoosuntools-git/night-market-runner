// 標題＋選關（M1 三關全開放；解鎖與存檔在 M3）
NM.TitleScene = class {
  constructor(levelIndex = 0) {
    this.sel = levelIndex;
    this.t = 0;
    NM.audio.music('title');
    this.options = NM.config.levels.map((lv) => ({ name: lv.name, sub: `目標 $${lv.target}` }));
  }

  update(dt) {
    const inp = NM.input;
    const n = this.options.length;
    this.t += dt;
    const before = this.sel;
    if (inp.wasPressed('left') || inp.wasPressed('up')) this.sel = (this.sel - 1 + n) % n;
    if (inp.wasPressed('right') || inp.wasPressed('down')) this.sel = (this.sel + 1) % n;
    for (let i = 0; i < n; i++) if (inp.wasPressed(String(i + 1))) this.sel = i;
    if (this.sel !== before) NM.audio.play('select');
    if (inp.wasPressed('confirm') || inp.wasPressed('action')) {
      NM.audio.play('start');
      const opt = this.options[this.sel];
      NM.main.setScene(new NM.GameScene(this.sel));
    }
  }

  draw(ctx) {
    const a = NM.assets, d = NM.draw;
    const W = NM.config.width, H = NM.config.height;

    a.drawFit(ctx, 'backgrounds/street_map', W / 2, H / 2, W, H);
    ctx.fillStyle = 'rgba(10, 12, 35, 0.6)';
    ctx.fillRect(0, 0, W, H);

    a.drawFit(ctx, 'ui/logo', W / 2, 150 + Math.sin(this.t * 2) * 4, 820, 180);
    d.text(ctx, '夜市跑腿送單・90 秒賺到目標金額就過關', W / 2, 270, { size: 22, color: '#ffe9b0' });

    // 選關按鈕
    const levels = this.options;
    const bw = 230, gap = 30;
    const total = levels.length * bw + (levels.length - 1) * gap;
    levels.forEach((lv, i) => {
      const x = (W - total) / 2 + i * (bw + gap), y = 330;
      const on = i === this.sel;
      ctx.save();
      if (on) {
        ctx.shadowColor = '#ffe066';
        ctx.shadowBlur = 20;
      }
      a.drawFit(ctx, 'ui/button', x + bw / 2, y + 40, bw, 80, on ? 1 : 0.55);
      ctx.restore();
      d.text(ctx, lv.name, x + bw / 2, y + 40, { size: 26, baseline: 'middle' });
      d.text(ctx, lv.sub, x + bw / 2, y + 110, { size: 16, color: on ? '#ffe066' : '#aaa' });
    });

    // 角色陣容
    const cast = ['player', 'customer_1', 'customer_2', 'customer_3', 'customer_4', 'helper'];
    cast.forEach((c, i) => a.drawSprite(ctx, `characters/${c}`, W / 2 + (i - 2.5) * 90, 580, 90));

    NM.stats.draw(ctx);
    d.text(ctx, '← → 選關（1～3）　Enter 開始', W / 2, 640, { size: 22, color: '#fff' });
    d.text(ctx, 'WASD/方向鍵 移動・空白鍵 取餐/交餐/丟棄/打工/逛商店・Q/E 換手上餐點・F 百寶袋・Esc 暫停・M 靜音', W / 2, 680, { size: 16, color: '#bbb' });
  }
};
