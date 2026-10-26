// 進度存檔（localStorage）：每關是否通過、最佳收入、證書名字；讀寫失敗時就只存在記憶體裡
// 商店道具不存檔：只在一路過關時帶到下一關（見 GameScene 的 items）
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
