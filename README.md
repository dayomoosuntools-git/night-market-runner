# 夜市跑單幫

台灣夜市跑腿送單的單機網頁小遊戲：90 秒內到攤位拿雞排、珍奶、臭豆腐……送到指定客人手上，賺到目標金額就過關。

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

- 三關，難度遞增；三關全過可下載「夜市跑單王」證書
- 背包有格數上限，拿錯可以丟進垃圾桶（扣錢）
- 老闆娘出現時可以去打工，用數字鍵出餐賺額外工資
- 夜市裡的商店攤隨時能買加速跑鞋、大外送箱、百寶袋

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

## 製作

- 程式：Claude Code
- 美術：Higgsfield（nano banana pro）產生後去背
- 音效與音樂：Web Audio 即時合成
