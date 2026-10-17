// GET /api/pay-status?id=qr_xxx&t=token
// Tells the browser whether its QR has been paid. The answer comes from Razorpay,
// never from the browser. Only QR codes issued by this site (valid token) can be checked.
//
// Limits (per warm instance):
//  - per IP: high ceiling so several customers on one office/mobile network are fine,
//    while still stopping someone from using this endpoint to flood Razorpay.
//  - per QR: enough for one customer polling every 4s for the whole QR lifetime.
//    Counted only AFTER the token is verified, so nobody can use up another
//    customer's allowance without that customer's token.
// A short cache means repeated polls don't all hit Razorpay.
const { send, clientIp, rateLimiter } = require('./_lib/http');
const { rzp, razorpayConfigured, qrToken, safeEqual } = require('./_lib/razorpay');

const ipLimited = rateLimiter(900, 10 * 60 * 1000);   // ~6 customers polling at once from one IP
const qrLimited = rateLimiter(400, 30 * 60 * 1000);   // one QR: 15 min @ 4s = 225, plus headroom
const PENDING_TTL_MS = 3000;                          // re-ask Razorpay at most every 3s per QR
const cache = new Map();                              // qrId -> { status, at }

function cached(id) {
  const c = cache.get(id);
  if (!c) return null;
  if (c.status !== 'pending') return c.status;         // paid/expired are final
  return Date.now() - c.at < PENDING_TTL_MS ? c.status : null;
}
function remember(id, status) {
  if (cache.size > 5000) cache.clear();
  cache.set(id, { status, at: Date.now() });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return send(res, 405, { error: 'Method not allowed' }); }

  // Every request (valid or not) counts toward the per-IP ceiling.
  if (ipLimited(clientIp(req))) { res.setHeader('Retry-After', '15'); return send(res, 429, { error: 'Too many requests' }); }

  const q = new URL(req.url, 'http://local').searchParams;
  const id = q.get('id') || '';
  const token = q.get('t') || '';
  if (!/^qr_[A-Za-z0-9]{6,30}$/.test(id) || !/^[a-f0-9]{32}$/.test(token)) return send(res, 400, { error: 'Invalid request' });
  if (!razorpayConfigured()) return send(res, 503, { error: 'Not configured' });
  if (!safeEqual(qrToken(id), token)) return send(res, 403, { error: 'Forbidden' });

  // Token verified: this request really is from the customer who owns this QR.
  const hit = cached(id);
  if (hit) return send(res, 200, { status: hit });
  if (qrLimited(id)) { res.setHeader('Retry-After', '15'); return send(res, 429, { error: 'Too many requests' }); }

  try {
    const qr = await rzp('GET', `/payments/qr_codes/${id}`);
    const received = Number(qr.payments_amount_received || 0);
    const expected = Number(qr.payment_amount || 0);
    let status = 'pending';
    if (expected > 0 && received >= expected) status = 'paid';
    else if (qr.status === 'closed') status = qr.close_reason === 'paid' ? 'paid' : 'expired';
    remember(id, status);
    return send(res, 200, { status });
  } catch (err) {
    console.error('[pay-status] lookup failed:', err.status || '', err.message);
    return send(res, 502, { error: 'Could not check payment status' });
  }
};
