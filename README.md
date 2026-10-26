# 夜市送單王

台灣夜市跑腿送單的單機網頁小遊戲：限時內到攤位拿雞排、珍奶、臭豆腐……送到指定客人手上，賺到目標金額就過關。

**線上遊玩：** https://dayomoosuntools-git.github.io/night-market-runner/

## 操作

| 按鍵 | 功能 |
|---|---|
| WASD／方向鍵 | 移動 |
| 空白鍵 | 取餐、交餐、丟棄、打工、逛商店 |
| Q／E | 切換手上的餐點 |
| F | 發動百寶袋 |
| Esc | 暫停 |
| M | 靜音 |

## 玩法重點

- 三關，難度遞增（第 1 關 60 秒，第 2、3 關 90 秒）；三關全過可下載「今夜送單王」證書
- 每次進入關卡先顯示操作說明，按 Enter／空白鍵關閉後才開始計時
- 背包有格數上限，拿錯可以丟進垃圾桶（扣錢）
- 老闆娘出現時可以去打工，用數字鍵出餐賺額外工資
- 夜市裡的商店攤隨時能買加速跑鞋、大外送箱、百寶袋
  - 買到的道具過關後帶到下一關；失敗重玩或從標題重新開始，道具歸零重新計算
- 第 2、3 關新開的攤位招牌上會掛「新開張」，開場也會公告新攤位在哪一排

## 本機執行

不需要安裝任何東西，直接用瀏覽器打開 `index.html` 即可。

## 專案結構

- `index.html`、`style.css`、`src/`：遊戲程式（純 HTML + JavaScript，Canvas 2D）
- `src/config.js`：所有平衡數值
- `assets/`：美術素材，清單在 `assets/manifest.json`
  - `_raw/`、`_raw_3d/`：AI 產生的原始圖
  - `_pixel_v1/`：早期像素風版本
  - `_mockups_3d/`：3D 風格示意圖
- `PRD.md`：遊戲企劃
- `worker/`：遊玩人次計數服務（Cloudflare Worker + D1）

## 遊玩人次計數

標題畫面右下角顯示的人次來自 `worker/` 的計數服務：

- 每個分頁第一次開始關卡時回報一次；同一個 IP 一分鐘內只算一次
- 只有正式網址 `https://dayomoosuntools-git.github.io` 能回報，其他網站只能讀
- 不保存原始 IP，只存加鹽雜湊，一天後自動刪除；也關閉了 Cloudflare 的每次請求紀錄
- 計數服務連不上時遊戲照常運作，只是不顯示人次

重新部署：

```bash
cd worker
npm install
npx wrangler deploy
```

第一次在新帳號部署需要 `npx wrangler login`、`npx wrangler d1 create night-market-counter`（把 id 填進 `wrangler.toml`）、`npx wrangler d1 migrations apply night-market-counter --remote`，以及用 `npx wrangler secret put SALT` 設定一組隨機字串。

## 製作

- 程式：Claude Code
- 美術：Higgsfield（nano banana pro）產生後去背
- 音效與音樂：Web Audio 即時合成
