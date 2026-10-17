// Shared request/response helpers for the serverless functions.
// Files in api/_lib are not exposed as routes on Vercel (underscore prefix).

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

// Raw body as a string. Read the stream first so signature checks see the exact bytes.
function readRaw(req, max = 100000) {
  return new Promise((resolve, reject) => {
    if (req.readableEnded) {
      const b = req.body;
      if (Buffer.isBuffer(b)) return resolve(b.toString('utf8'));
      if (typeof b === 'string') return resolve(b);
      return resolve(b ? JSON.stringify(b) : '');
    }
    const chunks = []; let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > max) { reject(new Error('too-large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function readJson(req, max = 20000) {
  const raw = await readRaw(req, max);
  return raw ? JSON.parse(raw) : {};
}

// Reject requests posted from other websites.
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  try { return new URL(origin).host === host; } catch { return false; }
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
}

// Best-effort, per-instance rate limiter. Stops casual abuse bursts.
function rateLimiter(max, windowMs) {
  const hits = new Map();
  return (key) => {
    const now = Date.now();
    const h = hits.get(key) || { n: 0, t: now };
    if (now - h.t > windowMs) { h.n = 0; h.t = now; }
    h.n += 1; hits.set(key, h);
    if (hits.size > 5000) hits.clear();
    return h.n > max;
  };
}

// Single-line text: strip control characters, trim, cap length.
const line = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
// Multi-line text: keep newlines, strip other control characters.
const block = (v, max) => String(v ?? '').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0009\u000b-\u001f\u007f]+/g, ' ').trim().slice(0, max);
const html = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

module.exports = { send, readRaw, readJson, sameOrigin, clientIp, rateLimiter, line, block, html };
