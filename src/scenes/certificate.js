// 今夜送單王證書：三關全部通過後，輸入名字或綽號並下載 PNG
// 證書底圖用 data URI（assets/certificate_frame.js）載入，雙擊 index.html 開啟時畫布也不會被汙染，才能匯出圖片
NM.CertificateScene = class {
  constructor() {
    this.total = NM.save.bestTotal();
    this.date = new Date();
    this.t = 0;
    this.msg = '';
    this.msgTime = 0;
    this.frame = new Image();
    this.frame.src = NM.certificateFrame || '';
    NM.audio.music('title');
    this.createInput();
  }

  // 用真正的 <input> 輸入名字，中文輸入法才能正常選字
  createInput() {
    const el = document.createElement('input');
    el.id = 'cert-name';
    el.maxLength = 12;
    el.placeholder = '輸入你的名字或綽號';
    el.value = NM.save.data.name;
    el.addEventListener('input', () => NM.save.setName(el.value.trim()));
    el.addEventListener('keydown', (e) => {
      if (e.isComposing) return;
      if (e.key === 'Enter') this.download();
      if (e.key === 'Escape') this.leave();
    });
    document.body.appendChild(el);
    this.input = el;
    this.placeInput();
    setTimeout(() => el.focus(), 0);
  }

  // 跟著畫布縮放，把輸入框放在畫布座標 (640, 668) 附近
  placeInput() {
    const r = NM.main.canvas.getBoundingClientRect();
    const k = r.width / NM.config.width;
    const w = 300 * k, h = 40 * k;
    Object.assign(this.input.style, {
      left: `${r.left + window.scrollX + 470 * k - w / 2}px`,
      top: `${r.top + window.scrollY + 668 * k - h / 2}px`,
      width: `${w}px`,
      height: `${h}px`,
      fontSize: `${20 * k}px`,
    });
  }

  get name() {
    return this.input.value.trim();
  }

  leave() {
    this.input.remove();
    NM.main.setScene(new NM.TitleScene(0));
  }

  download() {
    if (!this.name) {
      this.flash('先輸入名字或綽號喔！');
      this.input.focus();
      return;
    }
    const W = 1600, H = 1200;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    this.drawCertificate(c.getContext('2d'), 0, 0, W, H);
    try {
      c.toBlob((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `今夜送單王證書_${this.name}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        this.flash('證書已下載！');
      }, 'image/png');
    } catch (e) {
      this.flash('這個瀏覽器不允許下載圖片');
    }
    NM.audio.play('levelClear');
  }

  flash(text) {
    this.msg = text;
    this.msgTime = 2;
  }

  update(dt) {
    this.t += dt;
    this.msgTime = Math.max(0, this.msgTime - dt);
    this.placeInput();
    // 輸入框沒有焦點時，Enter／Esc 由遊戲鍵盤處理
    if (document.activeElement !== this.input) {
      if (NM.input.wasPressed('confirm')) this.download();
      if (NM.input.wasPressed('pause')) this.leave();
    }
  }

  // 證書本體，(x, y, w, h) 是證書在畫布上的範圍；畫面預覽與下載共用
  drawCertificate(ctx, x, y, w, h) {
    const d = NM.draw;
    const s = w / 800; // 以 800 寬為基準縮放字級
    ctx.save();
    if (this.frame.complete && this.frame.naturalWidth) ctx.drawImage(this.frame, x, y, w, h);
    else {
      ctx.fillStyle = '#fff6df';
      ctx.fillRect(x, y, w, h);
    }
    const cx = x + w * 0.5;
    const ink = '#7a2e12';
    const opt = (size, color = ink, extra = {}) => ({ size: size * s, color, stroke: null, ...extra });
    // 左下角有主角、右下角有獎章，文字集中在中上方避開
    d.text(ctx, '今夜送單王', cx, y + h * 0.23, { ...opt(64, '#d9361e'), stroke: '#fff6df', strokeWidth: 8 * s });
    d.text(ctx, '茲證明', cx, y + h * 0.31, opt(20));
    d.text(ctx, this.name || '＿＿＿＿＿＿', cx, y + h * 0.405, opt(46, '#3a1a0a'));
    ctx.fillStyle = '#c9a25a';
    ctx.fillRect(cx - 180 * s, y + h * 0.43, 360 * s, 3 * s);
    d.text(ctx, '在《夜市送單王》完成全部三關挑戰', cx, y + h * 0.49, opt(19));
    d.text(ctx, '手腳俐落、使命必達，特頒此證以資鼓勵。', cx, y + h * 0.535, opt(19));
    d.text(ctx, `三關最佳收入合計 $${this.total}`, cx, y + h * 0.61, opt(19, '#b8860b'));
    const dt = this.date;
    d.text(ctx, `${dt.getFullYear()} 年 ${dt.getMonth() + 1} 月 ${dt.getDate()} 日`, cx, y + h * 0.67, opt(17));
    ctx.restore();
  }

  draw(ctx) {
    const d = NM.draw;
    const W = NM.config.width;
    ctx.fillStyle = '#2a1d3a';
    ctx.fillRect(0, 0, W, NM.config.height);
    // 證書預覽 4:3
    const ch = 620, cw = ch * 4 / 3;
    this.drawCertificate(ctx, (W - cw) / 2, 8, cw, ch);

    d.text(ctx, '名字：', 290, 676, { size: 20, align: 'right' });
    d.text(ctx, 'Enter 下載證書　Esc 回標題', 850, 676, { size: 20, color: '#ffe066' });
    if (this.msgTime > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, this.msgTime * 2);
      d.panel(ctx, W / 2 - 180, 300, 360, 60, { border: '#7dff7d' });
      d.text(ctx, this.msg, W / 2, 340, { size: 24, color: '#7dff7d' });
      ctx.restore();
    }
  }
};
