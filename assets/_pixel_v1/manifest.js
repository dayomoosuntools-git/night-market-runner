// 由 manifest.json 產生，讓 index.html 直接雙擊開啟也能載入（file:// 無法 fetch JSON）
window.NM = window.NM || {};
NM.manifest = {
  "version": 1,
  "style": "16-bit pixel art, 3/4 top-down, night market warm neon",
  "source": "Higgsfield nano_banana_pro + image_background_remover",
  "assets": {
    "characters": {
      "crowd_1": {
        "path": "assets/characters/crowd_1.png",
        "label": "人潮-帽T男",
        "width": 292,
        "height": 632,
        "transparent": true
      },
      "crowd_2": {
        "path": "assets/characters/crowd_2.png",
        "label": "人潮-阿姨",
        "width": 298,
        "height": 714,
        "transparent": true
      },
      "crowd_3": {
        "path": "assets/characters/crowd_3.png",
        "label": "人潮-小孩",
        "width": 284,
        "height": 510,
        "transparent": true
      },
      "customer_1": {
        "path": "assets/characters/customer_1.png",
        "label": "客人-上班族",
        "width": 262,
        "height": 480,
        "transparent": true
      },
      "customer_2": {
        "path": "assets/characters/customer_2.png",
        "label": "客人-學生",
        "width": 280,
        "height": 668,
        "transparent": true
      },
      "customer_3": {
        "path": "assets/characters/customer_3.png",
        "label": "客人-阿公",
        "width": 274,
        "height": 752,
        "transparent": true
      },
      "customer_4": {
        "path": "assets/characters/customer_4.png",
        "label": "客人-觀光客",
        "width": 274,
        "height": 616,
        "transparent": true
      },
      "helper": {
        "path": "assets/characters/helper.png",
        "label": "AI 幫手",
        "width": 336,
        "height": 646,
        "transparent": true
      },
      "player": {
        "path": "assets/characters/player.png",
        "label": "玩家",
        "width": 280,
        "height": 516,
        "transparent": true
      }
    },
    "stalls": {
      "bubble_tea": {
        "path": "assets/stalls/bubble_tea.png",
        "label": "珍珠奶茶",
        "width": 534,
        "height": 782,
        "transparent": true
      },
      "chicken_cutlet": {
        "path": "assets/stalls/chicken_cutlet.png",
        "label": "雞排",
        "width": 576,
        "height": 846,
        "transparent": true
      },
      "oyster_omelet": {
        "path": "assets/stalls/oyster_omelet.png",
        "label": "蚵仔煎",
        "width": 530,
        "height": 724,
        "transparent": true
      },
      "sausage": {
        "path": "assets/stalls/sausage.png",
        "label": "大腸包小腸",
        "width": 502,
        "height": 738,
        "transparent": true
      },
      "stinky_tofu": {
        "path": "assets/stalls/stinky_tofu.png",
        "label": "臭豆腐",
        "width": 466,
        "height": 688,
        "transparent": true
      },
      "sweet_potato_ball": {
        "path": "assets/stalls/sweet_potato_ball.png",
        "label": "地瓜球",
        "width": 482,
        "height": 714,
        "transparent": true
      },
      "herbal_rib_soup": {
        "path": "assets/stalls/herbal_rib_soup.png",
        "label": "藥燉排骨",
        "width": 578,
        "height": 716,
        "transparent": true
      },
      "braised_pork_rice": {
        "path": "assets/stalls/braised_pork_rice.png",
        "label": "滷肉飯",
        "width": 532,
        "height": 724,
        "transparent": true
      }
    },
    "food": {
      "bubble_tea": {
        "path": "assets/food/bubble_tea.png",
        "label": "珍珠奶茶",
        "width": 280,
        "height": 454,
        "transparent": true
      },
      "chicken_cutlet": {
        "path": "assets/food/chicken_cutlet.png",
        "label": "雞排",
        "width": 460,
        "height": 670,
        "transparent": true
      },
      "oyster_omelet": {
        "path": "assets/food/oyster_omelet.png",
        "label": "蚵仔煎",
        "width": 692,
        "height": 488,
        "transparent": true
      },
      "sausage": {
        "path": "assets/food/sausage.png",
        "label": "大腸包小腸",
        "width": 614,
        "height": 476,
        "transparent": true
      },
      "stinky_tofu": {
        "path": "assets/food/stinky_tofu.png",
        "label": "臭豆腐",
        "width": 446,
        "height": 416,
        "transparent": true
      },
      "sweet_potato_ball": {
        "path": "assets/food/sweet_potato_ball.png",
        "label": "地瓜球",
        "width": 312,
        "height": 390,
        "transparent": true
      },
      "braised_pork_rice": {
        "path": "assets/food/braised_pork_rice.png",
        "label": "滷肉飯",
        "width": 492,
        "height": 430,
        "transparent": true
      },
      "herbal_rib_soup": {
        "path": "assets/food/herbal_rib_soup.png",
        "label": "藥燉排骨",
        "width": 346,
        "height": 264,
        "transparent": true
      }
    },
    "props": {
      "lantern": {
        "path": "assets/props/lantern.png",
        "label": "燈籠",
        "width": 222,
        "height": 340,
        "transparent": true
      },
      "queue_marker": {
        "path": "assets/props/queue_marker.png",
        "label": "排隊人群",
        "width": 284,
        "height": 412,
        "transparent": true
      },
      "trash_can": {
        "path": "assets/props/trash_can.png",
        "label": "垃圾桶",
        "width": 424,
        "height": 568,
        "transparent": true
      }
    },
    "backgrounds": {
      "street_map": {
        "path": "assets/backgrounds/street_map.png",
        "label": "夜市街道地圖",
        "width": 2752,
        "height": 1536,
        "transparent": false
      }
    },
    "ui": {
      "button": {
        "path": "assets/ui/button.png",
        "label": "按鈕",
        "width": 766,
        "height": 210,
        "transparent": true
      },
      "coin": {
        "path": "assets/ui/coin.png",
        "label": "金幣",
        "width": 446,
        "height": 442,
        "transparent": true
      },
      "logo": {
        "path": "assets/ui/logo.png",
        "label": "標題 Logo",
        "width": 2192,
        "height": 486,
        "transparent": true
      },
      "order_card": {
        "path": "assets/ui/order_card.png",
        "label": "訂單卡",
        "width": 450,
        "height": 554,
        "transparent": true
      },
      "patience_bar": {
        "path": "assets/ui/patience_bar.png",
        "label": "耐心條外框",
        "width": 1306,
        "height": 220,
        "transparent": true
      }
    }
  },
  "audio": {}
};
