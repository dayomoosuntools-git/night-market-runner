// 夜市跑單幫：遊玩人次計數服務（Cloudflare Worker + D1）
//   GET  /count  → { count }        任何網站都能讀
//   POST /play   → { count }        只接受 ALLOWED_ORIGINS 裡的網站；同一個 IP 一分鐘內只算一次
// 不存原始 IP：只存「IP + 祕密 SALT」的 SHA-256 雜湊，而且一天後自動清掉

const COOLDOWN_MS = 60 * 1000;          // 同一個 IP 多久才能再算一次
const KEEP_IP_MS = 24 * 60 * 60 * 1000; // 防灌票紀錄保留多久

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
    const trusted = allowed.includes(origin);

    try {
      if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }), origin, trusted);

      if (url.pathname === '/count' && request.method === 'GET') {
        const count = await readCount(env);
        return cors(json({ count }, { 'Cache-Control': 'public, max-age=30' }), origin, true);
      }

      if (url.pathname === '/play' && request.method === 'POST') {
        if (!trusted) return cors(json({ error: 'forbidden' }, {}, 403), origin, false);
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const count = await recordPlay(env, ip, ctx);
        return cors(json({ count }, { 'Cache-Control': 'no-store' }), origin, true);
      }

      return cors(json({ error: 'not found' }, {}, 404), origin, trusted);
    } catch (err) {
      console.error(err);
      return cors(json({ error: 'server error' }, {}, 500), origin, trusted);
    }
  },
};

async function readCount(env) {
  const row = await env.DB.prepare('SELECT n FROM counters WHERE name = ?').bind('plays').first();
  return row ? row.n : 0;
}

async function recordPlay(env, ip, ctx) {
  const now = Date.now();
  const key = await sha256(`${env.SALT || ''}:${ip}`);

  // 冷卻中就不加，直接回目前人次（對玩家來說一樣正常）
  const seen = await env.DB.prepare('SELECT last FROM recent_ips WHERE hash = ?').bind(key).first();
  if (seen && now - seen.last < COOLDOWN_MS) return readCount(env);

  const [, counted] = await env.DB.batch([
    env.DB.prepare('INSERT INTO recent_ips (hash, last) VALUES (?, ?) ON CONFLICT(hash) DO UPDATE SET last = excluded.last').bind(key, now),
    env.DB.prepare("INSERT INTO counters (name, n) VALUES ('plays', 1) ON CONFLICT(name) DO UPDATE SET n = n + 1 RETURNING n"),
  ]);

  // 偶爾順手清掉過期的防灌票紀錄，不拖慢回應
  if (Math.random() < 0.02) {
    ctx.waitUntil(env.DB.prepare('DELETE FROM recent_ips WHERE last < ?').bind(now - KEEP_IP_MS).run());
  }
  return counted.results[0].n;
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function json(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff', ...headers },
  });
}

// 讀人次開放給所有網站；寫入只回應白名單網站
function cors(res, origin, allow) {
  if (allow && origin) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Vary', 'Origin');
  } else if (allow) {
    res.headers.set('Access-Control-Allow-Origin', '*');
  }
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set('Access-Control-Max-Age', '86400');
  return res;
}
