// 進度存檔（localStorage）：每關是否通過、最佳收入、商店升級；讀寫失敗時就只存在記憶體裡
NM.save = {
  key: 'nm-progress-v1',
  data: null,

  load() {
    const n = NM.config.levels.length;
    let d = null;
    try {
      d = JSON.parse(localStorage.getItem(this.key));
    } catch (e) { /* 無痕模式或被封鎖 */ }
    this.data = {
      cleared: Array.from({ length: n }, (_, i) => !!(d && d.cleared && d.cleared[i])),
      best: Array.from({ length: n }, (_, i) => (d && d.best && d.best[i]) || 0),
      name: (d && d.name) || '',
      shoes: (d && d.shoes) || 0,    // 加速跑鞋等級
      bag: (d && d.bag) || 0,        // 大外送箱等級（背包格數 +bag）
      magic: (d && d.magic) || 0,    // 百寶袋數量
    };
  },

  write() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    } catch (e) { /* 忽略 */ }
  },

  recordLevel(i, cleared, money) {
    if (cleared) this.data.cleared[i] = true;
    this.data.best[i] = Math.max(this.data.best[i], money);
    this.write();
  },

  useMagic() {
    if (this.data.magic <= 0) return false;
    this.data.magic--;
    this.write();
    return true;
  },

  allCleared() {
    return this.data.cleared.every(Boolean);
  },

  bestTotal() {
    return this.data.best.reduce((s, v) => s + v, 0);
  },

  setName(name) {
    this.data.name = name;
    this.write();
  },
};
