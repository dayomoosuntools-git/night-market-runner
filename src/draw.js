// 共用的繪圖小工具
NM.draw = {
  text(ctx, str, x, y, { size = 20, color = '#fff', align = 'center', weight = 'bold', stroke = '#1a1d3a', strokeWidth = 4, baseline = 'alphabetic' } = {}) {
    ctx.save();
    ctx.font = `${weight} ${size}px ${NM.config.font}`;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    if (stroke) {
      ctx.lineJoin = 'round';
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = stroke;
      ctx.strokeText(str, x, y);
    }
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
    ctx.restore();
  },

  panel(ctx, x, y, w, h, { fill = 'rgba(20, 22, 48, 0.85)', border = '#ffb347', radius = 10, lineWidth = 3 } = {}) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fillStyle = fill;
    ctx.fill();
    if (border) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = border;
      ctx.stroke();
    }
    ctx.restore();
  },

  // 剩餘比例條：綠 → 黃 → 紅
  bar(ctx, x, y, w, h, ratio) {
    ratio = Math.max(0, Math.min(1, ratio));
    ctx.save();
    ctx.fillStyle = '#1a1d3a';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    ctx.fillStyle = ratio > 0.5 ? '#5ad15a' : ratio > 0.25 ? '#ffc93c' : '#ff4d4d';
    ctx.fillRect(x, y, w * ratio, h);
    ctx.restore();
  },

  money(v) {
    return v < 0 ? `-$${-v}` : `$${v}`;
  },

  shadow(ctx, x, y, rx, ry = rx * 0.35) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },
};
