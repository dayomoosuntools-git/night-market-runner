// 進入點：載入素材、場景切換、遊戲迴圈
NM.main = {
  scene: null,

  setScene(scene) {
    this.scene = scene;
  },

  async start() {
    const canvas = document.getElementById('game');
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';

    NM.draw.text(ctx, '載入中…', NM.config.width / 2, NM.config.height / 2, { size: 28 });
    await NM.assets.load();
    NM.audio.load();
    NM.save.load();
    NM.stats.load(); // 不等它，拿到人次後標題畫面才顯示
    this.setScene(new NM.TitleScene());

    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); // 分頁切走回來不要一次跳太多
      last = now;
      this.scene.update(dt);
      NM.input.endFrame();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.scene.draw(ctx);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  },
};

NM.main.start();
