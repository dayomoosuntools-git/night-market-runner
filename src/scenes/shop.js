// 商店面板：在關卡中走到商店攤按空白鍵打開，用這一關賺到的錢買
// 買到的道具過關後帶到下一關；失敗重玩或從標題重新開始都會歸零。百寶袋是消耗品；逛商店時夜市暫停
NM.ShopPanel = class {
  constructor(game) {
    this.game = game;
    this.sel = 0;
    this.msg = '';
    this.msgTime = 0;
    this.closed = false;
    this.items = ['shoes', 'bag', 'magic'];
  }

  // 每個商品目前的狀態：等級／持有數、下一個價格（null 表示買滿了）
  info(key) {
    const cfg = NM.config.shop[key];
    const data = this.game.items;
    if (key === 'magic') {
      return { cfg, level: `持有 ${data.magic}／${cfg.max}`, price: data.magic < cfg.max ? cfg.price : null };
    }
    const lv = data[key];
    return { cfg, level: `Lv ${lv}／${cfg.prices.length}`, price: lv < cfg.prices.length ? cfg.prices[lv] : null };
  }

  buy(key) {
    const g = this.game;
    const { cfg, price } = this.info(key);
    if (price === null) return this.flash('已經買滿了', '#aaa');
    if (g.money < price) {
      NM.audio.play('wrong');
      return this.flash('錢不夠，再多跑幾單！', '#ff6b6b');
    }
    g.addMoney(-price);
    g.stats.spent += price;
    g.items[key]++;
    g.player.applyUpgrades(g.items);
    NM.audio.play('buy');
    this.flash(`買到 ${cfg.name}！`, '#7dff7d');
  }

  flash(text, color) {
    this.msg = text;
    this.msgColor = color;
    this.msgTime = 1.4;
  }

  update(dt) {
    const inp = NM.input;
    const n = this.items.length + 1; // 最後一格是「回夜市」
    this.msgTime = Math.max(0, this.msgTime - dt);
    const before = this.sel;
    if (inp.wasPressed('left') || inp.wasPressed('up')) this.sel = (this.sel - 1 + n) % n;
    if (inp.wasPressed('right') || inp.wasPressed('down')) this.sel = (this.sel + 1) % n;
    if (this.sel !== before) NM.audio.play('select');
    if (inp.wasPressed('confirm') || inp.wasPressed('action')) {
      if (this.sel === this.items.length) this.closed = true;
      else this.buy(this.items[this.sel]);
    }
    if (inp.wasPressed('pause')) this.closed = true;
  }

  draw(ctx) {
    const a = NM.assets, d = NM.draw;
    const W = NM.config.width, H = NM.config.height;
    const g = this.game;
    const icons = { shoes: 'ui/shoes', bag: 'ui/big_bag', magic: 'ui/magic_bag' };

    ctx.fillStyle = 'rgba(10, 12, 35, 0.75)';
    ctx.fillRect(0, 0, W, H);

    d.text(ctx, '夜市商店', W / 2, 80, { size: 44, color: '#ffb347' });
    d.text(ctx, '逛商店時夜市暫停', W / 2, 112, { size: 16, color: '#bbb', stroke: null });
    a.drawFit(ctx, 'ui/coin', W - 270, 60, 34, 34);
    d.text(ctx, `這關收入 ${d.money(g.money)}`, W - 245, 71, { size: 26, color: '#ffe9b0', align: 'left' });

    const cw = 330, gap = 30;
    const x0 = (W - (3 * cw + 2 * gap)) / 2, y = 140;
    this.items.forEach((key, i) => {
      const x = x0 + i * (cw + gap);
      const on = this.sel === i;
      const { cfg, level, price } = this.info(key);
      const afford = price !== null && g.money >= price;
      const yy = y + (on ? -6 : 0);
      ctx.save();
      if (on) {
        ctx.shadowColor = '#ffe066';
        ctx.shadowBlur = 24;
      }
      d.panel(ctx, x, yy, cw, 390, { fill: on ? 'rgba(60, 50, 100, 0.95)' : 'rgba(30, 32, 64, 0.9)', border: on ? '#ffe066' : '#555a8a', radius: 18, lineWidth: on ? 5 : 3 });
      ctx.restore();
      a.drawFit(ctx, icons[key], x + cw / 2, yy + 115, 165, 165);
      d.text(ctx, cfg.name, x + cw / 2, yy + 238, { size: 28, color: '#ffe9b0' });
      d.text(ctx, level, x + cw / 2, yy + 272, { size: 18, color: '#ffb347' });
      // 說明可能比較長，在全形冒號處斷成兩行
      cfg.desc.split('：').forEach((line, j) => d.text(ctx, line, x + cw / 2, yy + 304 + j * 24, { size: 16, color: '#ccc', stroke: null }));
      const label = price === null ? '已買滿' : `$${price}`;
      d.text(ctx, label, x + cw / 2, yy + 370, { size: 26, color: price === null ? '#888' : afford ? '#7dff7d' : '#ff6b6b' });
    });

    // 回夜市按鈕
    const on = this.sel === this.items.length;
    ctx.save();
    if (on) {
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = 20;
    }
    a.drawFit(ctx, 'ui/button', W / 2, 590, 320, 86, on ? 1 : 0.6);
    ctx.restore();
    d.text(ctx, '回夜市', W / 2, 590, { size: 26, baseline: 'middle' });
    // 購買結果訊息暫時取代最下面的操作說明
    if (this.msgTime > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.msgTime * 2);
      d.panel(ctx, W / 2 - 200, 652, 400, 44, { border: this.msgColor });
      d.text(ctx, this.msg, W / 2, 682, { size: 20, color: this.msgColor });
      ctx.restore();
    } else {
      d.text(ctx, '← → 選擇　空白鍵／Enter 購買　Esc 離開', W / 2, 680, { size: 18, color: '#bbb' });
    }
  }
};
