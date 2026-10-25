-- 遊玩人次計數
CREATE TABLE IF NOT EXISTS counters (
  name TEXT PRIMARY KEY,
  n INTEGER NOT NULL DEFAULT 0
);

-- 防灌票：IP 經加鹽雜湊後的最後回報時間（毫秒），一天後清除
CREATE TABLE IF NOT EXISTS recent_ips (
  hash TEXT PRIMARY KEY,
  last INTEGER NOT NULL
);

INSERT OR IGNORE INTO counters (name, n) VALUES ('plays', 0);
