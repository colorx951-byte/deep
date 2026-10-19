// POST /api/pay-verify
// Called by the browser after Razorpay Checkout reports success. Nothing from the browser
// is trusted on its own:
//  1. the Checkout signature HMAC("order_id|payment_id", key secret) must match,
//  2. the payment is then fetched from Razorpay and must belong to this order,
//     be for exactly the order amount, and be captured.
// Only then does the page show "Payment Received". The webhook remains the final record.
const { send, readJson, sameOrigin, clientIp, rateLimiter } = require('./_lib/http');
const { rzp, razorpayConfigured, qrToken, safeEqual, validCheckoutSignature } = require('./_lib/razorpay');

const ipLimited = rateLimiter(60, 10 * 60 * 1000);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { error: 'Method not allowed' }); }
  if (!sameOrigin(req)) return send(res, 403, { error: 'Forbidden' });
  if (ipLimited(clientIp(req))) { res.setHeader('Retry-After', '30'); return send(res, 429, { error: 'Too many requests' }); }

  let b;
  try { b = await readJson(req); } catch { return send(res, 400, { error: 'Invalid request' }); }
  const orderId = String(b.razorpay_order_id || '');
  const paymentId = String(b.razorpay_payment_id || '');
  const signature = String(b.razorpay_signature || '');
  const token = String(b.t || '');

  if (!/^order_[A-Za-z0-9]{6,30}$/.test(orderId) || !/^pay_[A-Za-z0-9]{6,30}$/.test(paymentId) || !/^[a-f0-9]{32}$/.test(token)) {
    return send(res, 400, { error: 'Invalid request' });
  }
  if (!razorpayConfigured()) return send(res, 503, { error: 'Not configured' });
  if (!safeEqual(qrToken(orderId), token)) return send(res, 403, { error: 'Forbidden' });
  if (!validCheckoutSignature(orderId, paymentId, signature)) {
    console.warn('[pay-verify] rejected: invalid signature', orderId);
    return send(res, 400, { error: 'Payment could not be verified.' });
  }

  try {
    const [pay, order] = await Promise.all([
      rzp('GET', `/payments/${paymentId}`),
      rzp('GET', `/orders/${orderId}`),
    ]);
    if (pay.order_id !== orderId || Number(pay.amount) !== Number(order.amount) || pay.currency !== 'INR') {
      console.warn('[pay-verify] mismatch', orderId, paymentId, pay.order_id, pay.amount, order.amount);
      return send(res, 400, { error: 'Payment could not be verified.' });
    }
    if (pay.status === 'captured' || order.status === 'paid') return send(res, 200, { status: 'paid' });
    // Authorized = money taken, capture pending (auto-capture usually completes within seconds).
    if (pay.status === 'authorized') return send(res, 200, { status: 'processing' });
    return send(res, 200, { status: 'failed' });
  } catch (err) {
    console.error('[pay-verify] lookup failed:', err.status || '', err.message);
    return send(res, 502, { error: 'Could not confirm the payment yet.' });
  }
};
