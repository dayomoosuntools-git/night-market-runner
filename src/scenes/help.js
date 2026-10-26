// 操作說明：每次進入關卡先蓋在夜市上，玩家按「關閉」後才開始計時
NM.HelpPanel = class {
  constructor(level) {
    this.level = level;
    this.t = 0;
    this.closed = false;
  }

  update(dt) {
    const inp = NM.input;
    this.t += dt;
    // 剛從選關按 Enter 進來，稍等一下才接受關閉，避免連按直接跳過
    if (this.t < 0.4) return;
    if (inp.wasPressed('confirm') || inp.wasPressed('action') || inp.wasPressed('pause')) {
      NM.audio.play('start');
      this.closed = true;
    }
  }

  draw(ctx) {
    const a = NM.assets, d = NM.draw;
    const W = NM.config.width, H = NM.config.height;
    const lv = this.level;

    ctx.fillStyle = 'rgba(10, 12, 35, 0.78)';
    ctx.fillRect(0, 0, W, H);

    const pw = 860, ph = 560, px = (W - pw) / 2, py = 60;
    d.panel(ctx, px, py, pw, ph, { fill: 'rgba(30, 32, 64, 0.95)', border: '#ffb347', radius: 22, lineWidth: 4 });
    d.text(ctx, '操作說明', W / 2, py + 58, { size: 40, color: '#ffb347' });
    d.text(ctx, `${lv.name}：${lv.duration} 秒內賺到 $${lv.target} 就過關！`, W / 2, py + 100, { size: 22, color: '#ffe9b0' });

    // 左邊按鍵、右邊說明
    const rows = [
      [['↑', '↓', '←', '→'], '移動（也可以用 W A S D）'],
      [['空白鍵'], '取餐、交餐、丟垃圾、找老闆娘打工、逛商店'],
      [['Q', 'E'], '切換手上要交的餐點'],
      [['F'], '發動百寶袋：幾秒內交餐自動拿對的'],
      [['Esc'], '暫停'],
      [['M'], '靜音'],
    ];
    const keyRight = px + 330, textLeft = px + 360;
    rows.forEach(([keys, desc], i) => {
      const y = py + 160 + i * 58;
      let x = keyRight;
      for (let k = keys.length - 1; k >= 0; k--) {
        const w = keys[k].length > 1 ? 34 + keys[k].length * 20 : 46;
        x -= w;
        this.keycap(ctx, x, y - 22, w, 44, keys[k]);
        x -= 8;
      }
      d.text(ctx, desc, textLeft, y + 8, { size: 22, align: 'left' });
    });

    d.text(ctx, '看客人頭上要什麼 → 到攤位拿 → 交給那位客人', W / 2, py + 515, { size: 20, color: '#7dff7d' });

    // 關閉按鈕（閃爍提示可以按了）
    const ready = this.t >= 0.4;
    const pulse = ready ? 1 + Math.sin(this.t * 5) * 0.03 : 1;
    ctx.save();
    if (ready) {
      ctx.shadowColor = '#ffe066';
      ctx.shadowBlur = 20;
    }
    a.drawFit(ctx, 'ui/button', W / 2, 668, 300 * pulse, 76 * pulse, ready ? 1 : 0.5);
    ctx.restore();
    d.text(ctx, '關閉，開始！', W / 2, 668, { size: 26, baseline: 'middle' });
    d.text(ctx, 'Enter／空白鍵', W / 2, 712, { size: 14, color: '#bbb', stroke: null });
  }

  keycap(ctx, x, y, w, h, label) {
    NM.draw.panel(ctx, x, y + 4, w, h, { fill: '#8a6a3a', border: null, radius: 9 });
    NM.draw.panel(ctx, x, y, w, h, { fill: '#fff6df', border: '#c99a4a', radius: 9, lineWidth: 2 });
    NM.draw.text(ctx, label, x + w / 2, y + h / 2 + 1, { size: label.length > 1 ? 18 : 22, color: '#5a3a1a', stroke: null, baseline: 'middle' });
  }
};
