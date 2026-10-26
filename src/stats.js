// 遊玩人次：向計數服務（worker/，Cloudflare Worker）讀取與回報
// 計數服務掛掉、太慢或沒設定網址時就默默不顯示，絕不影響遊戲本身
NM.stats = {
  count: null,       // 目前總人次；null = 還沒拿到（畫面上就不顯示）
  timeoutMs: 4000,

  get endpoint() {
    return (NM.config.stats && NM.config.stats.endpoint) || '';
  },

  async request(path, method = 'GET') {
    if (!this.endpoint) return null;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await fetch(this.endpoint.replace(/\/$/, '') + path, { method, signal: ctrl.signal });
      if (!res.ok) return null;
      const data = await res.json();
      return Number.isFinite(data.count) ? data.count : null;
    } catch (e) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  },

  async load() {
    const n = await this.request('/count');
    if (n !== null) this.count = n;
  },

  // 每個分頁只在第一次開始關卡時算一次，重玩、換關不會重複灌票
  async recordPlay() {
    try {
      if (sessionStorage.getItem('nm-played')) return;
      sessionStorage.setItem('nm-played', '1');
    } catch (e) { /* 無痕模式：照樣回報一次 */ }
    const n = await this.request('/play', 'POST');
    if (n !== null) this.count = n;
  },

  // 標題畫面右下角的小標籤
  draw(ctx) {
    if (this.count === null) return;
    const W = NM.config.width, H = NM.config.height;
    const text = `已有 ${this.count.toLocaleString('zh-TW')} 人次來夜市送單`;
    NM.draw.text(ctx, text, W - 20, H - 16, { size: 16, color: '#ffe9b0', align: 'right' });
  },
};
