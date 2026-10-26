// 結算畫面
NM.ResultScene = class {
  constructor({ levelIndex, cleared, money, target, stats }) {
    this.levelIndex = levelIndex;
    this.cleared = cleared;
    this.money = money;
    this.target = target;
    this.stats = stats;
    this.hasNext = cleared && levelIndex + 1 < NM.config.levels.length;
    // 三關都通過過，打完最後一關就能領證書
    this.certificate = cleared && !this.hasNext && NM.save.allCleared();
  }

  update() {
    const inp = NM.input;
    if (this.certificate && inp.wasPressed('confirm')) {
      NM.main.setScene(new NM.CertificateScene());
      return;
    }
    if (inp.wasPressed('confirm')) {
      const next = this.hasNext ? this.levelIndex + 1 : this.levelIndex;
      NM.main.setScene(new NM.GameScene(next));
    }
    if (inp.wasPressed('pause')) NM.main.setScene(new NM.TitleScene(this.levelIndex));
  }

  draw(ctx) {
    const a = NM.assets, d = NM.draw;
    const W = NM.config.width, H = NM.config.height;
    const s = this.stats;

    a.drawFit(ctx, 'backgrounds/street_map', W / 2, H / 2, W, H);
    ctx.fillStyle = 'rgba(10, 12, 35, 0.7)';
    ctx.fillRect(0, 0, W, H);

    d.panel(ctx, W / 2 - 300, 90, 600, 540);
    d.text(ctx, NM.config.levels[this.levelIndex].name, W / 2, 140, { size: 22, color: '#ffb347' });
    d.text(ctx, this.cleared ? '過關！' : '沒達標…', W / 2, 200, { size: 52, color: this.cleared ? '#7dff7d' : '#ff6b6b' });

    a.drawFit(ctx, 'ui/coin', W / 2 - 130, 262, 36, 36);
    d.text(ctx, `${d.money(this.money)} / 目標 $${this.target}`, W / 2 + 20, 274, { size: 30, color: '#ffe9b0' });

    const rows = [
      ['送達', `${s.delivered} 單`],
      ['超時', `${s.timeouts} 單${s.penalties ? `（-$${s.penalties}）` : ''}`],
      ['送錯被拒', `${s.wrong} 次`],
      ['丟棄浪費', `${s.discards} 份${s.wasted ? `（-$${s.wasted}）` : ''}`],
      ['打工工資', `+$${s.workPay}`],
      ['商店花費', `-$${s.spent}`],
    ];
    rows.forEach(([k, v], i) => {
      const y = 330 + i * 40;
      d.text(ctx, k, W / 2 - 180, y, { size: 22, color: '#bbb', align: 'left' });
      d.text(ctx, v, W / 2 + 180, y, { size: 22, align: 'right' });
    });

    a.drawSprite(ctx, `characters/${this.cleared ? 'player' : 'customer_3'}`, W / 2 + 240, 480, 100);

    const next = this.certificate ? 'Enter 領取今夜送單王證書' : this.hasNext ? 'Enter 下一關' : 'Enter 再玩一次';
    d.text(ctx, `${next}　Esc 回標題`, W / 2, 600, { size: 22, color: '#ffe066' });
  }
};
