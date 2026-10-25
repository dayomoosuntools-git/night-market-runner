// 由 manifest.json 產生，讓 index.html 直接雙擊開啟也能載入（file:// 無法 fetch JSON）
window.NM = window.NM || {};
NM.manifest = {
  "version": 5,
  "style": "cute 3D clay chibi, soft lighting, night market (v2)",
  "source": "Higgsfield nano_banana_pro + image_background_remover; pixel v1 kept in assets/_pixel_v1",
  "assets": {
    "characters": {
      "crowd_1": {
        "path": "assets/characters/crowd_1.png",
        "label": "人潮-帽T男",
        "width": 358,
        "height": 640,
        "transparent": true
      },
      "crowd_2": {
        "path": "assets/characters/crowd_2.png",
        "label": "人潮-阿姨",
        "width": 330,
        "height": 640,
        "transparent": true
      },
      "crowd_3": {
        "path": "assets/characters/crowd_3.png",
        "label": "人潮-小孩",
        "width": 204,
        "height": 640,
        "transparent": true
      },
      "customer_1": {
        "path": "assets/characters/customer_1.png",
        "label": "客人-上班族",
        "width": 292,
        "height": 640,
        "transparent": true
      },
      "customer_2": {
        "path": "assets/characters/customer_2.png",
        "label": "客人-學生",
        "width": 298,
        "height": 640,
        "transparent": true
      },
      "customer_3": {
        "path": "assets/characters/customer_3.png",
        "label": "客人-阿公",
        "width": 326,
        "height": 640,
        "transparent": true
      },
      "customer_4": {
        "path": "assets/characters/customer_4.png",
        "label": "客人-觀光客",
        "width": 368,
        "height": 640,
        "transparent": true
      },
      "helper": {
        "path": "assets/characters/helper.png",
        "label": "AI 幫手",
        "width": 314,
        "height": 640,
        "transparent": true
      },
      "player": {
        "path": "assets/characters/player.png",
        "label": "玩家",
        "width": 352,
        "height": 640,
        "transparent": true
      }
    },
    "stalls": {
      "bubble_tea": {
        "path": "assets/stalls/bubble_tea.png",
        "label": "珍珠奶茶",
        "width": 474,
        "height": 640,
        "transparent": true
      },
      "chicken_cutlet": {
        "path": "assets/stalls/chicken_cutlet.png",
        "label": "雞排",
        "width": 504,
        "height": 640,
        "transparent": true
      },
      "oyster_omelet": {
        "path": "assets/stalls/oyster_omelet.png",
        "label": "蚵仔煎",
        "width": 504,
        "height": 640,
        "transparent": true
      },
      "sausage": {
        "path": "assets/stalls/sausage.png",
        "label": "大腸包小腸",
        "width": 448,
        "height": 640,
        "transparent": true
      },
      "stinky_tofu": {
        "path": "assets/stalls/stinky_tofu.png",
        "label": "臭豆腐",
        "width": 518,
        "height": 640,
        "transparent": true
      },
      "sweet_potato_ball": {
        "path": "assets/stalls/sweet_potato_ball.png",
        "label": "地瓜球",
        "width": 470,
        "height": 640,
        "transparent": true
      },
      "herbal_rib_soup": {
        "path": "assets/stalls/herbal_rib_soup.png",
        "label": "藥燉排骨",
        "width": 480,
        "height": 640,
        "transparent": true
      },
      "braised_pork_rice": {
        "path": "assets/stalls/braised_pork_rice.png",
        "label": "滷肉飯",
        "width": 502,
        "height": 640,
        "transparent": true
      },
      "shop": {
        "label": "商店",
        "transparent": true,
        "path": "assets/stalls/shop.png",
        "width": 460,
        "height": 640
      }
    },
    "food": {
      "bubble_tea": {
        "path": "assets/food/bubble_tea.png",
        "label": "珍珠奶茶",
        "width": 238,
        "height": 400,
        "transparent": true
      },
      "chicken_cutlet": {
        "path": "assets/food/chicken_cutlet.png",
        "label": "雞排",
        "width": 306,
        "height": 400,
        "transparent": true
      },
      "oyster_omelet": {
        "path": "assets/food/oyster_omelet.png",
        "label": "蚵仔煎",
        "width": 400,
        "height": 278,
        "transparent": true
      },
      "sausage": {
        "path": "assets/food/sausage.png",
        "label": "大腸包小腸",
        "width": 400,
        "height": 264,
        "transparent": true
      },
      "stinky_tofu": {
        "path": "assets/food/stinky_tofu.png",
        "label": "臭豆腐",
        "width": 400,
        "height": 296,
        "transparent": true
      },
      "sweet_potato_ball": {
        "path": "assets/food/sweet_potato_ball.png",
        "label": "地瓜球",
        "width": 254,
        "height": 400,
        "transparent": true
      },
      "braised_pork_rice": {
        "path": "assets/food/braised_pork_rice.png",
        "label": "滷肉飯",
        "width": 400,
        "height": 316,
        "transparent": true
      },
      "herbal_rib_soup": {
        "path": "assets/food/herbal_rib_soup.png",
        "label": "藥燉排骨",
        "width": 330,
        "height": 400,
        "transparent": true
      }
    },
    "props": {
      "lantern": {
        "path": "assets/props/lantern.png",
        "label": "燈籠",
        "width": 204,
        "height": 400,
        "transparent": true
      },
      "queue_marker": {
        "path": "assets/props/queue_marker.png",
        "label": "排隊人群",
        "width": 400,
        "height": 378,
        "transparent": true
      },
      "trash_can": {
        "path": "assets/props/trash_can.png",
        "label": "垃圾桶",
        "width": 310,
        "height": 400,
        "transparent": true
      }
    },
    "backgrounds": {
      "street_map": {
        "path": "assets/backgrounds/street_map.png",
        "label": "夜市街道地圖",
        "width": 1920,
        "height": 1072,
        "transparent": false
      }
    },
    "ui": {
      "button": {
        "path": "assets/ui/button.png",
        "label": "按鈕",
        "width": 600,
        "height": 160,
        "transparent": true
      },
      "coin": {
        "path": "assets/ui/coin.png",
        "label": "金幣",
        "width": 480,
        "height": 440,
        "transparent": true
      },
      "logo": {
        "path": "assets/ui/logo.png",
        "label": "標題 Logo",
        "width": 1000,
        "height": 232,
        "transparent": true
      },
      "order_card": {
        "path": "assets/ui/order_card.png",
        "label": "訂單卡",
        "width": 308,
        "height": 480,
        "transparent": true
      },
      "patience_bar": {
        "path": "assets/ui/patience_bar.png",
        "label": "耐心條外框",
        "width": 800,
        "height": 220,
        "transparent": true
      },
      "shoes": {
        "label": "加速跑鞋",
        "transparent": true,
        "path": "assets/ui/shoes.png",
        "width": 400,
        "height": 266
      },
      "big_bag": {
        "label": "大外送箱",
        "transparent": true,
        "path": "assets/ui/big_bag.png",
        "width": 400,
        "height": 380
      },
      "magic_bag": {
        "label": "百寶袋",
        "transparent": true,
        "path": "assets/ui/magic_bag.png",
        "width": 322,
        "height": 400
      }
    }
  },
  "audio": {}
};
