// 依 manifest 載入所有圖片；缺圖時畫佔位色塊，換圖只要替換 PNG 或改 manifest
NM.assets = {
  images: {},

  load() {
    const jobs = [];
    for (const [group, items] of Object.entries(NM.manifest.assets)) {
      for (const [key, info] of Object.entries(items)) {
        const id = `${group}/${key}`;
        jobs.push(new Promise((resolve) => {
          const img = new Image();
          img.onload = () => { this.images[id] = img; resolve(); };
          img.onerror = () => { console.warn('素材載入失敗：', info.path); resolve(); };
          img.src = `${info.path}?v=${NM.manifest.version}`; // 換素材時改 version 讓瀏覽器重抓
        }));
      }
    }
    return Promise.all(jobs);
  },

  get(id) {
    return this.images[id];
  },

  // 以腳底 (x, y) 為錨點畫角色/物件，高度 h，寬度依原圖比例
  drawSprite(ctx, id, x, y, h, { flip = false, alpha = 1 } = {}) {
    const img = this.images[id];
    const w = img ? h * img.width / img.height : h * 0.6;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.translate(x, y);
    if (flip) ctx.scale(-1, 1);
    if (img) ctx.drawImage(img, -w / 2, -h, w, h);
    else this.placeholder(ctx, id, -w / 2, -h, w, h);
    ctx.restore();
    return w;
  },

  // 等比例塞進 (cx, cy) 為中心、最大 maxW × maxH 的框
  drawFit(ctx, id, cx, cy, maxW, maxH, alpha = 1) {
    const img = this.images[id];
    let w = maxW, h = maxH;
    if (img) {
      const s = Math.min(maxW / img.width, maxH / img.height);
      w = img.width * s;
      h = img.height * s;
    }
    ctx.save();
    ctx.globalAlpha *= alpha;
    if (img) ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
    else this.placeholder(ctx, id, cx - w / 2, cy - h / 2, w, h);
    ctx.restore();
  },

  placeholder(ctx, id, x, y, w, h) {
    ctx.fillStyle = '#c0397a';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = `12px ${NM.config.font}`;
    ctx.textAlign = 'center';
    ctx.fillText(id.split('/').pop(), x + w / 2, y + h / 2);
  },
};
