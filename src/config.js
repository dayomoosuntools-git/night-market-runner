// 所有平衡數值集中在這裡，調整手感只改這個檔
window.NM = window.NM || {};

NM.config = {
  width: 1280,
  height: 720,
  font: '"PingFang TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif',

  player: {
    speed: 310,       // px/秒，跑完整條街約 4 秒
    height: 78,       // 畫面上的角色高度
    radius: 16,       // 碰撞半徑
    reach: 80,        // 能互動的距離
    bagSize: 3,
    start: { x: 640, y: 430 },
  },

  // 玩家腳底能走的範圍（街道）
  street: { left: 30, right: 1250, top: 300, bottom: 575 },

  foods: {
    chicken_cutlet:    { name: '雞排',       price: 70 },
    bubble_tea:        { name: '珍珠奶茶',   price: 55 },
    stinky_tofu:       { name: '臭豆腐',     price: 60 },
    oyster_omelet:     { name: '蚵仔煎',     price: 75 },
    sausage:           { name: '大腸包小腸', price: 65 },
    sweet_potato_ball: { name: '地瓜球',     price: 45 },
    braised_pork_rice: { name: '滷肉飯',     price: 50 },
    herbal_rib_soup:   { name: '藥燉排骨',   price: 80 },
  },

  tipRate: 0.5,         // 小費 = 餐費 × tipRate × 剩餘耐心比例
  discardCost: 20,      // 丟棄一份扣的錢
  timeoutPenalty: 10,   // 客人超時離開扣的錢

  // row: top 攤位在街道上方（從下方取餐），bottom 在下方（從上方取餐）
  stalls: [
    { food: 'chicken_cutlet',    x: 170,  row: 'top' },
    { food: 'bubble_tea',        x: 490,  row: 'top' },
    { food: 'stinky_tofu',       x: 810,  row: 'top' },
    { food: 'braised_pork_rice', x: 1110, row: 'top' },
    { food: 'oyster_omelet',     x: 170,  row: 'bottom' },
    { food: 'sausage',           x: 640,  row: 'bottom' },
    { food: 'sweet_potato_ball', x: 900,  row: 'bottom' },
    { food: 'herbal_rib_soup',   x: 1130, row: 'bottom' },
  ],
  stallLayout: {
    top:    { baseline: 272, height: 150 },
    bottom: { baseline: 722, height: 140 },
  },

  trashCans: [
    { x: 70,   y: 450 },
    { x: 1210, y: 450 },
  ],

  customer: {
    height: 74,
    sprites: ['customer_1', 'customer_2', 'customer_3', 'customer_4'],
    spawnArea: { left: 150, right: 1130, top: 345, bottom: 545 },
    minGap: 95,
  },

  // 路人：在街上左右閒逛，會擋路（推開玩家）
  crowd: {
    sprites: ['crowd_1', 'crowd_3'],   // crowd_2（阿姨）留給打工的老闆娘，避免認錯
    height: 76,
    radius: 14,
    speedMin: 35, speedMax: 70,
  },

  queue: {
    waitMin: 1, waitMax: 2,           // 排隊要等幾秒
    durationMin: 6, durationMax: 10,  // 排隊狀態持續多久
  },

  levels: [
    {
      name: '第 1 關', duration: 90, target: 350,
      stalls: ['chicken_cutlet', 'bubble_tea', 'stinky_tofu', 'braised_pork_rice'],
      patience: 18, spawnEvery: 5.5, maxCustomers: 3, queueEvery: 25, crowd: 2,
      hint: true,
    },
    {
      name: '第 2 關', duration: 90, target: 800,
      stalls: ['chicken_cutlet', 'bubble_tea', 'stinky_tofu', 'braised_pork_rice', 'oyster_omelet', 'sausage'],
      patience: 10, spawnEvery: 3.4, maxCustomers: 6, queueEvery: 9, crowd: 6,
    },
    {
      name: '第 3 關', duration: 90, target: 1100,
      stalls: ['chicken_cutlet', 'bubble_tea', 'stinky_tofu', 'braised_pork_rice', 'oyster_omelet', 'sausage', 'sweet_potato_ball', 'herbal_rib_soup'],
      patience: 8.5, spawnEvery: 2.6, maxCustomers: 6, queueEvery: 7, crowd: 7,
    },
  ],

  // 打工事件：關卡中老闆娘偶爾出現在街上喊缺人手，走過去按空白鍵就開始打工
  // 出現的餐點只有這一關開放的攤位（第 1 關 4 種、第 2 關 6 種、第 3 關 8 種）
  // 打工時關卡時間照走、客人耐心照扣，賺到的工資直接算進這一關的收入；按錯、漏單不扣錢，只會中斷連擊
  work: {
    duration: 15,
    hitX: 250,                         // 判定線，食物越過就算漏接
    speedStart: 150, speedEnd: 220,    // 滑動速度 px/秒，隨時間慢慢加速
    spawnStart: 1.3, spawnEnd: 0.95,   // 出現間隔（秒）
    pay: 6,                            // 每接對一份的工資（全對約 $100～115）
    goldChance: 0.12, goldMult: 3,     // 金色訂單：工資 ×3
    comboSteps: [8, 16],               // 連擊達到這些數字，倍率 ×2、×3
    eventTimes: [18, 52],              // 老闆娘大約在開場後幾秒出現（±4 秒）
    eventStay: 10,                     // 沒去找她的話，幾秒後離開
  },

  // 商店：夜市裡的商店攤，隨時走過去按空白鍵光顧，用這關賺到的錢買（逛商店時夜市暫停）
  // 鞋子、背包買了就永久生效，百寶袋是消耗品
  shop: {
    kiosk: { x: 650, row: 'top', height: 130 },
    shoes: { name: '加速跑鞋', desc: '移動速度 +20%', prices: [120, 200, 300], speedPerLevel: 0.2 },
    bag:   { name: '大外送箱', desc: '背包多 1 格', prices: [150, 250] },
    magic: { name: '百寶袋', desc: '按 F 發動 10 秒：交餐自動拿對的，不用 Q/E 換', price: 80, max: 3, duration: 10 },
  },

  // 遊玩人次計數服務（worker/，部署在 Cloudflare）；留空就不計數、不顯示
  // 換網址時，index.html 的 Content-Security-Policy connect-src 也要一起改
  stats: {
    endpoint: 'https://night-market-counter.dayomoosun.workers.dev',
  },
};
